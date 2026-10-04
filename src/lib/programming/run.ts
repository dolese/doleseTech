import type { CodeSample, LevelKey } from "./types";
import { LEVELS } from "./types";
import { getLevel } from "./index";
// Shared with the browser-side SQL runner, so both split statements identically.
import { splitSql } from "../../../public/runners/sql-split.mjs";

/**
 * What the in-browser "Run" button does for a code sample. Samples that need
 * things a browser can't provide (network libraries, threads, a JVM, a
 * TypeScript compiler, a server) get no spec and therefore no button.
 */
export type RunSpec =
  | { kind: "python"; main: string; source: string; files: { name: string; source: string }[]; usesInput: boolean }
  | { kind: "sql"; setup: string[]; source: string; slow: boolean }
  | { kind: "js"; source: string }
  | { kind: "page"; html: string; scripts: Record<string, string>; data: Record<string, string> };

export interface LessonRunSpecs {
  lesson: (RunSpec | undefined)[];
  solution: (RunSpec | undefined)[];
}

// ── Python ──────────────────────────────────────────────────────────────
// Network clients, servers, threads/processes and asyncio.run (which needs
// WebAssembly stack switching, not yet available in every browser).
const PY_UNSUPPORTED = /^\s*(?:import|from)\s+(requests|httpx|fastapi|psycopg|psycopg_pool|pydantic|pytest|concurrent|threading|multiprocessing|uvicorn|mypy|asyncio|pandas|argparse)\b/m;

function pythonSpec(sample: CodeSample, group: CodeSample[]): RunSpec | undefined {
  if (sample.lang !== "python" || !sample.filename.endsWith(".py")) return undefined;
  const base = sample.filename.split("/").pop()!;
  if (base.startsWith("test_") || sample.source.includes(">>>")) return undefined;
  const siblings = group.filter((c) => c !== sample && c.lang === "python" && c.filename.endsWith(".py") && !c.source.includes(">>>"));
  // A helper module that another file imports prints nothing on its own: run the importer instead.
  const moduleName = base.replace(/\.py$/, "");
  if (siblings.some((c) => new RegExp(`^\\s*(?:from\\s+${moduleName}\\s+import|import\\s+${moduleName}\\b)`, "m").test(c.source))) return undefined;
  if ([sample, ...siblings].some((c) => PY_UNSUPPORTED.test(c.source))) return undefined;
  return {
    kind: "python",
    main: base,
    source: sample.source.trim(),
    files: siblings.map((c) => ({ name: c.filename, source: c.source.trim() })),
    usesInput: /\binput\(/.test(sample.source),
  };
}

// ── SQL (PostgreSQL track) ──────────────────────────────────────────────
/** Tables filled with large generated data sets; replayed only when needed. */
const HEAVY_TABLES = ["exam_entries", "gate_log", "attendance", "payments_archive"];

interface SqlSample {
  level: LevelKey;
  slug: string;
  sample: CodeSample;
}

let sqlSamplesCache: SqlSample[] | undefined;

function sqlSamples(): SqlSample[] {
  if (sqlSamplesCache) return sqlSamplesCache;
  const out: SqlSample[] = [];
  for (const level of LEVELS) {
    for (const lesson of getLevel("postgresql", level)?.lessons ?? []) {
      for (const sample of [...lesson.code, ...(lesson.practice?.solution.code ?? [])]) {
        if (isRunnableSql(level, lesson.slug, sample)) out.push({ level, slug: lesson.slug, sample });
      }
    }
  }
  sqlSamplesCache = out;
  return out;
}

function isRunnableSql(level: LevelKey, slug: string, sample: CodeSample): boolean {
  if (sample.lang !== "sql") return false;
  if (sample.filename.startsWith("Session")) return false;           // needs two real connections
  if (level === "beginner" && slug === "setup" && sample.filename === "psql") return false; // CREATE DATABASE / \c
  return true;
}

const mentions = (sql: string, table: string) => new RegExp(`\\b${table}\\b`).test(sql);

/**
 * The SQL that must run before a sample so the database is in the state the
 * lesson assumes: every earlier sample of the same level (and, past the
 * beginner level, from the intermediate sample-database script onwards).
 * Statements touching large generated tables are skipped unless the sample
 * itself uses those tables, and read-only queries are skipped altogether.
 */
function sqlSetupFor(target: CodeSample): { setup: string[]; slow: boolean } | undefined {
  const all = sqlSamples();
  const idx = all.findIndex((s) => s.sample === target);
  if (idx === -1) return undefined;
  const level = all[idx].level;
  const start = level === "beginner"
    ? all.findIndex((s) => s.level === "beginner")
    : all.findIndex((s) => s.sample.filename === "school.sql");
  const needed = HEAVY_TABLES.filter((t) => mentions(target.source, t));
  const setup: string[] = [];
  for (let i = start; i < idx; i++) {
    for (const statement of splitSql(all[i].sample.source) as string[]) {
      const heavy = HEAVY_TABLES.filter((t) => mentions(statement, t));
      if (heavy.length && !heavy.some((t) => needed.includes(t))) continue;
      // Plain reads don't change the database, so replaying them is wasted time.
      if (/^(?:--[^\n]*\n\s*)*(SELECT|EXPLAIN)\b/i.test(statement) && !/\b(set_config|pg_advisory|nextval)\b/i.test(statement)) continue;
      setup.push(statement);
    }
  }
  return { setup, slow: needed.length > 0 };
}

// ── JavaScript (JavaScript track) ───────────────────────────────────────
const BROWSER_ONLY = /\b(document|window|localStorage|sessionStorage|customElements|HTMLElement|navigator|location|requestAnimationFrame|IntersectionObserver)\b|\bself\.|\bnew Worker\b|^\s*(import|export)\b|\bfetch\(/m;

function jsSpec(sample: CodeSample): RunSpec | undefined {
  if (sample.lang !== "js" || !sample.filename.endsWith(".js")) return undefined;
  if (BROWSER_ONLY.test(sample.source)) return undefined;
  return { kind: "js", source: sample.source.trim() };
}

/** A whole page (index.html plus the classic scripts and data files it uses). */
function pageSpec(sample: CodeSample, group: CodeSample[]): RunSpec | undefined {
  if (sample.lang !== "html" || sample.filename !== "index.html") return undefined;
  const html = sample.source.trim();
  if (/type="module"/.test(html)) return undefined;                  // ES module imports can't resolve in a sandbox
  if (/Content-Security-Policy/i.test(html)) return undefined;       // its own policy would block the inlined scripts
  const scripts: Record<string, string> = {};
  for (const m of html.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)) {
    const file = group.find((c) => c.filename === m[1] && c.lang === "js");
    if (!file) return undefined;
    scripts[m[1]] = file.source.trim();
  }
  if (Object.keys(scripts).length === 0) return undefined;
  const data: Record<string, string> = {};
  for (const c of group) if (c.lang === "json" && c.filename.endsWith(".json")) data[c.filename] = c.source.trim();
  return { kind: "page", html, scripts, data };
}

/** Run specs for every code sample in a lesson and its solution, in order. */
export function runSpecsFor(langSlug: string, level: LevelKey, lessonSlug: string): LessonRunSpecs {
  const lesson = getLevel(langSlug, level)?.lessons.find((l) => l.slug === lessonSlug);
  const groups = { lesson: lesson?.code ?? [], solution: lesson?.practice?.solution.code ?? [] };

  const specFor = (sample: CodeSample, group: CodeSample[]): RunSpec | undefined => {
    switch (langSlug) {
      case "python":
        return pythonSpec(sample, group);
      case "javascript":
        return jsSpec(sample) ?? pageSpec(sample, group);
      case "postgresql": {
        if (!isRunnableSql(level, lessonSlug, sample)) return undefined;
        const s = sqlSetupFor(sample);
        return s && { kind: "sql", source: sample.source.trim(), ...s };
      }
      default:
        return undefined;   // TypeScript and Java need compilers/runtimes not available in the browser
    }
  };

  return {
    lesson: groups.lesson.map((c) => specFor(c, groups.lesson)),
    solution: groups.solution.map((c) => specFor(c, groups.solution)),
  };
}
