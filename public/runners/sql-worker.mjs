// Background worker that runs SQL in PGlite, PostgreSQL compiled to WebAssembly
// (served from /vendor/pglite). Each run starts from a fresh database prepared
// with the earlier lessons' statements, so results match the lesson.
import { PGlite } from "/vendor/pglite/index.js";
import { splitSql } from "./sql-split.mjs";

const MAX_ROWS = 100;
let cached = { key: null, snapshot: null };

async function prepared(setup, post) {
  const key = setup.join("\n;\n");
  if (cached.key === key && cached.snapshot) {
    return PGlite.create({ loadDataDir: cached.snapshot });
  }
  post({ type: "status", text: "Starting PostgreSQL (first run downloads about 17 MB)…" });
  const db = await PGlite.create();
  for (let i = 0; i < setup.length; i++) {
    if (i % 10 === 0) post({ type: "status", text: `Preparing the course database: replaying earlier lessons (${i}/${setup.length})…` });
    try { await db.exec(setup[i]); } catch { /* earlier lessons include deliberate errors */ }
  }
  try {
    cached = { key, snapshot: await db.dumpDataDir("none") };
  } catch {
    cached = { key: null, snapshot: null };
  }
  return db;
}

self.addEventListener("message", async ({ data }) => {
  const { id, setup, source } = data;
  const post = (msg) => self.postMessage({ id, ...msg });
  let db;
  try {
    db = await prepared(setup, post);
    post({ type: "status", text: "Running…" });
    for (const statement of splitSql(source)) {
      const started = performance.now();
      try {
        const res = await db.query(statement, [], { rowMode: "array" });
        post({
          type: "result",
          statement,
          fields: res.fields.map((f) => f.name),
          rows: res.rows.slice(0, MAX_ROWS).map((r) => r.map((v) => (v === null ? null : typeof v === "object" ? JSON.stringify(v) : String(v)))),
          totalRows: res.rows.length,
          affectedRows: res.affectedRows ?? 0,
          ms: Math.round(performance.now() - started),
        });
      } catch (err) {
        post({ type: "error", statement, message: err?.message ?? String(err) });
      }
    }
    post({ type: "done", ok: true });
  } catch (err) {
    post({ type: "error", statement: "", message: "Runner error: " + (err?.message ?? err) });
    post({ type: "done", ok: false });
  } finally {
    await db?.close().catch(() => {});
  }
});
