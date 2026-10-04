// Runs one Python program in a loaded Pyodide instance. Shared by the browser
// worker and the Node test suite so both exercise exactly the same steps.
//   files: sibling modules written next to the program (e.g. grading.py)
//   input: text typed into the Input box; each line answers one input() call
//   write: receives every chunk of stdout/stderr as it is produced
export async function runPython(pyodide, { main, source, files = [], input = "" }, write) {
  const decoder = new TextDecoder();
  const sink = { write: (bytes) => { write(decoder.decode(bytes)); return bytes.length; } };
  pyodide.setStdout(sink);
  pyodide.setStderr(sink);

  const lines = input.split("\n");
  if (lines.at(-1) === "") lines.pop();
  let ranOutOfInput = false;
  pyodide.setStdin({
    stdin: () => {
      if (lines.length === 0) {
        ranOutOfInput = true;
        return undefined;           // end of input: input() raises EOFError
      }
      const line = lines.shift();
      write(line + "\n");          // echo, as a terminal would
      return line;
    },
    autoEOF: true,
  });

  // A clean working folder for every run, so files from earlier runs don't leak in.
  const dir = "/home/pyodide/run-" + Date.now();
  pyodide.FS.mkdirTree(dir);
  pyodide.FS.chdir(dir);
  for (const f of files) {
    const path = dir + "/" + f.name;
    pyodide.FS.mkdirTree(path.slice(0, path.lastIndexOf("/")));
    pyodide.FS.writeFile(path, f.source);
  }
  pyodide.FS.writeFile(dir + "/" + main, source);

  // Fresh module state: forget sibling modules imported by a previous run.
  pyodide.runPython(`
import sys, importlib
sys.path[:] = [p for p in sys.path if not p.startswith("/home/pyodide/run-")]
sys.path.insert(0, ${JSON.stringify(dir)})
for name in [m for m, mod in list(sys.modules.items()) if getattr(mod, "__file__", "") and str(mod.__file__).startswith("/home/pyodide/run-")]:
    del sys.modules[name]
importlib.invalidate_caches()
`);

  try {
    await pyodide.runPythonAsync(`
import runpy
runpy.run_path(${JSON.stringify(dir + "/" + main)}, run_name="__main__")
`);
    return { ok: true };
  } catch (err) {
    // Show the Python traceback, without Pyodide's own internal frames.
    const text = String(err.message ?? err);
    const userPart = text.includes('File "' + dir) ? text.slice(text.indexOf('File "' + dir) - 2) : text;
    if (ranOutOfInput && /EOFError/.test(text)) {
      write("\n\n[The program asked for more input than you typed. Add one line per answer to the Input box, then run again.]\n");
    } else {
      const cleaned = userPart.replace(/^\s*Traceback \(most recent call last\):\n/, "").replaceAll(dir + "/", "");
      write("\n" + "Traceback (most recent call last):\n" + cleaned);
    }
    return { ok: false };
  }
}
