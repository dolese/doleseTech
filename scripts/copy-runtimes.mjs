// Copies the in-browser code runtimes (Pyodide for Python, PGlite for
// PostgreSQL) from node_modules into public/vendor, so the site serves them
// from its own origin. Runs automatically before `next dev` and `next build`.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const vendor = join(root, "public", "vendor");

function copy(fromDir, toDir, keep) {
  rmSync(toDir, { recursive: true, force: true });
  mkdirSync(toDir, { recursive: true });
  let count = 0;
  for (const name of readdirSync(fromDir)) {
    if (keep(name)) {
      cpSync(join(fromDir, name), join(toDir, name), { recursive: true });
      count++;
    }
  }
  return count;
}

const pyodide = join(root, "node_modules", "pyodide");
const pglite = join(root, "node_modules", "@electric-sql", "pglite", "dist");
if (!existsSync(pyodide) || !existsSync(pglite)) {
  console.error("copy-runtimes: run `npm install` first");
  process.exit(1);
}

const py = copy(pyodide, join(vendor, "pyodide"), (n) =>
  ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"].includes(n));
const pg = copy(pglite, join(vendor, "pglite"), (n) =>
  n === "index.js" || /^chunk-[A-Z0-9]+\.js$/.test(n) || ["initdb.wasm", "pglite.wasm", "pglite.data", "fs"].includes(n));

console.log(`copy-runtimes: ${py} Pyodide files, ${pg} PGlite files -> public/vendor`);
