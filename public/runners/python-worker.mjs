// Background worker that runs Python with Pyodide (served from /vendor/pyodide).
import { loadPyodide } from "/vendor/pyodide/pyodide.mjs";
import { runPython } from "./python-run.mjs";

let ready;

self.addEventListener("message", async ({ data }) => {
  const { id, spec, input } = data;
  const post = (msg) => self.postMessage({ id, ...msg });
  try {
    if (!ready) {
      post({ type: "status", text: "Loading Python (first run downloads about 13 MB)…" });
      ready = loadPyodide({ indexURL: "/vendor/pyodide/" });
    }
    const pyodide = await ready;
    post({ type: "status", text: "Running…" });
    const { ok } = await runPython(pyodide, { ...spec, input }, (text) => post({ type: "out", text }));
    post({ type: "done", ok });
  } catch (err) {
    post({ type: "out", text: "\n[Runner error] " + (err?.message ?? err) + "\n" });
    post({ type: "done", ok: false });
  }
});
