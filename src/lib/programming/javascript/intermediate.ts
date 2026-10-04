import type { LevelTrack } from "../types";

export const intermediate: LevelTrack = {
  intro:
    "Build real interactive pages: handle forms and events properly, understand closures, `this` and classes, load data with fetch and async/await, organise code into modules, remember data with localStorage, and put it all together in a complete to-do app.",
  outcomes: [
    "Handle forms, validation and event delegation",
    "Use closures, `this`, classes and private fields with confidence",
    "Load and display remote data with fetch, async/await and loading/error states",
    "Structure apps with ES modules, persist state in localStorage and build a full app",
  ],
  lessons: [
    {
      slug: "events-and-forms",
      title: "Events, Forms & Validation",
      summary: "Handle form submission, validate input, show errors and use event delegation for lists.",
      body: [
        "Listen to a form's `submit` event rather than a button's click — it also fires when the user presses Enter. Call `event.preventDefault()` to stop the browser from reloading the page, then read the values with `new FormData(form)`.",
        "Validate on the client to give instant feedback (required fields, ranges, formats), and show clear error messages next to the inputs. HTML attributes like `required`, `min` and `max` help too. Always validate again on the server — client checks can be bypassed.",
        "Event delegation: instead of attaching a listener to every row, attach one to the parent list and use `event.target.closest(...)` to find which item was clicked. It works for items added later and uses less memory.",
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
    <title>Register students</title>
    <style>
      .error { color: #b00020; font-size: 0.9rem; min-height: 1.2em; }
    </style>
    <script src="app.js" defer></script>
  </head>
  <body>
    <form id="student-form" novalidate>
      <label>Name <input name="name" /></label>
      <label>Score <input name="score" type="number" /></label>
      <button type="submit">Add</button>
      <p class="error" id="error" role="alert"></p>
    </form>
    <ul id="students"></ul>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const form = document.querySelector("#student-form");
const errorEl = document.querySelector("#error");
const list = document.querySelector("#students");

function validate({ name, score }) {
  if (name.trim().length < 2) return "Name must have at least 2 letters.";
  if (score === "" || Number.isNaN(Number(score))) return "Score must be a number.";
  if (Number(score) < 0 || Number(score) > 100) return "Score must be between 0 and 100.";
  return null;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));   // { name, score }
  const error = validate(data);
  errorEl.textContent = error ?? "";
  if (error) return;

  const li = document.createElement("li");
  li.dataset.score = data.score;
  li.textContent = \`\${data.name.trim()} - \${data.score} \`;
  const remove = document.createElement("button");
  remove.textContent = "Remove";
  remove.className = "remove";
  li.append(remove);
  list.append(li);

  form.reset();
  form.elements.name.focus();
});

// One listener for all current and future "Remove" buttons
list.addEventListener("click", (event) => {
  const button = event.target.closest("button.remove");
  if (button) button.closest("li").remove();
});
`,
        },
      ],
      keyPoints: [
        "Handle `submit` on the form and call `preventDefault()`.",
        "Show validation messages near the input; re-validate on the server.",
        "Delegate events to a parent and use `closest()` to find the clicked item.",
      ],
      exercise:
        "Extend the form with an email field (validate it contains \"@\" and a dot after it) and a form selector (1–4). Show each field's error under that field instead of one shared message, and add an \"Edit\" button per row using delegation.",
    },
    {
      slug: "closures-and-this",
      title: "Closures & `this`",
      summary: "Functions that remember their surroundings, private state, and how `this` is decided.",
      body: [
        "A closure is a function that remembers the variables from where it was created, even after that outer function has finished. This gives you private state: in `createCounter`, nothing outside can change `count` except through the returned functions.",
        "Closures are everywhere: event handlers, callbacks, `setTimeout`, and helper factories such as `debounce` or `once`.",
        "`this` depends on how a function is called, not where it is written. Called as `obj.method()`, `this` is `obj`; passed around as a plain callback, it loses that. Arrow functions don't have their own `this` — they use the surrounding one — which is why they are handy inside methods. `fn.bind(obj)` fixes `this` permanently.",
      ],
      code: [
        {
          filename: "closures.js",
          lang: "js",
          source: `
"use strict"; // modules and classes are always strict; plain scripts opt in like this

function createCounter(start = 0) {
  let count = start;                       // private: only the functions below can reach it
  return {
    increment: () => ++count,
    reset: () => (count = start),
    get value() { return count; },
  };
}

const visitors = createCounter();
visitors.increment();
visitors.increment();
console.log(visitors.value, visitors.count);   // 2 undefined

function once(fn) {
  let done = false;
  let result;
  return (...args) => {
    if (!done) {
      done = true;
      result = fn(...args);
    }
    return result;
  };
}
const init = once(() => { console.log("initialising..."); return 42; });
console.log(init(), init());              // logs "initialising..." once, then 42 42

const teacher = {
  name: "Ms. Lyimo",
  students: ["Amina", "Neema"],
  greetAll() {
    // Arrow callback: uses greetAll's \`this\`, so this.name works
    return this.students.map((s) => \`\${this.name} greets \${s}\`);
  },
  introduce() {
    return \`I am \${this.name}\`;
  },
};
console.log(teacher.greetAll());

const loose = teacher.introduce;          // detached from the object
try {
  console.log(loose());
} catch (err) {
  console.log("Lost this:", err.constructor.name);
}
const bound = teacher.introduce.bind(teacher);
console.log(bound());                      // I am Ms. Lyimo
`,
        },
      ],
      keyPoints: [
        "Closures remember outer variables — use them for private state and helper factories.",
        "`this` is set by the call site: `obj.method()` → `obj`.",
        "Arrow functions inherit `this`; `bind` fixes it for passed-around methods.",
      ],
      exercise:
        "Write `createBankAccount(owner)` that returns `deposit`, `withdraw` and `getBalance` functions with the balance kept private, refusing withdrawals larger than the balance. Then write `makeMultiplier(n)` that returns a function multiplying its input by n.",
    },
    {
      slug: "classes-and-prototypes",
      title: "Classes, Inheritance & Prototypes",
      summary: "class syntax, constructors, getters, static members, private #fields, extends and the prototype chain.",
      body: [
        "Classes are templates for objects that share behaviour. The `constructor` sets up each new instance; methods are shared by all instances. Getters (`get average()`) look like properties but compute their value.",
        "`#private` fields can't be read or changed from outside the class — real encapsulation. `static` members belong to the class itself, such as factory methods (`Student.fromCSV`).",
        "`extends` creates a subclass; call `super(...)` in its constructor. Under the hood, JavaScript classes use prototypes: each object links to a prototype object that holds the shared methods, and property lookups walk up this chain.",
      ],
      code: [
        {
          filename: "classes.js",
          lang: "js",
          source: `
class Student {
  #scores = [];                            // private field
  static passMark = 30;

  constructor(name, form) {
    this.name = name;
    this.form = form;
  }

  addScore(score) {
    if (score < 0 || score > 100) throw new RangeError("score must be 0-100");
    this.#scores.push(score);
    return this;                           // allows chaining
  }

  get average() {
    if (this.#scores.length === 0) return 0;
    return this.#scores.reduce((a, b) => a + b, 0) / this.#scores.length;
  }

  get passed() {
    return this.average >= Student.passMark;
  }

  static fromCSV(line) {
    const [name, form] = line.split(",");
    return new Student(name.trim(), Number(form));
  }

  toString() {
    return \`\${this.name} (Form \${this.form}): \${this.average.toFixed(1)}\`;
  }
}

class Prefect extends Student {
  constructor(name, form, duty) {
    super(name, form);
    this.duty = duty;
  }

  toString() {
    return \`\${super.toString()} - prefect for \${this.duty}\`;
  }
}

const amina = new Student("Amina", 4).addScore(88).addScore(79);
const neema = new Prefect("Neema", 4, "library").addScore(71);
const juma = Student.fromCSV("Juma, 3").addScore(25);

for (const s of [amina, neema, juma]) console.log(String(s), s.passed ? "PASS" : "FAIL");

console.log(neema instanceof Student);                                 // true
console.log(Object.getPrototypeOf(neema) === Prefect.prototype);       // true
console.log(Object.getPrototypeOf(Prefect.prototype) === Student.prototype); // true
console.log("scores" in amina, Object.keys(amina));                    // false [ 'name', 'form' ]
`,
        },
      ],
      keyPoints: [
        "Classes bundle data and behaviour; methods live on the shared prototype.",
        "`#private` fields give real encapsulation; getters compute values on access.",
        "Prefer shallow inheritance — composition is often simpler than deep class trees.",
      ],
      exercise:
        "Create a `Shape` base class with an `area` getter and `describe()` method, and `Circle` and `Rectangle` subclasses. Store mixed shapes in an array, sort them by area and print each description.",
    },
    {
      slug: "async-and-fetch",
      title: "Async JavaScript: Promises, async/await & fetch",
      summary: "Load data without freezing the page, with loading and error states.",
      body: [
        "Network requests take time. JavaScript doesn't wait and freeze the page — `fetch()` returns a Promise immediately, and your code continues when the response arrives. `async` functions with `await` let you write this step-by-step, like normal code.",
        "`fetch` only rejects on network failure. An HTTP error such as 404 still resolves, so always check `response.ok` before reading `response.json()`.",
        "Good interfaces show three states: loading, success and error (with a retry). Run independent requests in parallel with `Promise.all`. This example fetches a `students.json` file served from the same folder.",
      ],
      code: [
        {
          filename: "students.json",
          lang: "json",
          source: `
[
  { "id": 1, "name": "Amina Hassan", "form": 4, "average": 86.0 },
  { "id": 2, "name": "Baraka Mushi", "form": 4, "average": 54.0 },
  { "id": 3, "name": "Neema Kimaro", "form": 4, "average": 75.0 },
  { "id": 4, "name": "Rehema Mollel", "form": 3, "average": 71.3 }
]
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
    <title>Results</title>
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1>Form results</h1>
    <button id="load">Load results</button>
    <p id="status" aria-live="polite"></p>
    <ol id="results"></ol>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const statusEl = document.querySelector("#status");
const list = document.querySelector("#results");
const loadBtn = document.querySelector("#load");

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(\`Request failed: HTTP \${response.status}\`);
  return response.json();
}

function render(students) {
  const sorted = students.toSorted((a, b) => b.average - a.average);
  list.replaceChildren(
    ...sorted.map((s) => {
      const li = document.createElement("li");
      li.textContent = \`\${s.name} (Form \${s.form}) - \${s.average.toFixed(1)}\`;
      return li;
    }),
  );
}

async function load() {
  statusEl.textContent = "Loading...";
  loadBtn.disabled = true;
  try {
    const students = await getJSON("students.json");
    render(students);
    statusEl.textContent = \`Loaded \${students.length} students.\`;
  } catch (err) {
    statusEl.textContent = \`Could not load results (\${err.message}). Try again.\`;
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", load);

// Parallel requests: both start at once
async function loadEverything() {
  const [students, missing] = await Promise.allSettled([getJSON("students.json"), getJSON("missing.json")]);
  console.log(students.status, missing.status, missing.reason?.message);
}
loadEverything();
`,
        },
      ],
      keyPoints: [
        "`await` pauses only the async function — the page stays responsive.",
        "Check `response.ok`; fetch doesn't throw on 404/500.",
        "Always show loading and error states, and re-enable controls in `finally`.",
      ],
      exercise:
        "Add a search box that filters the loaded list as you type, and a \"Form\" dropdown filter. Then point the fetch at a wrong file name and check your error message and retry button work.",
    },
    {
      slug: "modules-and-tooling",
      title: "ES Modules & Build Tools",
      summary: "Split code into modules with import/export, load them in the browser, and use npm with Vite.",
      body: [
        "ES modules split code into files that `export` what they share and `import` what they need. Each module has its own scope, so variables don't leak into the global page. Load the entry file with `<script type=\"module\" src=\"main.js\">` — modules are deferred automatically.",
        "Module imports in the browser need full relative paths, including `.js`. Use `import()` (dynamic import) to load rarely used code only when it's needed, making the first page load faster.",
        "For larger projects, use npm and a build tool such as Vite: it serves your code instantly during development, lets you import npm packages, and bundles and minifies everything for production with `npm run build`.",
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
    <title>Modules</title>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <p id="summary"></p>
    <button id="report">Show detailed report</button>
    <pre id="output"></pre>
  </body>
</html>
`,
        },
        {
          filename: "lib/grading.js",
          lang: "js",
          source: `
export const PASS_MARK = 30;

export function average(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export default function gradeFor(score) {
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 45) return "C";
  if (score >= PASS_MARK) return "D";
  return "F";
}
`,
        },
        {
          filename: "lib/report.js",
          lang: "js",
          source: `
import gradeFor from "./grading.js";

export function buildReport(scores) {
  return scores.map((s, i) => \`Student \${i + 1}: \${s} (\${gradeFor(s)})\`).join("\\n");
}
`,
        },
        {
          filename: "main.js",
          lang: "js",
          source: `
import gradeFor, { average, PASS_MARK } from "./lib/grading.js";

const scores = [88, 42, 71, 25];
const avg = average(scores);
document.querySelector("#summary").textContent =
  \`Average \${avg.toFixed(1)} (\${gradeFor(avg)}), \${scores.filter((s) => s >= PASS_MARK).length} passed\`;

document.querySelector("#report").addEventListener("click", async () => {
  const { buildReport } = await import("./lib/report.js");   // loaded only on first click
  document.querySelector("#output").textContent = buildReport(scores);
});
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
npm create vite@latest results-app -- --template vanilla
cd results-app
npm install
npm run dev        # development server with instant reload
npm run build      # optimised files in dist/ ready to deploy
`,
        },
      ],
      keyPoints: [
        "Modules = one file, one responsibility, explicit `import`/`export`.",
        "In the browser, use `type=\"module\"` and include `.js` in import paths.",
        "Dynamic `import()` loads code on demand; Vite handles npm packages and production builds.",
      ],
      exercise:
        "Split the attendance counter from the Beginner track into modules: `state.js` (data and update functions), `view.js` (rendering) and `main.js` (event wiring). Then create a Vite project and move the code into it.",
    },
    {
      slug: "storage-and-json",
      title: "Saving Data: localStorage & JSON",
      summary: "Remember settings and data between visits with localStorage, safely converting to and from JSON.",
      body: [
        "`localStorage` stores text in the user's browser, per website, and keeps it after the page is closed. `sessionStorage` works the same way but is cleared when the tab closes. Both hold only strings, so convert objects with `JSON.stringify` and back with `JSON.parse`.",
        "Stored data can be missing, outdated or corrupted, and storage can be blocked (private browsing, full quota). Wrap reads and writes in `try/catch` and fall back to sensible defaults.",
        "Use localStorage for preferences, drafts and small app data. Never store passwords, tokens or personal data there — any script on the page can read it.",
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
    <title>Preferences</title>
    <style>
      body.dark { background: #0e1826; color: #e7ecf6; }
    </style>
    <script src="app.js" defer></script>
  </head>
  <body>
    <button id="theme">Toggle dark mode</button>
    <label>Draft note <textarea id="draft" rows="3"></textarea></label>
    <p id="visits"></p>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const KEY = "dolese.prefs.v1";
const DEFAULTS = { theme: "light", draft: "", visits: 0 };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };      // corrupted JSON or storage blocked
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn("Could not save preferences:", err);
  }
}

const prefs = loadPrefs();
prefs.visits += 1;
savePrefs(prefs);

const draft = document.querySelector("#draft");
document.body.classList.toggle("dark", prefs.theme === "dark");
draft.value = prefs.draft;
document.querySelector("#visits").textContent = \`You have visited \${prefs.visits} time(s).\`;

document.querySelector("#theme").addEventListener("click", () => {
  prefs.theme = prefs.theme === "dark" ? "light" : "dark";
  document.body.classList.toggle("dark", prefs.theme === "dark");
  savePrefs(prefs);
});

draft.addEventListener("input", () => {
  prefs.draft = draft.value;
  savePrefs(prefs);
});
`,
        },
      ],
      keyPoints: [
        "localStorage keeps strings per site; use JSON to store objects.",
        "Always handle missing or corrupted data and blocked storage.",
        "Never store secrets or personal data in localStorage.",
      ],
      exercise:
        "Add a \"font size\" setting (small / normal / large) saved in preferences. Add a \"Reset preferences\" button that clears the key with `localStorage.removeItem` and reloads the defaults.",
    },
    {
      slug: "project-todo-app",
      title: "Project: A Complete To-Do App",
      summary: "Combine state, rendering, delegation, filters and persistence into one well-structured app.",
      body: [
        "This project brings the whole level together. All data lives in one `state` object. Every change goes through a small function that updates the state, saves it, and calls `render()` — the page is always drawn from the data, never edited piecemeal.",
        "Events are delegated to the list, so new items need no extra listeners. Filters (All / Active / Done) are just a value in state that `render()` respects.",
        "Text typed by users is inserted with `textContent`, never `innerHTML`, so a task like `<img src=x onerror=alert(1)>` is shown as plain text instead of running as code.",
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
    <title>Tasks</title>
    <style>
      .done span { text-decoration: line-through; opacity: 0.6; }
      .filters button[aria-pressed="true"] { font-weight: bold; }
    </style>
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1>Tasks</h1>
    <form id="new-task">
      <input name="title" placeholder="What needs doing?" required maxlength="120" />
      <button>Add</button>
    </form>
    <div class="filters">
      <button data-filter="all">All</button>
      <button data-filter="active">Active</button>
      <button data-filter="done">Done</button>
    </div>
    <ul id="tasks"></ul>
    <p id="remaining"></p>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const STORAGE_KEY = "dolese.tasks.v1";

const state = {
  tasks: load(),
  filter: "all",
};

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function update(change) {
  change(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  render();
}

const list = document.querySelector("#tasks");
const form = document.querySelector("#new-task");

function render() {
  const visible = state.tasks.filter((t) =>
    state.filter === "all" ? true : state.filter === "done" ? t.done : !t.done,
  );

  list.replaceChildren(
    ...visible.map((task) => {
      const li = document.createElement("li");
      li.dataset.id = task.id;
      li.classList.toggle("done", task.done);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.className = "toggle";

      const title = document.createElement("span");
      title.textContent = task.title;       // safe: never innerHTML for user text

      const remove = document.createElement("button");
      remove.textContent = "Delete";
      remove.className = "delete";

      li.append(checkbox, " ", title, " ", remove);
      return li;
    }),
  );

  const left = state.tasks.filter((t) => !t.done).length;
  document.querySelector("#remaining").textContent = \`\${left} task\${left === 1 ? "" : "s"} left\`;
  for (const btn of document.querySelectorAll("[data-filter]")) {
    btn.setAttribute("aria-pressed", String(btn.dataset.filter === state.filter));
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = form.elements.title.value.trim();
  if (!title) return;
  update((s) => s.tasks.push({ id: crypto.randomUUID(), title, done: false }));
  form.reset();
});

list.addEventListener("click", (event) => {
  const id = event.target.closest("li")?.dataset.id;
  if (!id) return;
  if (event.target.matches(".toggle")) {
    update((s) => {
      const task = s.tasks.find((t) => t.id === id);
      task.done = !task.done;
    });
  } else if (event.target.matches(".delete")) {
    update((s) => { s.tasks = s.tasks.filter((t) => t.id !== id); });
  }
});

document.querySelector(".filters").addEventListener("click", (event) => {
  const filter = event.target.dataset.filter;
  if (filter) update((s) => { s.filter = filter; });
});

render();
`,
        },
      ],
      keyPoints: [
        "Single source of truth: state → render(); never patch the page by hand.",
        "Route every change through one `update()` that saves and re-renders.",
        "Insert user text with `textContent` to prevent script injection (XSS).",
      ],
      exercise:
        "Add: double-click a task to edit its title, a \"Clear completed\" button, a due date per task with overdue tasks highlighted, and keyboard support (Enter to save an edit, Escape to cancel).",
    },
  ],
};
