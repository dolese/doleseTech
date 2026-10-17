// Runs every SQL example in a handbook chapter, in order, on a fresh
// PostgreSQL (PGlite: real PostgreSQL compiled to WebAssembly), and compares
// what it prints with the result blocks in the chapter.
//
//   node scripts/handbook-sql.mjs 04-databases-with-sql            check
//   node scripts/handbook-sql.mjs 04-databases-with-sql --write    rewrite results
//
// In the chapter, a ```sql block is run. An ```output block straight after
// it shows what the SQL Shell (psql) prints for it; an output that starts
// with "ERROR:" means the statement must fail with exactly that error.
// Other blocks (```text, ```bash) are not run.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { splitSql } from "../public/runners/sql-split.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
export const chapterPath = (name) => join(root, "src", "content", "handbook", `${name}.md`);

const NUMERIC_TYPES = new Set([20, 21, 23, 700, 701, 1700]);
const FENCE = /^```(\w*)\n([\s\S]*?)^```$/gm;

/** Fenced blocks in order, with where each sits in the Markdown. */
function blocks(markdown) {
  return [...markdown.matchAll(FENCE)].map((m) => ({
    lang: m[1],
    body: m[2],
    start: m.index,
    end: m.index + m[0].length,
  }));
}

function cell(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/** A result laid out like psql's default "aligned" format. */
function table(result) {
  const names = result.fields.map((f) => f.name);
  const right = result.fields.map((f) => NUMERIC_TYPES.has(f.dataTypeID));
  // Rows come as arrays: two columns may share a name.
  const rows = result.rows.map((row) => row.map(cell));
  const widths = names.map((n, i) => Math.max(n.length, ...rows.map((r) => r[i].length)));
  const centre = (text, w) => {
    const left = Math.floor((w - text.length) / 2);
    return " ".repeat(left) + text + " ".repeat(w - text.length - left);
  };
  const line = (cells) => cells.map((c) => ` ${c} `).join("|").replace(/\s+$/, "");
  const out = [
    line(names.map((n, i) => centre(n, widths[i]))),
    widths.map((w) => "-".repeat(w + 2)).join("+"),
    ...rows.map((r) => line(r.map((c, i) => (right[i] ? c.padStart(widths[i]) : c.padEnd(widths[i]))))),
    `(${rows.length} ${rows.length === 1 ? "row" : "rows"})`,
  ];
  return out.join("\n");
}

/** What psql prints after a statement that returns no rows. */
function commandTag(statement, result) {
  const sql = statement.replace(/^(\s*--[^\n]*\n)*/, "").trim();
  const words = sql.split(/\s+/).map((w) => w.toUpperCase());
  const n = result.affectedRows ?? 0;
  if (words[0] === "INSERT") return `INSERT 0 ${n}`;
  if (words[0] === "UPDATE" || words[0] === "DELETE") return `${words[0]} ${n}`;
  if (words[0] === "CREATE" && words[1] === "OR" && words[2] === "REPLACE") return `CREATE ${words[3]}`;
  if (words[0] === "CREATE" || words[0] === "DROP" || words[0] === "ALTER") return `${words[0]} ${words[1]}`;
  return words[0].replace(/;$/, "");
}

async function run(db, statement) {
  try {
    const result = await db.query(statement, [], { rowMode: "array" });
    return result.fields.length ? table(result) : commandTag(statement, result);
  } catch (error) {
    if (error.severity !== "ERROR") throw error;
    return `ERROR:  ${error.message}` + (error.detail ? `\nDETAIL:  ${error.detail}` : "");
  }
}

/**
 * Runs the chapter. Returns one entry per ```output block: what the chapter
 * prints and what PostgreSQL actually produced.
 */
export async function runChapter(markdown) {
  const db = new PGlite();
  const all = blocks(markdown);
  const checks = [];
  for (let i = 0; i < all.length; i++) {
    const block = all[i];
    if (block.lang !== "sql") continue;
    const outputs = [];
    for (const statement of splitSql(block.body)) outputs.push(await run(db, statement));
    const next = all[i + 1];
    const between = next ? markdown.slice(block.end, next.start) : "";
    if (next?.lang === "output" && between.trim() === "") {
      checks.push({ sql: block.body, expected: next.body.trimEnd(), actual: outputs.join("\n\n"), block: next });
    } else {
      const failed = outputs.find((o) => o.startsWith("ERROR:"));
      if (failed) checks.push({ sql: block.body, expected: "(no error)", actual: failed, block: null });
    }
  }
  await db.close();
  return checks;
}

// No top-level await: the tests load this file as CommonJS.
async function main() {
  const name = process.argv[2];
  const write = process.argv.includes("--write");
  const path = chapterPath(name);
  let markdown = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const checks = await runChapter(markdown);
  let wrong = 0;
  // Rewrite from the end so earlier positions stay valid.
  for (const check of [...checks].reverse()) {
    if (check.expected === check.actual) continue;
    wrong++;
    if (write && check.block) {
      const fenced = "```output\n" + check.actual + "\n```";
      markdown = markdown.slice(0, check.block.start) + fenced + markdown.slice(check.block.end);
    } else {
      console.log(`--- ${check.sql.trim().split("\n")[0]}\nexpected:\n${check.expected}\nactual:\n${check.actual}\n`);
    }
  }
  if (write) writeFileSync(path, markdown);
  console.log(`${checks.length} results checked, ${wrong} ${write ? "rewritten" : "different"}.`);
  if (wrong && !write) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
