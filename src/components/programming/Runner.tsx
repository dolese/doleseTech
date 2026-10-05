"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import type { RunSpec } from "@/lib/programming/run";

type SqlResult =
  | { kind: "result"; statement: string; fields: string[]; rows: (string | null)[][]; totalRows: number; affectedRows: number }
  | { kind: "error"; statement: string; message: string };

const TIMEOUT_MS = { python: 30_000, js: 10_000, sql: 180_000 } as const;

// One long-lived worker per runtime, shared by every Run button on the page.
const workers: Partial<Record<"python" | "sql", Worker>> = {};
function workerFor(kind: "python" | "sql" | "js"): Worker {
  const url = `/runners/${kind}-worker.mjs`;
  if (kind === "js") return new Worker(url, { type: "module" });     // fresh each run: user code changes globals
  workers[kind] ??= new Worker(url, { type: "module" });
  return workers[kind]!;
}
function discardWorker(kind: "python" | "sql" | "js", w: Worker) {
  w.terminate();
  if (kind !== "js" && workers[kind] === w) delete workers[kind];
}

let nextRunId = 1;

export default function Runner({ spec }: { spec: RunSpec }) {
  if (spec.kind === "page") return <PageRunner spec={spec} />;
  return <CodeRunner spec={spec} />;
}

function CodeRunner({ spec }: { spec: Exclude<RunSpec, { kind: "page" }> }) {
  const original = spec.source;
  const [code, setCode] = useState(original);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState("");
  const [sql, setSql] = useState<SqlResult[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const active = useRef<{ worker: Worker; timer: ReturnType<typeof setTimeout>; cleanup: () => void } | null>(null);

  useEffect(() => () => {
    if (active.current) clearTimeout(active.current.timer);
  }, []);

  const finish = () => {
    if (active.current) clearTimeout(active.current.timer);
    active.current = null;
    setRunning(false);
    setStatus("");
  };

  const stop = (reason: string) => {
    if (!active.current) return;
    active.current.cleanup();
    discardWorker(spec.kind, active.current.worker);
    setOutput((o) => o + `\n[${reason}]\n`);
    finish();
  };

  const run = () => {
    track("Code run", { kind: spec.kind, page: window.location.pathname });
    const id = nextRunId++;
    const worker = workerFor(spec.kind);
    setRunning(true);
    setHasRun(true);
    setOutput("");
    setSql([]);
    setStatus(spec.kind === "sql" && spec.slow ? "This example generates a lot of data — it can take 10–30 seconds…" : "Starting…");

    const cleanup = () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };
    const onError = (e: ErrorEvent) => {
      cleanup();
      setOutput((o) => o + `\n[Could not start the runner: ${e.message || "unknown error"}]\n`);
      discardWorker(spec.kind, worker);
      finish();
    };
    const onMessage = ({ data }: MessageEvent) => {
      if (data.id !== id) return;
      if (data.type === "status") setStatus(data.text);
      else if (data.type === "out") setOutput((o) => o + data.text);
      else if (data.type === "result") setSql((r) => [...r, { kind: "result", ...data }]);
      else if (data.type === "error") setSql((r) => [...r, { kind: "error", statement: data.statement, message: data.message }]);
      else if (data.type === "done") {
        cleanup();
        if (spec.kind === "js") worker.terminate();
        finish();
      }
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);

    const timer = setTimeout(() => {
      cleanup();
      stop(`Stopped after ${TIMEOUT_MS[spec.kind] / 1000} seconds — is there an endless loop?`);
    }, TIMEOUT_MS[spec.kind]);
    active.current = { worker, timer, cleanup };

    if (spec.kind === "python") worker.postMessage({ id, spec: { ...spec, source: code }, input });
    else if (spec.kind === "sql") worker.postMessage({ id, setup: spec.setup, source: code });
    else worker.postMessage({ id, source: code });
  };

  const label = spec.kind === "python" ? "Python" : spec.kind === "sql" ? "PostgreSQL" : "JavaScript";

  return (
    <div className="runner">
      <div className="runner-bar">
        {running ? (
          <button type="button" className="runner-btn is-stop" onClick={() => stop("Stopped")}>■ Stop</button>
        ) : (
          <button type="button" className="runner-btn" onClick={run}>▶ Run</button>
        )}
        <button type="button" className="runner-link" onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
          {editing ? "Hide editor" : "Edit code"}
        </button>
        {code !== original && (
          <button type="button" className="runner-link" onClick={() => setCode(original)}>Reset to original</button>
        )}
        <span className="runner-note">Runs in your browser · {label}</span>
      </div>

      {editing && (
        <textarea
          className="runner-editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={Math.min(24, Math.max(6, code.split("\n").length + 1))}
          aria-label="Edit code"
        />
      )}

      {spec.kind === "python" && spec.usesInput && (
        <label className="runner-input">
          <span>Input — this program uses <code>input()</code>. Type one answer per line:</span>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} spellCheck={false} />
        </label>
      )}

      {hasRun && (
        <div className="runner-output" aria-live="polite">
          {status && <p className="runner-status">{status}</p>}
          {spec.kind === "sql" ? <SqlOutput results={sql} /> : output && <pre>{output}</pre>}
          {!running && spec.kind !== "sql" && !output && <p className="runner-status">(no output)</p>}
        </div>
      )}
    </div>
  );
}

function SqlOutput({ results }: { results: SqlResult[] }) {
  return (
    <div className="runner-sql">
      {results.map((r, i) => (
        <div key={i} className={`runner-sql-item ${r.kind === "error" ? "is-error" : ""}`}>
          {r.statement && <p className="runner-sql-stmt">{firstLine(r.statement)}</p>}
          {r.kind === "error" ? (
            <p className="runner-sql-msg">ERROR: {r.message}</p>
          ) : r.fields.length > 0 ? (
            <>
              <div className="runner-table-wrap">
                <table className="runner-table">
                  <thead>
                    <tr>{r.fields.map((f, j) => <th key={j}>{f}</th>)}</tr>
                  </thead>
                  <tbody>
                    {r.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((v, k) => <td key={k} className={v === null ? "is-null" : undefined}>{v ?? "NULL"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="runner-sql-meta">
                {r.totalRows} row{r.totalRows === 1 ? "" : "s"}
                {r.totalRows > r.rows.length ? ` (showing the first ${r.rows.length})` : ""}
              </p>
            </>
          ) : (
            <p className="runner-sql-meta">OK{r.affectedRows ? ` — ${r.affectedRows} row${r.affectedRows === 1 ? "" : "s"} affected` : ""}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function firstLine(statement: string): string {
  const line = statement.split("\n").find((l) => l.trim() && !l.trim().startsWith("--")) ?? statement;
  return line.trim().length > 90 ? line.trim().slice(0, 90) + "…" : line.trim();
}

// ── Whole-page preview (JavaScript DOM lessons) ─────────────────────────

const escapeScript = (code: string) => code.replace(/<\/script/gi, "<\\/script");

function buildPage(spec: Extract<RunSpec, { kind: "page" }>, token: string, stored: Record<string, string>): string {
  // Runs first inside the frame: forwards console output to this page, stands
  // in for localStorage (unavailable in a sandbox) and serves the lesson's
  // data files to fetch().
  const prelude = `<script>(() => {
  const TOKEN = ${JSON.stringify(token)};
  const send = (msg) => parent.postMessage({ __runner: TOKEN, ...msg }, "*");
  const fmt = (v) => typeof v === "string" ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
  for (const level of ["log", "info", "warn", "error"]) {
    const orig = console[level].bind(console);
    console[level] = (...args) => { send({ level, text: args.map(fmt).join(" ") }); orig(...args); };
  }
  addEventListener("error", (e) => send({ level: "error", text: "Uncaught " + e.message }));
  addEventListener("unhandledrejection", (e) => send({ level: "error", text: "Uncaught (in promise) " + (e.reason && e.reason.message || e.reason) }));
  const data = new Map(Object.entries(${escapeScript(JSON.stringify(stored))}));
  const sync = () => send({ storage: Object.fromEntries(data) });
  const storage = {
    getItem: (k) => data.has(String(k)) ? data.get(String(k)) : null,
    setItem: (k, v) => { data.set(String(k), String(v)); sync(); },
    removeItem: (k) => { data.delete(String(k)); sync(); },
    clear: () => { data.clear(); sync(); },
    key: (i) => [...data.keys()][i] ?? null,
    get length() { return data.size; },
  };
  Object.defineProperty(window, "localStorage", { value: storage, configurable: true });
  Object.defineProperty(window, "sessionStorage", { value: storage, configurable: true });
  const files = ${escapeScript(JSON.stringify(spec.data))};
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (/^[a-z]+:/i.test(url)) return realFetch(input, init);
    const name = url.replace(/^\\.\\//, "");
    return name in files
      ? new Response(files[name], { status: 200, headers: { "Content-Type": "application/json" } })
      : new Response("Not found", { status: 404, statusText: "Not Found" });
  };
})();<\/script>`;

  let html = spec.html.replace(/<script\s+src="[^"]+"[^>]*><\/script>\s*/g, "");
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + prelude) : prelude + html;
  const scripts = Object.entries(spec.scripts)
    .map(([name, code]) => `<script>/* ${name} */\n${escapeScript(code)}\n<\/script>`)
    .join("\n");
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, scripts + "\n</body>") : html + scripts;
}

function PageRunner({ spec }: { spec: Extract<RunSpec, { kind: "page" }> }) {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ level: string; text: string }[]>([]);
  const token = useRef(Math.random().toString(36).slice(2));
  const stored = useRef<Record<string, string>>({});
  const [runCount, setRunCount] = useState(0);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.__runner !== token.current) return;
      if (e.data.storage) stored.current = e.data.storage;
      else setLogs((l) => [...l, { level: e.data.level, text: e.data.text }]);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const run = (keepData: boolean) => {
    track("Code run", { kind: "page", page: window.location.pathname });
    if (!keepData) stored.current = {};
    setLogs([]);
    setRunCount((n) => n + 1);
    setSrcDoc(buildPage(spec, token.current, stored.current));
  };

  return (
    <div className="runner">
      <div className="runner-bar">
        <button type="button" className="runner-btn" onClick={() => run(srcDoc !== null)}>
          ▶ {srcDoc ? "Reload page" : "Run page"}
        </button>
        {srcDoc && (
          <button type="button" className="runner-link" onClick={() => run(false)}>Clear saved data &amp; reload</button>
        )}
        <span className="runner-note">Live preview in a sandboxed frame</span>
      </div>
      {srcDoc && (
        <div className="runner-output">
          <iframe
            key={runCount}
            className="runner-frame"
            title="Page preview"
            sandbox="allow-scripts allow-forms"
            srcDoc={srcDoc}
          />
          <div className="runner-console">
            <p className="runner-console-title">Console</p>
            {logs.length === 0 ? (
              <p className="runner-status">(nothing logged yet)</p>
            ) : (
              <pre>{logs.map((l) => (l.level === "error" ? "✖ " : l.level === "warn" ? "⚠ " : "") + l.text).join("\n")}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
