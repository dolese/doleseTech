// Background worker that runs plain JavaScript (no DOM) and captures console
// output. It has its own scoped Content-Security-Policy allowing evaluation;
// the site's pages keep their strict policy.
const format = (value, depth = 0) => {
  if (typeof value === "string") return depth === 0 ? value : `'${value}'`;
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return typeof value === "function" ? `[Function: ${value.name || "anonymous"}]` : String(value);
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (depth > 3) return Array.isArray(value) ? "[Array]" : "[Object]";
  if (Array.isArray(value)) return value.length ? `[ ${value.map((v) => format(v, depth + 1)).join(", ")} ]` : "[]";
  if (value instanceof Map) return `Map(${value.size}) { ${[...value].map(([k, v]) => `${format(k, depth + 1)} => ${format(v, depth + 1)}`).join(", ")} }`;
  if (value instanceof Set) return `Set(${value.size}) { ${[...value].map((v) => format(v, depth + 1)).join(", ")} }`;
  const entries = Object.entries(value).map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`}: ${format(v, depth + 1)}`);
  const name = value.constructor && value.constructor !== Object ? value.constructor.name + " " : "";
  return entries.length ? `${name}{ ${entries.join(", ")} }` : `${name}{}`;
};

self.addEventListener("message", ({ data }) => {
  const { id, source } = data;
  const post = (msg) => self.postMessage({ id, ...msg });
  const write = (prefix) => (...args) => post({ type: "out", text: prefix + args.map((a) => format(a)).join(" ") + "\n" });
  console.log = console.info = write("");
  console.warn = write("⚠ ");
  console.error = write("✖ ");

  // Track timers so we know when asynchronous work has finished.
  let pending = 0;
  const realSetTimeout = self.setTimeout.bind(self);
  const realClearTimeout = self.clearTimeout.bind(self);
  const realSetInterval = self.setInterval.bind(self);
  const realClearInterval = self.clearInterval.bind(self);
  const live = new Set();
  self.setTimeout = (fn, ms, ...a) => {
    pending++;
    const t = realSetTimeout(() => { live.delete(t); pending--; fn(...a); }, ms);
    live.add(t);
    return t;
  };
  self.clearTimeout = (t) => { if (live.delete(t)) pending--; realClearTimeout(t); };
  self.setInterval = (fn, ms, ...a) => { pending++; const t = realSetInterval(fn, ms, ...a); live.add(t); return t; };
  self.clearInterval = (t) => { if (live.delete(t)) pending--; realClearInterval(t); };

  self.addEventListener("unhandledrejection", (e) => post({ type: "out", text: "✖ Uncaught (in promise) " + format(e.reason) + "\n" }));
  self.addEventListener("error", (e) => {
    post({ type: "out", text: "✖ Uncaught " + (e.error ? format(e.error) : e.message) + "\n" });
    e.preventDefault();
  });
  try {
    new Function(source)();
  } catch (err) {
    post({ type: "out", text: "✖ Uncaught " + format(err) + "\n" });
  }
  // Finished once no timers remain (checked after microtasks have run).
  const check = () => (pending <= 0 ? post({ type: "done", ok: true }) : realSetTimeout(check, 25));
  realSetTimeout(check, 0);
});
