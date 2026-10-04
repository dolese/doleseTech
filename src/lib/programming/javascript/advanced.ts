import type { LevelTrack } from "../types";

export const advanced: LevelTrack = {
  intro:
    "Understand how JavaScript really runs and build fast, safe, reusable front-ends: the browser event loop, iterators and generators, Proxies for reactivity, performance techniques, Web Workers, Web Components, and defending against XSS.",
  outcomes: [
    "Predict execution order with the event loop, microtasks and rendering",
    "Use iterators, generators, Symbols and Proxies to build powerful abstractions",
    "Keep pages fast with debounce, requestAnimationFrame, observers and Web Workers",
    "Build reusable Web Components and protect pages from XSS",
  ],
  lessons: [
    {
      slug: "event-loop",
      title: "The Event Loop, Tasks & Rendering",
      summary: "Why the page freezes, how tasks and microtasks are ordered, and where rendering fits in.",
      body: [
        "The browser runs your JavaScript, handles user input and paints the screen on one main thread. While your code runs, nothing else happens — a 2-second loop freezes clicks, typing and animations for 2 seconds.",
        "After each task (a script, a click handler, a timer callback) the browser empties the microtask queue (Promise callbacks, `queueMicrotask`) completely, then may render a frame, then picks the next task. So Promise callbacks always run before `setTimeout` callbacks queued at the same time.",
        "`requestAnimationFrame` runs just before the next paint — the right place for visual updates. Break long work into chunks and yield between them (with `setTimeout`, or `scheduler.yield()` where supported) so the page stays responsive.",
      ],
      code: [
        {
          filename: "order.js",
          lang: "js",
          source: `
console.log("1. script start");

setTimeout(() => console.log("5. timeout (next task)"), 0);

Promise.resolve()
  .then(() => console.log("3. microtask 1"))
  .then(() => console.log("4. microtask 2 (still before the timeout)"));

queueMicrotask(() => console.log("3b. queueMicrotask"));

console.log("2. script end");
// Order: 1, 2, 3, 3b, 4, 5
`,
        },
        {
          filename: "chunks.js",
          lang: "js",
          source: `
const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));

// Processes a big list without freezing the page for more than ~50ms at a time
async function processInChunks(items, handleItem, budgetMs = 50) {
  let deadline = performance.now() + budgetMs;
  for (const item of items) {
    handleItem(item);
    if (performance.now() > deadline) {
      await yieldToBrowser();                 // let clicks and painting happen
      deadline = performance.now() + budgetMs;
    }
  }
}

const items = Array.from({ length: 200_000 }, (_, i) => i);
let total = 0;
const started = performance.now();
const timer = setInterval(() => console.log("UI still responsive"), 100);

processInChunks(items, (n) => {
  for (let k = 0; k < 200; k++) total += Math.sqrt(n + k);
}).then(() => {
  clearInterval(timer);
  console.log(\`Done in \${Math.round(performance.now() - started)}ms, total \${Math.round(total)}\`);
});
`,
        },
      ],
      keyPoints: [
        "One main thread: long-running JavaScript blocks input and painting.",
        "Microtasks (Promises) run before the next task (timers, events).",
        "Chunk long work and yield; do visual updates in `requestAnimationFrame`.",
      ],
      exercise:
        "Create a page with a button that sorts 2 million random numbers. Notice the freeze, then rewrite it to show a progress bar updated in `requestAnimationFrame` while processing in chunks.",
    },
    {
      slug: "iterators-and-generators",
      title: "Iterators, Generators & Symbols",
      summary: "Make your own objects work with for...of and spread, and produce values lazily with generators.",
      body: [
        "Anything with a `[Symbol.iterator]` method is iterable: arrays, strings, Maps, Sets, NodeLists — and your own objects. Iterables work with `for...of`, spread (`[...x]`), destructuring and `Array.from`.",
        "Generator functions (`function*`) make iterators easy: each `yield` hands out one value and pauses until the next is requested. They are lazy, so they can describe huge or infinite sequences that are computed only as far as needed.",
        "Symbols are unique keys that never clash with ordinary property names. Built-in \"well-known\" symbols (`Symbol.iterator`, `Symbol.toPrimitive`, `Symbol.asyncIterator`) let your objects plug into language features. Async generators (`async function*`) combine with `for await...of` for paginated APIs and streams.",
      ],
      code: [
        {
          filename: "iterators.js",
          lang: "js",
          source: `
class Timetable {
  #periods = [];

  add(subject, start) {
    this.#periods.push({ subject, start });
    return this;
  }

  *[Symbol.iterator]() {                         // makes Timetable iterable
    yield* this.#periods.toSorted((a, b) => a.start.localeCompare(b.start));
  }
}

const monday = new Timetable().add("Biology", "10:00").add("Maths", "08:00").add("English", "11:40");
for (const p of monday) console.log(p.start, p.subject);
console.log([...monday].map((p) => p.subject));

function* ids(prefix) {                          // infinite, but lazy
  let n = 1;
  while (true) yield \`\${prefix}-\${String(n++).padStart(4, "0")}\`;
}

function* take(iterable, count) {
  for (const value of iterable) {
    if (count-- <= 0) return;
    yield value;
  }
}

console.log([...take(ids("S2026"), 3)]);       // [ 'S2026-0001', 'S2026-0002', 'S2026-0003' ]

async function* pages(totalPages) {             // e.g. a paginated API
  for (let page = 1; page <= totalPages; page++) {
    await new Promise((r) => setTimeout(r, 10));
    yield { page, items: [\`item \${page}a\`, \`item \${page}b\`] };
  }
}

(async () => {
  for await (const { page, items } of pages(3)) console.log(page, items);
})();

const money = {
  amount: 15000,
  [Symbol.toPrimitive](hint) {
    return hint === "number" ? this.amount : \`TSh \${this.amount.toLocaleString("en-US")}\`;
  },
};
console.log(\`\${money}\`, +money + 500);       // TSh 15,000 15500
`,
        },
      ],
      keyPoints: [
        "Implement `[Symbol.iterator]` to make your objects work with for...of and spread.",
        "Generators produce values lazily — great for sequences, pipelines and pagination.",
        "Async generators + `for await` consume paged or streamed data cleanly.",
      ],
      exercise:
        "Write a generator `chunked(array, size)` and a generator `range(start, end, step)`. Then write an async generator that \"fetches\" pages from an array of 25 records, 10 per page, and collect all records with `for await`.",
    },
    {
      slug: "proxies-and-reactivity",
      title: "Proxy, Reflect & Building Reactivity",
      summary: "Intercept property access with Proxy and build a tiny reactive store that updates the page automatically.",
      body: [
        "A `Proxy` wraps an object and intercepts operations on it — reading (`get`), writing (`set`), deleting and more — through handler functions called traps. `Reflect` provides the default behaviour for each trap so you can add logic and then carry on normally.",
        "Proxies power validation layers, logging, default values and, most famously, reactivity: frameworks such as Vue detect which data changed and re-render only what depends on it.",
        "Below, a 30-line reactive store notifies subscribers whenever a property changes, batching several changes into one update with a microtask.",
      ],
      code: [
        {
          filename: "reactive.js",
          lang: "js",
          source: `
function validated(target, rules) {
  return new Proxy(target, {
    set(obj, key, value, receiver) {
      const rule = rules[key];
      if (rule && !rule(value)) throw new TypeError(\`Invalid value for \${String(key)}: \${value}\`);
      return Reflect.set(obj, key, value, receiver);
    },
  });
}

const student = validated({ name: "Amina", score: 88 }, {
  score: (v) => Number.isInteger(v) && v >= 0 && v <= 100,
});
student.score = 91;
try {
  student.score = 150;
} catch (err) {
  console.log(err.message);                 // Invalid value for score: 150
}

function createStore(initial) {
  const listeners = new Set();
  let scheduled = false;
  const changed = new Set();

  const state = new Proxy({ ...initial }, {
    set(obj, key, value) {
      if (obj[key] === value) return true;
      obj[key] = value;
      changed.add(key);
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(() => {             // batch: one notification per tick
          scheduled = false;
          const keys = [...changed];
          changed.clear();
          for (const fn of listeners) fn(state, keys);
        });
      }
      return true;
    },
  });

  return {
    state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

const store = createStore({ present: 0, absent: 0 });
const unsubscribe = store.subscribe((s, keys) => {
  console.log(\`render: present=\${s.present} absent=\${s.absent} (changed: \${keys.join(", ")})\`);
});

store.state.present = 25;
store.state.absent = 3;                     // both changes -> a single render
setTimeout(() => {
  store.state.present = 26;                 // -> render: present=26 absent=3 (changed: present)
  queueMicrotask(unsubscribe);              // runs after that render, then stops listening
  queueMicrotask(() => { store.state.absent = 4; });   // no render: nobody is subscribed
}, 0);
`,
        },
      ],
      keyPoints: [
        "Proxy traps intercept operations; `Reflect` performs the default behaviour.",
        "Validation, logging and reactivity are classic Proxy use cases.",
        "Batch notifications with a microtask to avoid redundant renders.",
      ],
      exercise:
        "Connect `createStore` to a page: show `present` and `absent` counts, with buttons that change them. Then make the store deep-reactive, so changing `state.classes[0].count` also triggers a render.",
    },
    {
      slug: "performance",
      title: "Performance: Debounce, Throttle & Observers",
      summary: "Control how often expensive code runs, animate smoothly, and load content only when it's visible.",
      body: [
        "Some events fire extremely often — typing, scrolling, resizing. Debounce waits until the events stop for a moment (ideal for search-as-you-type); throttle runs at most once per interval (ideal for scroll position).",
        "Animate with `requestAnimationFrame`, which runs once per screen refresh and pauses in background tabs. Avoid reading layout (such as `offsetHeight`) right after writing styles in a loop — it forces repeated layout calculations.",
        "`IntersectionObserver` tells you when elements enter the viewport, without scroll listeners — use it for lazy-loading images and infinite lists. Measure before optimising with the browser DevTools Performance panel and Lighthouse.",
      ],
      code: [
        {
          filename: "timing.js",
          lang: "js",
          source: `
export function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, interval = 100) {
  let last = 0;
  let trailing;
  return (...args) => {
    const now = Date.now();
    const remaining = interval - (now - last);
    clearTimeout(trailing);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else {
      trailing = setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, remaining);
    }
  };
}
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
    <title>Performance</title>
    <style>
      .card { height: 160px; margin: 12px 0; background: #e9edf2; display: grid; place-items: center; }
      .card.loaded { background: #e8f7e7; }
      #bar { position: fixed; top: 0; left: 0; height: 4px; background: #2e8b2a; width: 0; }
    </style>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <div id="bar"></div>
    <input id="search" placeholder="Search subjects..." />
    <p id="searching"></p>
    <div id="cards"></div>
  </body>
</html>
`,
        },
        {
          filename: "main.js",
          lang: "js",
          source: `
import { debounce, throttle } from "./timing.js";

// 1. Debounced search: runs once the user pauses typing
const status = document.querySelector("#searching");
const search = debounce((term) => {
  status.textContent = term ? \`Searching for "\${term}"...\` : "";
}, 300);
document.querySelector("#search").addEventListener("input", (e) => search(e.target.value));

// 2. Throttled scroll progress, drawn in requestAnimationFrame
const bar = document.querySelector("#bar");
let progress = 0;
const onScroll = throttle(() => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress = max > 0 ? scrollY / max : 0;
  requestAnimationFrame(() => { bar.style.width = \`\${progress * 100}%\`; });
}, 50);
addEventListener("scroll", onScroll, { passive: true });

// 3. Lazy content with IntersectionObserver
const cards = document.querySelector("#cards");
for (let i = 1; i <= 30; i++) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.index = i;
  card.textContent = "...";
  cards.append(card);
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const card = entry.target;
    card.textContent = \`Lesson \${card.dataset.index} loaded\`;
    card.classList.add("loaded");
    observer.unobserve(card);              // load once
  }
}, { rootMargin: "200px" });               // start a little before it's visible

document.querySelectorAll(".card").forEach((card) => observer.observe(card));
`,
        },
      ],
      keyPoints: [
        "Debounce bursty input; throttle continuous events like scroll.",
        "Animate in `requestAnimationFrame`; don't interleave layout reads and writes.",
        "Use IntersectionObserver for lazy loading; measure with DevTools and Lighthouse.",
      ],
      exercise:
        "Turn the cards into an infinite list: when the last card becomes visible, append 20 more. Use the Performance panel to compare scrolling with and without throttling the scroll handler.",
    },
    {
      slug: "web-workers",
      title: "Web Workers",
      summary: "Run heavy computations on a background thread so the page never freezes.",
      body: [
        "A Web Worker runs a script on a separate thread. It can't touch the DOM, but it can do heavy computation — parsing big files, image processing, statistics — while the main thread keeps the page smooth.",
        "The page and the worker communicate by sending messages with `postMessage` and listening for `message` events. Data is copied between them (structured clone); large binary buffers can be transferred instead of copied.",
        "Wrap the message exchange in a Promise so calling the worker feels like calling an async function. Create module workers with `new Worker(url, { type: \"module\" })`.",
      ],
      code: [
        {
          filename: "stats-worker.js",
          lang: "js",
          source: `
// Runs on a background thread: no DOM access here
self.addEventListener("message", (event) => {
  const { id, scores } = event.data;
  const sorted = scores.toSorted((a, b) => a - b);
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance = sorted.reduce((sum, s) => sum + (s - mean) ** 2, 0) / sorted.length;
  self.postMessage({ id, mean, median, sd: Math.sqrt(variance), count: sorted.length });
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
    <title>Workers</title>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <button id="run">Analyse 3 million scores</button>
    <p id="ticker">0</p>
    <pre id="result"></pre>
  </body>
</html>
`,
        },
        {
          filename: "main.js",
          lang: "js",
          source: `
const worker = new Worker(new URL("./stats-worker.js", import.meta.url));
const pending = new Map();
let nextId = 1;

worker.addEventListener("message", (event) => {
  const { id, ...result } = event.data;
  pending.get(id)?.(result);
  pending.delete(id);
});

function analyse(scores) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    worker.postMessage({ id, scores });
  });
}

// A ticker proves the main thread stays free while the worker computes
let ticks = 0;
setInterval(() => { document.querySelector("#ticker").textContent = ++ticks; }, 50);

document.querySelector("#run").addEventListener("click", async () => {
  const scores = Array.from({ length: 3_000_000 }, () => Math.floor(Math.random() * 101));
  const started = performance.now();
  const stats = await analyse(scores);
  document.querySelector("#result").textContent =
    \`count \${stats.count}\\nmean \${stats.mean.toFixed(2)}\\nmedian \${stats.median}\\nsd \${stats.sd.toFixed(2)}\\n\` +
    \`took \${Math.round(performance.now() - started)}ms\`;
});
`,
        },
      ],
      keyPoints: [
        "Workers run CPU-heavy code off the main thread; they cannot access the DOM.",
        "Communicate with `postMessage`; wrap requests in Promises for clean async APIs.",
        "Transfer large ArrayBuffers instead of copying them.",
      ],
      exercise:
        "Send the scores as a `Float64Array` and transfer its buffer (`postMessage(msg, [array.buffer])`). Compare the time with the plain-array version, and add a \"Cancel\" button that calls `worker.terminate()` and creates a new worker.",
    },
    {
      slug: "web-components",
      title: "Web Components",
      summary: "Create your own reusable HTML elements with Custom Elements, Shadow DOM and slots.",
      body: [
        "Web Components are the browser's built-in component system — no framework needed. A Custom Element is a class extending `HTMLElement`, registered with a tag name containing a hyphen, such as `<grade-badge>`. It works in plain HTML and in any framework.",
        "Shadow DOM gives the component private markup and styles that don't leak out and aren't affected by the page's CSS. `<slot>` lets users of your component pass in their own content.",
        "Lifecycle callbacks: `connectedCallback` runs when the element is added to the page, and `attributeChangedCallback` runs when one of its `observedAttributes` changes. Communicate outwards by dispatching custom events.",
      ],
      code: [
        {
          filename: "grade-badge.js",
          lang: "js",
          source: `
const GRADES = [
  [75, "A", "#2e8b2a"], [65, "B", "#2f7fc4"], [45, "C", "#6b3fa0"], [30, "D", "#b5541e"], [0, "F", "#b00020"],
];

class GradeBadge extends HTMLElement {
  static observedAttributes = ["score"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = \`
      <style>
        :host { display: inline-flex; align-items: center; gap: 8px; font-family: system-ui; }
        .badge { color: white; border-radius: 6px; padding: 2px 8px; font-weight: 700; cursor: pointer; }
      </style>
      <span class="badge" part="badge"></span>
      <slot>Unnamed student</slot>
    \`;
    this.shadowRoot.querySelector(".badge").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("grade-click", {
        detail: { score: this.score, grade: this.grade },
        bubbles: true,
        composed: true,                  // crosses the shadow boundary
      }));
    });
  }

  get score() {
    return Number(this.getAttribute("score") ?? 0);
  }

  get grade() {
    return GRADES.find(([min]) => this.score >= min)[1];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const [, grade, color] = GRADES.find(([min]) => this.score >= min);
    const badge = this.shadowRoot.querySelector(".badge");
    badge.textContent = \`\${grade} (\${this.score})\`;
    badge.style.background = color;
  }
}

customElements.define("grade-badge", GradeBadge);
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
    <title>Web Components</title>
    <script type="module" src="grade-badge.js"></script>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <p><grade-badge score="88">Amina Hassan</grade-badge></p>
    <p><grade-badge score="54">Baraka Mushi</grade-badge></p>
    <p><grade-badge score="12"></grade-badge></p>
    <button id="bump">Give Baraka +15</button>
    <p id="clicked"></p>
  </body>
</html>
`,
        },
        {
          filename: "main.js",
          lang: "js",
          source: `
document.addEventListener("grade-click", (event) => {
  const { score, grade } = event.detail;
  document.querySelector("#clicked").textContent = \`Clicked a \${grade} (\${score})\`;
});

document.querySelector("#bump").addEventListener("click", () => {
  const baraka = document.querySelectorAll("grade-badge")[1];
  baraka.setAttribute("score", Math.min(100, baraka.score + 15));   // re-renders automatically
});
`,
        },
      ],
      keyPoints: [
        "Custom Elements are classes extending `HTMLElement`, registered with a hyphenated tag.",
        "Shadow DOM encapsulates markup and styles; `<slot>` accepts user content.",
        "React to attributes with `observedAttributes`; talk to the page with custom events.",
      ],
      exercise:
        "Build a `<student-card>` component with name, form and photo-URL attributes, a slot for extra notes, and a \"Show results\" button that fires a `show-results` event with the student's name. Use it three times on a page.",
    },
    {
      slug: "security-xss",
      title: "Front-End Security: XSS & CSP",
      summary: "How cross-site scripting happens, safe DOM APIs, sanitising HTML, safe URLs and Content Security Policy.",
      body: [
        "Cross-site scripting (XSS) happens when text from users or other systems is inserted into a page as HTML, letting an attacker run their own JavaScript — stealing data, acting as the user, or defacing the page. It's the most common front-end vulnerability.",
        "Prevention: insert text with `textContent` (or `setAttribute`), never `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `document.write` with untrusted data. Never pass strings to `eval`, `new Function` or `setTimeout(\"code\")`. If you truly must render user HTML (a rich-text editor), sanitise it with a vetted library such as DOMPurify. Validate URLs before using them in `href` or `src` — `javascript:` URLs run code.",
        "A Content Security Policy (CSP) header is a second line of defence: it tells the browser which scripts may run, blocking inline and third-party scripts an attacker injects. This website itself sends a CSP header.",
      ],
      code: [
        {
          filename: "safe-dom.js",
          lang: "js",
          source: `
const comment = '<img src=x onerror="alert(document.cookie)"> Great lesson!';
const website = "javascript:alert('hacked')";

const el = document.querySelector("#comments");

// UNSAFE: the browser parses the string as HTML and runs the onerror code
// el.innerHTML = \`<p>\${comment}</p>\`;

// SAFE: build elements and set text
const p = document.createElement("p");
p.textContent = comment;              // shown literally, never executed
el.append(p);

// SAFE URLs: allow only http(s)
function safeUrl(input) {
  try {
    const url = new URL(input, location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const link = document.createElement("a");
const href = safeUrl(website);
link.textContent = href ? "Visit website" : "(invalid link removed)";
if (href) link.href = href;
el.append(link);

// When escaping is needed for a template string
function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}
console.log(escapeHTML(comment));
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
    <!-- Only scripts from this site may run; inline <script> and injected handlers are blocked -->
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'" />
    <title>Comments</title>
    <script src="safe-dom.js" defer></script>
  </head>
  <body>
    <div id="comments"></div>
  </body>
</html>
`,
        },
      ],
      keyPoints: [
        "Treat all external text as untrusted: use `textContent`, never `innerHTML`.",
        "Allow only `http(s):` URLs in links; never `eval` strings.",
        "Sanitise rich HTML with DOMPurify and add a Content Security Policy as backup.",
      ],
      exercise:
        "Revisit your to-do app and search for every use of `innerHTML`. Add a CSP meta tag to it, then try adding a task containing `<img src=x onerror=alert(1)>` and confirm it is displayed as text and nothing runs.",
    },
  ],
};
