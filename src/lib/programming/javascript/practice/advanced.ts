import type { Practice } from "../../types";

export const advanced: Record<string, Practice> = {
  "event-loop": {
    solution: {
      notes: [
        "A single `sort()` call on 2 million numbers can't be interrupted. Scores are whole numbers from 0 to 100, so a counting sort works and splits naturally into chunks: count in slices of 100,000 values, then rebuild the sorted array, yielding to the browser between slices. The progress bar is updated in `requestAnimationFrame`, and the counter keeps ticking because the page never freezes.",
      ],
      code: [
        {
          filename: "index.html",
          lang: "html",
          source: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Chunked sort</title>
    <script src="app.js" defer></script>
  </head>
  <body>
    <button id="sort">Sort 2 million scores</button>
    <progress id="progress" max="1" value="0"></progress>
    <p>Ticks while sorting: <span id="ticks">0</span></p>
    <p id="result"></p>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const CHUNK = 100_000;
const progressEl = document.querySelector("#progress");
const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));

let ticks = 0;
setInterval(() => { document.querySelector("#ticks").textContent = ++ticks; }, 50);

function showProgress(fraction) {
  requestAnimationFrame(() => { progressEl.value = fraction; });
}

async function countingSort(values) {
  const counts = new Uint32Array(101);
  for (let start = 0; start < values.length; start += CHUNK) {
    const end = Math.min(start + CHUNK, values.length);
    for (let i = start; i < end; i++) counts[values[i]]++;
    showProgress((end / values.length) * 0.5);
    await yieldToBrowser();
  }
  const sorted = new Uint8Array(values.length);
  let pos = 0;
  for (let score = 0; score <= 100; score++) {
    sorted.fill(score, pos, pos + counts[score]);
    pos += counts[score];
    if (score % 10 === 0) {
      showProgress(0.5 + (pos / values.length) * 0.5);
      await yieldToBrowser();
    }
  }
  showProgress(1);
  return sorted;
}

document.querySelector("#sort").addEventListener("click", async () => {
  const scores = Uint8Array.from({ length: 2_000_000 }, () => Math.floor(Math.random() * 101));
  const started = performance.now();
  const sorted = await countingSort(scores);
  document.querySelector("#result").textContent =
    \`Sorted \${sorted.length.toLocaleString("en-US")} scores in \${Math.round(performance.now() - started)} ms: \` +
    \`lowest \${sorted[0]}, median \${sorted[sorted.length / 2]}, highest \${sorted[sorted.length - 1]}\`;
});
`,
        },
      ],
    },
    quiz: [
      {
        question: "In what order do these run? A: `setTimeout(..., 0)`, B: `Promise.resolve().then(...)`, C: plain `console.log`",
        options: ["A, B, C", "C, B, A", "B, A, C", "C, A, B"],
        answer: 1,
        explanation: "Synchronous code, then all microtasks (Promise callbacks), then the next task (the timer).",
      },
      {
        question: "Why does a long loop freeze the page?",
        options: [
          "Loops are slow in JavaScript",
          "The browser limits loops to one second",
          "JavaScript, input handling and painting share one main thread",
          "It uses too much memory",
        ],
        answer: 2,
        explanation: "Nothing else can happen until the running code finishes.",
      },
      {
        question: "When does a `requestAnimationFrame` callback run?",
        options: [
          "Just before the browser paints the next frame",
          "Immediately",
          "After all timers",
          "Only when the tab is hidden",
        ],
        answer: 0,
        explanation: "It's the right place for visual updates, and it pauses in background tabs.",
      },
      {
        question: "How can you keep the page responsive during long work without a Worker?",
        options: [
          "Use `var` instead of `let`",
          "Wrap the work in `async`",
          "Add more `console.log` calls",
          "Split the work into chunks and yield to the browser between them",
        ],
        answer: 3,
        explanation: "`async` alone doesn't help; yielding (e.g. `await setTimeout`) lets events and painting run.",
      },
    ],
  },

  "iterators-and-generators": {
    solution: {
      notes: [
        "`chunked` and `range` are ordinary generators. `fetchPages` is an async generator that \"fetches\" one page at a time and stops when a page comes back short; `for await` collects every record without knowing how many pages there are.",
      ],
      code: [
        {
          filename: "generators-solution.js",
          lang: "js",
          source: `
function* chunked(array, size) {
  for (let i = 0; i < array.length; i += size) yield array.slice(i, i + size);
}

function* range(start, end, step = 1) {
  for (let n = start; step > 0 ? n < end : n > end; n += step) yield n;
}

console.log([...chunked([1, 2, 3, 4, 5], 2)]);     // [ [ 1, 2 ], [ 3, 4 ], [ 5 ] ]
console.log([...range(0, 10, 3)], [...range(5, 0, -2)]);   // [ 0, 3, 6, 9 ] [ 5, 3, 1 ]

const records = Array.from({ length: 25 }, (_, i) => \`record \${i + 1}\`);

async function fakeApi(page, perPage) {
  await new Promise((r) => setTimeout(r, 10));
  return records.slice((page - 1) * perPage, page * perPage);
}

async function* fetchPages(perPage = 10) {
  for (let page = 1; ; page++) {
    const items = await fakeApi(page, perPage);
    yield { page, items };
    if (items.length < perPage) return;           // last page
  }
}

(async () => {
  const all = [];
  for await (const { page, items } of fetchPages()) {
    console.log(\`page \${page}: \${items.length} records\`);
    all.push(...items);
  }
  console.log(all.length, all.at(-1));            // 25 record 25
})();
`,
        },
      ],
    },
    quiz: [
      {
        question: "What makes an object work with `for...of` and spread `[...x]`?",
        options: [
          "Having a `length` property",
          "Being created with `new`",
          "Having a `[Symbol.iterator]` method",
          "Extending Array",
        ],
        answer: 2,
        explanation: "Anything implementing the iterator protocol is iterable.",
      },
      {
        question: "What does `yield` do in a generator function?",
        options: [
          "Ends the program",
          "Hands out one value and pauses until the next value is requested",
          "Returns all values at once",
          "Throws an error",
        ],
        answer: 1,
        explanation: "Generators resume exactly where they paused.",
      },
      {
        question: "Why can a generator describe an infinite sequence safely?",
        options: [
          "Values are produced lazily, only as far as the consumer asks",
          "JavaScript has infinite memory",
          "Generators stop after 1,000 values",
          "They run in a Worker",
        ],
        answer: 0,
        explanation: "Combine it with something like `take(n)` and only n values are ever computed.",
      },
      {
        question: "Which loop consumes an async generator?",
        options: ["`for...in`", "`forEach`", "`while (true)`", "`for await...of`"],
        answer: 3,
        explanation: "`for await` waits for each value the async generator yields.",
      },
    ],
  },

  "proxies-and-reactivity": {
    solution: {
      notes: [
        "The deep version wraps nested objects in Proxies too, lazily — the `get` trap returns a reactive wrapper whenever it reads an object, so `state.classes[0].count += 1` passes through a `set` trap and schedules a render. The page subscribes once and redraws whenever anything changes.",
      ],
      code: [
        {
          filename: "index.html",
          lang: "html",
          source: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Reactive attendance</title>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <p>Present: <strong id="present"></strong> · Absent: <strong id="absent"></strong></p>
    <button id="arrive">Student arrived</button>
    <button id="absentee">Mark absent</button>
    <ul id="classes"></ul>
    <button id="form4">+1 in Form 4</button>
    <p>Renders: <span id="renders">0</span></p>
  </body>
</html>
`,
        },
        {
          filename: "main.js",
          lang: "js",
          source: `
function createDeepStore(initial) {
  const listeners = new Set();
  let scheduled = false;

  const notify = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      for (const fn of listeners) fn(state);
    });
  };

  const cache = new WeakMap();
  const reactive = (obj) => {
    if (cache.has(obj)) return cache.get(obj);
    const proxy = new Proxy(obj, {
      get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);
        return value !== null && typeof value === "object" ? reactive(value) : value;
      },
      set(target, key, value, receiver) {
        const ok = Reflect.set(target, key, value, receiver);
        notify();
        return ok;
      },
    });
    cache.set(obj, proxy);
    return proxy;
  };

  const state = reactive(structuredClone(initial));
  return { state, subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)) };
}

const store = createDeepStore({
  present: 0,
  absent: 0,
  classes: [{ name: "Form 4", count: 30 }, { name: "Form 3", count: 28 }],
});

let renders = 0;
store.subscribe((s) => {
  document.querySelector("#present").textContent = s.present;
  document.querySelector("#absent").textContent = s.absent;
  document.querySelector("#classes").replaceChildren(
    ...s.classes.map((c) => Object.assign(document.createElement("li"), { textContent: \`\${c.name}: \${c.count}\` })),
  );
  document.querySelector("#renders").textContent = ++renders;
});

document.querySelector("#arrive").addEventListener("click", () => { store.state.present++; });
document.querySelector("#absentee").addEventListener("click", () => { store.state.absent++; });
document.querySelector("#form4").addEventListener("click", () => { store.state.classes[0].count += 1; });   // nested change

store.state.present = 0;   // trigger the first render
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is a Proxy \"trap\"?",
        options: [
          "A security vulnerability",
          "A handler function that intercepts an operation, such as reading or writing a property",
          "A way to stop errors",
          "An infinite loop",
        ],
        answer: 1,
        explanation: "`get`, `set`, `deleteProperty` and others are traps.",
      },
      {
        question: "Why call `Reflect.set(target, key, value, receiver)` inside a `set` trap?",
        options: [
          "It performs the normal default behaviour after your custom logic",
          "It's faster than assignment",
          "It prevents the change",
          "It logs the change",
        ],
        answer: 0,
        explanation: "`Reflect` mirrors each trap with the default operation.",
      },
      {
        question: "Three properties change in the same tick. With microtask batching, how many renders happen?",
        options: ["Three", "Zero", "One", "It depends on the browser"],
        answer: 2,
        explanation: "The first change schedules a microtask; later changes see it's already scheduled.",
      },
      {
        question: "Why doesn't a shallow Proxy notice `state.classes[0].count = 5`?",
        options: [
          "Arrays can't be proxied",
          "Numbers can't change",
          "Proxies only work with strings",
          "The write happens on the inner object, which isn't wrapped — only `state` itself is",
        ],
        answer: 3,
        explanation: "Deep reactivity wraps nested objects too, typically when they're read.",
      },
    ],
  },

  performance: {
    solution: {
      notes: [
        "A second IntersectionObserver watches only the last card. When it becomes visible, 20 more cards are appended, observed by the lazy-load observer, and the sentinel moves to the new last card — so the list grows forever without any scroll listener.",
      ],
      code: [
        {
          filename: "index.html",
          lang: "html",
          source: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Infinite list</title>
    <style>
      .card { height: 120px; margin: 10px 0; background: #e9edf2; display: grid; place-items: center; }
      .card.loaded { background: #e8f7e7; }
    </style>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <p>Cards: <span id="total">0</span></p>
    <div id="cards"></div>
  </body>
</html>
`,
        },
        {
          filename: "main.js",
          lang: "js",
          source: `
const cards = document.querySelector("#cards");
let count = 0;

const lazy = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.textContent = \`Lesson \${entry.target.dataset.index}\`;
    entry.target.classList.add("loaded");
    lazy.unobserve(entry.target);
  }
}, { rootMargin: "200px" });

const sentinel = new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting)) addCards(20);
}, { rootMargin: "300px" });

function addCards(n) {
  for (let i = 0; i < n; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = ++count;
    card.textContent = "...";
    cards.append(card);
    lazy.observe(card);
  }
  document.querySelector("#total").textContent = count;
  sentinel.disconnect();
  sentinel.observe(cards.lastElementChild);   // watch the new last card
}

addCards(20);
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which technique suits search-as-you-type?",
        options: ["Throttle", "Debounce", "A Web Worker", "requestAnimationFrame"],
        answer: 1,
        explanation: "Debounce waits until typing pauses, then runs once.",
      },
      {
        question: "Which technique suits updating a scroll-progress bar?",
        options: [
          "Throttle — run at most once per interval while scrolling",
          "Debounce — run only after scrolling stops",
          "localStorage",
          "A recursive function",
        ],
        answer: 0,
        explanation: "Throttling keeps updates regular without running on every scroll event.",
      },
      {
        question: "What is IntersectionObserver used for?",
        options: [
          "Detecting collisions in games",
          "Comparing two arrays",
          "Measuring network speed",
          "Being notified when elements enter or leave the viewport",
        ],
        answer: 3,
        explanation: "Ideal for lazy-loading and infinite lists, without scroll listeners.",
      },
      {
        question: "What should you do before optimising performance?",
        options: [
          "Rewrite the app in another language",
          "Add more debounce calls everywhere",
          "Measure with the DevTools Performance panel or Lighthouse",
          "Remove all images",
        ],
        answer: 2,
        explanation: "Find the real bottleneck first.",
      },
    ],
  },

  "web-workers": {
    solution: {
      notes: [
        "A `Float64Array`'s buffer can be transferred: listing it in the second argument of `postMessage` moves the memory to the worker instead of copying 24 MB. Cancel terminates the worker immediately, rejects the waiting Promise, and creates a fresh worker for the next run.",
      ],
      code: [
        {
          filename: "stats-worker.js",
          lang: "js",
          source: `
self.addEventListener("message", ({ data }) => {
  const { id, buffer } = data;
  const scores = new Float64Array(buffer);
  scores.sort();
  let sum = 0;
  for (const s of scores) sum += s;
  self.postMessage({ id, count: scores.length, mean: sum / scores.length, median: scores[scores.length >> 1] });
});
`,
        },
        {
          filename: "index.html",
          lang: "html",
          source: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Transferable worker</title>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <button id="run">Analyse 3 million scores</button>
    <button id="cancel">Cancel</button>
    <pre id="result"></pre>
  </body>
</html>
`,
        },
        {
          filename: "main.js",
          lang: "js",
          source: `
let worker;
let pending = null;
let nextId = 1;
const result = document.querySelector("#result");

function startWorker() {
  worker = new Worker(new URL("./stats-worker.js", import.meta.url));
  worker.addEventListener("message", ({ data }) => {
    if (pending?.id === data.id) pending.resolve(data);
    pending = null;
  });
}
startWorker();

function analyse(scores) {
  return new Promise((resolve, reject) => {
    pending = { id: nextId++, resolve, reject };
    worker.postMessage({ id: pending.id, buffer: scores.buffer }, [scores.buffer]);   // transfer, don't copy
  });
}

document.querySelector("#run").addEventListener("click", async () => {
  const scores = Float64Array.from({ length: 3_000_000 }, () => Math.floor(Math.random() * 101));
  const started = performance.now();
  result.textContent = "Working...";
  try {
    const stats = await analyse(scores);
    console.log("buffer after transfer:", scores.byteLength);   // 0: the memory moved to the worker
    result.textContent = \`count \${stats.count}, mean \${stats.mean.toFixed(2)}, median \${stats.median}, \${Math.round(performance.now() - started)} ms\`;
  } catch (err) {
    result.textContent = err.message;
  }
});

document.querySelector("#cancel").addEventListener("click", () => {
  worker.terminate();
  pending?.reject(new Error("Cancelled"));
  pending = null;
  startWorker();
});
`,
        },
      ],
    },
    quiz: [
      {
        question: "What can't a Web Worker do?",
        options: ["Run loops", "Send messages", "Do maths", "Access the DOM"],
        answer: 3,
        explanation: "Workers compute; the main thread updates the page.",
      },
      {
        question: "How do the page and a worker communicate?",
        options: [
          "Through shared global variables",
          "With `postMessage` and `message` events",
          "Through localStorage",
          "With fetch",
        ],
        answer: 1,
        explanation: "Data is copied (structured clone) or transferred between them.",
      },
      {
        question: "What happens to an ArrayBuffer after you transfer it to a worker?",
        options: [
          "It becomes empty (length 0) on the sending side, because its memory moved",
          "Both sides share it and can edit it",
          "It is copied",
          "It is deleted everywhere",
        ],
        answer: 0,
        explanation: "Transferring avoids copying large data.",
      },
      {
        question: "What does `worker.terminate()` do?",
        options: [
          "Pauses the worker",
          "Restarts the page",
          "Stops the worker immediately, abandoning its current work",
          "Waits for the worker to finish",
        ],
        answer: 2,
        explanation: "Create a new worker afterwards if you need one again.",
      },
    ],
  },

  "web-components": {
    solution: {
      notes: [
        "`<student-card>` reads its attributes on every render and re-renders when one changes. User-provided notes go into the `<slot>`, so they keep the page's own markup. The button dispatches a `show-results` event with `composed: true` so it crosses the shadow boundary and the page can listen for it.",
      ],
      code: [
        {
          filename: "student-card.js",
          lang: "js",
          source: `
class StudentCard extends HTMLElement {
  static observedAttributes = ["name", "form", "photo"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = \`
      <style>
        :host { display: flex; gap: 12px; align-items: center; padding: 12px; border: 1px solid #dde2e8; border-radius: 12px; font-family: system-ui; margin: 8px 0; }
        img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; background: #e9edf2; }
        h3 { margin: 0; font-size: 1rem; }
        p { margin: 2px 0; color: #4a5568; }
      </style>
      <img alt="" />
      <div>
        <h3></h3>
        <p class="form"></p>
        <slot name="notes"><p>No notes yet.</p></slot>
        <button type="button">Show results</button>
      </div>
    \`;
    this.shadowRoot.querySelector("button").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("show-results", {
        detail: { name: this.getAttribute("name") },
        bubbles: true,
        composed: true,
      }));
    });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  render() {
    const root = this.shadowRoot;
    root.querySelector("h3").textContent = this.getAttribute("name") ?? "Unnamed student";
    root.querySelector(".form").textContent = \`Form \${this.getAttribute("form") ?? "?"}\`;
    const photo = this.getAttribute("photo");
    const img = root.querySelector("img");
    if (photo) img.src = photo;
    else img.removeAttribute("src");
  }
}

customElements.define("student-card", StudentCard);
`,
        },
        {
          filename: "index.html",
          lang: "html",
          source: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Student cards</title>
    <script type="module" src="student-card.js"></script>
    <script type="module">
      document.addEventListener("show-results", (e) => {
        document.querySelector("#selected").textContent = \`Showing results for \${e.detail.name}\`;
      });
    </script>
  </head>
  <body>
    <student-card name="Amina Hassan" form="4">
      <p slot="notes">Head of the debate club.</p>
    </student-card>
    <student-card name="Juma Said" form="3"></student-card>
    <student-card name="Neema Kimaro" form="4">
      <p slot="notes">Best Biology project 2026.</p>
    </student-card>
    <p id="selected"></p>
  </body>
</html>
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which tag name is valid for a custom element?",
        options: ["`<studentcard>`", "`<student-card>`", "`<StudentCard>`", "`<card>`"],
        answer: 1,
        explanation: "Custom element names must contain a hyphen.",
      },
      {
        question: "What does Shadow DOM give a component?",
        options: [
          "Private markup and styles that don't leak out or get affected by page CSS",
          "Faster rendering",
          "Server-side rendering",
          "Automatic data fetching",
        ],
        answer: 0,
        explanation: "Encapsulation lets components work the same on any page.",
      },
      {
        question: "What is a `<slot>` for?",
        options: [
          "Storing data",
          "Loading scripts",
          "A place where the component's user can insert their own content",
          "Defining events",
        ],
        answer: 2,
        explanation: "Slotted content comes from the page and stays in the light DOM.",
      },
      {
        question: "Why set `composed: true` on a component's CustomEvent?",
        options: [
          "To make it faster",
          "To cancel it",
          "To include extra data",
          "So the event can cross the shadow boundary and reach listeners on the page",
        ],
        answer: 3,
        explanation: "Without it, events dispatched inside shadow DOM stay inside the component.",
      },
    ],
  },

  "security-xss": {
    solution: {
      notes: [
        "The to-do app already uses `textContent` everywhere, so there's no `innerHTML` to fix. Add the CSP meta tag to its `<head>`: inline scripts and injected event handlers are now blocked even if a mistake slips in later. Then add a task containing an `<img onerror>` payload and confirm it shows as text and nothing runs.",
      ],
      code: [
        {
          filename: "index.html (head)",
          lang: "html",
          source: `
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'" />
  <title>Tasks</title>
  <script src="app.js" defer></script>
</head>
`,
        },
        {
          filename: "DevTools console",
          lang: "js",
          source: `
// Find risky DOM API calls in the page's scripts (should print nothing for the to-do app)
const RISKY = [/\\.innerHTML\\s*=/, /\\.outerHTML\\s*=/, /insertAdjacentHTML\\(/, /document\\.write\\(/, /\\beval\\(/];
[...document.scripts].forEach(async (s) => {
  if (!s.src) return;
  const code = await (await fetch(s.src)).text();
  for (const pattern of RISKY) {
    if (pattern.test(code)) console.warn(s.src, "matches", pattern);
  }
});
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is cross-site scripting (XSS)?",
        options: [
          "Loading scripts from a CDN",
          "Using two script tags",
          "Untrusted text being inserted as HTML, letting an attacker run JavaScript in your page",
          "A slow network connection",
        ],
        answer: 2,
        explanation: "The attacker's code runs with your page's permissions.",
      },
      {
        question: "Which is safe for displaying a user's comment?",
        options: ["`el.innerHTML = comment`", "`el.textContent = comment`", "`document.write(comment)`", "`el.outerHTML = comment`"],
        answer: 1,
        explanation: "`textContent` never parses HTML.",
      },
      {
        question: "Why check that a URL starts with http(s) before using it as a link?",
        options: [
          "`javascript:` URLs run code when clicked",
          "Other URLs are slower",
          "Browsers reject all other URLs",
          "It's only for SEO",
        ],
        answer: 0,
        explanation: "Allow-list protocols for any href or src built from untrusted input.",
      },
      {
        question: "What does a Content Security Policy add?",
        options: [
          "Encryption of all page data",
          "Faster script loading",
          "Automatic sanitising of innerHTML",
          "A second line of defence: the browser blocks scripts the policy doesn't allow",
        ],
        answer: 3,
        explanation: "Even if an injection slips through, the injected script won't run.",
      },
    ],
  },
};
