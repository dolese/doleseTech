import type { Practice } from "../../types";
import { regularExpressions as regularExpressionsPractice, workingWithApis as workingWithApisPractice, accessibility as accessibilityPractice } from "./more";

export const intermediate: Record<string, Practice> = {
  "events-and-forms": {
    solution: {
      notes: [
        "Each field has its own error element, and `validate` returns an object of field → message, so every problem shows next to the right input. The list's single click listener handles both Remove and Edit; Edit loads the row back into the form and removes it, so saving re-adds it.",
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
    <style>.error { color: #b00020; font-size: 0.85rem; min-height: 1.1em; margin: 2px 0 8px; }</style>
    <script src="app.js" defer></script>
  </head>
  <body>
    <form id="student-form" novalidate>
      <label>Name <input name="name" /></label>
      <p class="error" data-error-for="name"></p>
      <label>Email <input name="email" /></label>
      <p class="error" data-error-for="email"></p>
      <label>Form
        <select name="form">
          <option value="">Choose...</option>
          <option>1</option><option>2</option><option>3</option><option>4</option>
        </select>
      </label>
      <p class="error" data-error-for="form"></p>
      <button type="submit">Save</button>
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
const list = document.querySelector("#students");

function validate({ name, email, form: formNumber }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Name must have at least 2 letters.";
  const at = email.indexOf("@");
  if (at < 1 || !email.slice(at).includes(".")) errors.email = "Enter a valid email, e.g. amina@example.com.";
  if (!["1", "2", "3", "4"].includes(formNumber)) errors.form = "Choose a form from 1 to 4.";
  return errors;
}

function showErrors(errors) {
  for (const el of form.querySelectorAll("[data-error-for]")) {
    el.textContent = errors[el.dataset.errorFor] ?? "";
  }
}

function button(label, className) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.className = className;
  return b;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const errors = validate(data);
  showErrors(errors);
  if (Object.keys(errors).length > 0) return;

  const li = document.createElement("li");
  Object.assign(li.dataset, { name: data.name.trim(), email: data.email, form: data.form });
  li.append(\`\${data.name.trim()} (Form \${data.form}) - \${data.email} \`, button("Edit", "edit"), " ", button("Remove", "remove"));
  list.append(li);
  form.reset();
});

list.addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (!li) return;
  if (event.target.matches(".remove")) li.remove();
  if (event.target.matches(".edit")) {
    form.elements.name.value = li.dataset.name;
    form.elements.email.value = li.dataset.email;
    form.elements.form.value = li.dataset.form;
    li.remove();
    form.elements.name.focus();
  }
});
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why listen for the form's `submit` event instead of the button's `click`?",
        options: [
          "`click` doesn't work on buttons",
          "`submit` also fires when the user presses Enter in a field",
          "`submit` is faster",
          "Buttons can't have listeners",
        ],
        answer: 1,
        explanation: "Handling `submit` covers every way of sending the form.",
      },
      {
        question: "What does `event.preventDefault()` do in a submit handler?",
        options: [
          "Stops the browser's default action — reloading the page",
          "Clears the form",
          "Validates the inputs",
          "Stops other listeners",
        ],
        answer: 0,
        explanation: "Without it, the page reloads and your JavaScript's work is lost.",
      },
      {
        question: "What is event delegation?",
        options: [
          "Passing events to a server",
          "Adding a listener to every button",
          "Listening on a parent element and working out which child was clicked",
          "Delaying events with setTimeout",
        ],
        answer: 2,
        explanation: "One listener handles current and future items via `event.target.closest(...)`.",
      },
      {
        question: "Why validate again on the server if the page already validates?",
        options: [
          "Servers are smarter",
          "To double the error messages",
          "Browsers can't validate emails",
          "Client-side checks can be bypassed by anyone who sends requests directly",
        ],
        answer: 3,
        explanation: "Client validation is for convenience; server validation is for safety.",
      },
    ],
  },

  "closures-and-this": {
    solution: {
      notes: [
        "`balance` lives only inside `createBankAccount`, so nothing outside can change it except through the returned functions — real private state. `makeMultiplier` returns a function that remembers its own `n`.",
      ],
      code: [
        {
          filename: "closures-solution.js",
          lang: "js",
          source: `
function createBankAccount(owner) {
  let balance = 0;
  return {
    deposit(amount) {
      if (amount <= 0) throw new RangeError("Deposit must be positive");
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new RangeError(\`\${owner} has only \${balance}\`);
      balance -= amount;
      return balance;
    },
    getBalance: () => balance,
  };
}

const account = createBankAccount("Amina");
account.deposit(50000);
account.withdraw(20000);
console.log(account.getBalance(), account.balance);   // 30000 undefined

try {
  account.withdraw(100000);
} catch (err) {
  console.log(err.message);                        // Amina has only 30000
}

const makeMultiplier = (n) => (x) => x * n;
const double = makeMultiplier(2);
const triple = makeMultiplier(3);
console.log(double(21), triple(5));                // 42 15
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is a closure?",
        options: [
          "A function that remembers variables from the scope where it was created",
          "A way to close the browser",
          "A function with no parameters",
          "A finished Promise",
        ],
        answer: 0,
        explanation: "Inner functions keep access to outer variables even after the outer function returns.",
      },
      {
        question: "For `obj.method()`, what is `this` inside `method`?",
        options: ["The window", "`undefined`", "The function itself", "`obj`"],
        answer: 3,
        explanation: "`this` is set by how a function is called — here, through `obj`.",
      },
      {
        question: "Why are arrow functions handy inside methods for callbacks like `map`?",
        options: [
          "They are faster",
          "They don't have their own `this`, so they use the method's `this`",
          "They can't access variables",
          "They prevent errors",
        ],
        answer: 1,
        explanation: "A regular function callback would get a different `this`.",
      },
      {
        question: "What does `fn.bind(obj)` return?",
        options: [
          "The result of calling fn",
          "A copy of obj",
          "A new function whose `this` is always `obj`",
          "Nothing",
        ],
        answer: 2,
        explanation: "Useful when passing a method as a callback.",
      },
    ],
  },

  "classes-and-prototypes": {
    solution: {
      notes: [
        "`Shape` defines the shared `describe()` method and expects subclasses to provide an `area` getter. `toSorted` returns a new array ordered by area, leaving the original untouched.",
      ],
      code: [
        {
          filename: "shapes.js",
          lang: "js",
          source: `
class Shape {
  get area() {
    throw new Error("Subclasses must implement area");
  }

  describe() {
    return \`\${this.constructor.name} with area \${this.area.toFixed(2)}\`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  get area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  get area() {
    return this.width * this.height;
  }
}

const shapes = [new Rectangle(3, 4), new Circle(1), new Rectangle(2, 2), new Circle(2)];
for (const s of shapes.toSorted((a, b) => a.area - b.area)) console.log(s.describe());
// Circle with area 3.14 / Rectangle with area 4.00 / Rectangle with area 12.00 / Circle with area 12.57
`,
        },
      ],
    },
    quiz: [
      {
        question: "What must a subclass constructor call before using `this`?",
        options: ["`this.init()`", "`super(...)`", "`new Parent()`", "Nothing"],
        answer: 1,
        explanation: "`super(...)` runs the parent's constructor first.",
      },
      {
        question: "What makes a field written as `#scores` special?",
        options: [
          "It is static",
          "It is a number",
          "It is private — code outside the class can't read or change it",
          "It is a comment",
        ],
        answer: 2,
        explanation: "`#` fields give real encapsulation in JavaScript classes.",
      },
      {
        question: "Where do a class's methods live?",
        options: [
          "On the class's prototype, shared by all instances",
          "Copied into every object",
          "In the global scope",
          "In localStorage",
        ],
        answer: 0,
        explanation: "Objects link to their prototype; method lookups walk up the chain.",
      },
      {
        question: "What is a `static` method such as `Student.fromCSV(line)`?",
        options: [
          "A method that can't change",
          "A private method",
          "A method that runs automatically",
          "A method called on the class itself, not on instances",
        ],
        answer: 3,
        explanation: "Static methods are often factories that build instances.",
      },
    ],
  },

  "async-and-fetch": {
    solution: {
      notes: [
        "Keep the loaded students in a variable and re-render whenever the search text or form filter changes — no new request needed. On failure, the status shows the error and a Retry button that simply calls `load()` again.",
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
    <title>Results</title>
    <script src="app.js" defer></script>
  </head>
  <body>
    <input id="search" placeholder="Search names..." />
    <select id="form-filter">
      <option value="">All forms</option>
      <option value="3">Form 3</option>
      <option value="4">Form 4</option>
    </select>
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
const DATA_URL = "students.json";   // change to "studentz.json" to test the error state
const statusEl = document.querySelector("#status");
const list = document.querySelector("#results");
const search = document.querySelector("#search");
const formFilter = document.querySelector("#form-filter");
let students = [];

function render() {
  const term = search.value.trim().toLowerCase();
  const visible = students
    .filter((s) => s.name.toLowerCase().includes(term))
    .filter((s) => !formFilter.value || s.form === Number(formFilter.value));
  list.replaceChildren(
    ...visible.map((s) => {
      const li = document.createElement("li");
      li.textContent = \`\${s.name} (Form \${s.form}) - \${s.average.toFixed(1)}\`;
      return li;
    }),
  );
  statusEl.textContent = \`Showing \${visible.length} of \${students.length} students.\`;
}

async function load() {
  statusEl.textContent = "Loading...";
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    students = await response.json();
    render();
  } catch (err) {
    statusEl.textContent = \`Could not load results (\${err.message}). \`;
    const retry = document.createElement("button");
    retry.textContent = "Retry";
    retry.addEventListener("click", load);
    statusEl.append(retry);
  }
}

search.addEventListener("input", render);
formFilter.addEventListener("change", render);
load();
`,
        },
      ],
    },
    quiz: [
      {
        question: "Does `fetch` reject its Promise when the server returns 404?",
        options: [
          "Yes, for every error code",
          "No — it only rejects on network failure, so check `response.ok`",
          "Only for 500 errors",
          "It throws synchronously",
        ],
        answer: 1,
        explanation: "HTTP error statuses still resolve; you must check `response.ok` yourself.",
      },
      {
        question: "What does `await response.json()` do?",
        options: [
          "Reads the response body and parses it as JSON",
          "Sends JSON to the server",
          "Checks the status code",
          "Converts JSON to a string",
        ],
        answer: 0,
        explanation: "Reading the body is asynchronous too, hence the `await`.",
      },
      {
        question: "What should a good data-loading interface show?",
        options: [
          "Only the data",
          "A blank page until the data arrives",
          "An alert box for each request",
          "Loading, success and error states (with a way to retry)",
        ],
        answer: 3,
        explanation: "Users should always know what's happening.",
      },
      {
        question: "Why re-enable the Load button in a `finally` block?",
        options: [
          "`finally` runs faster",
          "It's required by fetch",
          "`finally` runs whether the request succeeded or failed",
          "To hide errors",
        ],
        answer: 2,
        explanation: "Otherwise a failed request could leave the button disabled forever.",
      },
    ],
  },

  "modules-and-tooling": {
    solution: {
      notes: [
        "Each module has one job: `state.js` owns the data and the rules for changing it, `view.js` turns state into DOM updates, and `main.js` connects button clicks to state changes and re-renders.",
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
    <title>Attendance</title>
    <style>.full { color: #b5541e; font-weight: bold; }</style>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <p>Present: <span id="count">0</span> / 5</p>
    <button id="add">Mark present</button>
    <button id="reset">Reset</button>
    <ul id="log"></ul>
  </body>
</html>
`,
        },
        {
          filename: "state.js",
          lang: "js",
          source: `
export const LIMIT = 5;

export const state = { present: 0, arrivals: [] };

export function markPresent(time) {
  if (state.present >= LIMIT) return;
  state.present++;
  state.arrivals.push(time);
}

export function reset() {
  state.present = 0;
  state.arrivals = [];
}
`,
        },
        {
          filename: "view.js",
          lang: "js",
          source: `
import { LIMIT } from "./state.js";

const countEl = document.querySelector("#count");
const addBtn = document.querySelector("#add");
const log = document.querySelector("#log");

export function render(state) {
  countEl.textContent = state.present;
  countEl.classList.toggle("full", state.present === LIMIT);
  addBtn.disabled = state.present === LIMIT;
  log.replaceChildren(
    ...state.arrivals.map((time, i) => {
      const li = document.createElement("li");
      li.textContent = \`Student \${i + 1} arrived at \${time}\`;
      return li;
    }),
  );
}
`,
        },
        {
          filename: "main.js",
          lang: "js",
          source: `
import { markPresent, reset, state } from "./state.js";
import { render } from "./view.js";

document.querySelector("#add").addEventListener("click", () => {
  markPresent(new Date().toLocaleTimeString());
  render(state);
});

document.querySelector("#reset").addEventListener("click", () => {
  reset();
  render(state);
});

render(state);
`,
        },
      ],
    },
    quiz: [
      {
        question: "How do you load an ES module as a page's entry point?",
        options: [
          "`<script src=\"main.js\" async>`",
          "`<script type=\"module\" src=\"main.js\">`",
          "`<module src=\"main.js\">`",
          "`<link rel=\"module\" href=\"main.js\">`",
        ],
        answer: 1,
        explanation: "`type=\"module\"` enables import/export (and defers the script automatically).",
      },
      {
        question: "Which browser import path is correct?",
        options: ["`import x from \"lib/grading\"`", "`import x from \"grading\"`", "`import x from \"./lib/grading.js\"`", "`import x from lib/grading.js`"],
        answer: 2,
        explanation: "Without a bundler, browsers need full relative paths including `.js`.",
      },
      {
        question: "What does dynamic `import(\"./report.js\")` let you do?",
        options: [
          "Load code only when it's needed, making the first page load faster",
          "Import from another website",
          "Import CSS",
          "Run code on the server",
        ],
        answer: 0,
        explanation: "It returns a Promise for the module, loaded on demand.",
      },
      {
        question: "What does `npm run build` produce in a Vite project?",
        options: [
          "A development server",
          "A new npm package",
          "Test results",
          "Optimised, bundled files in `dist/` ready to deploy",
        ],
        answer: 3,
        explanation: "Vite bundles and minifies for production.",
      },
    ],
  },

  "storage-and-json": {
    solution: {
      notes: [
        "The font size becomes another preference: a `<select>` changes it, a class on `<body>` applies it, and it's saved with the others. Reset removes the stored key, restores the defaults and re-applies them.",
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
      body.size-small { font-size: 14px; }
      body.size-normal { font-size: 16px; }
      body.size-large { font-size: 20px; }
    </style>
    <script src="app.js" defer></script>
  </head>
  <body>
    <button id="theme">Toggle dark mode</button>
    <label>Font size
      <select id="font-size">
        <option value="small">Small</option>
        <option value="normal">Normal</option>
        <option value="large">Large</option>
      </select>
    </label>
    <button id="reset">Reset preferences</button>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const KEY = "dolese.prefs.v1";
const DEFAULTS = { theme: "light", fontSize: "normal" };

function loadPrefs() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

function savePrefs() {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn("Could not save preferences:", err);
  }
}

function apply() {
  document.body.classList.toggle("dark", prefs.theme === "dark");
  document.body.classList.remove("size-small", "size-normal", "size-large");
  document.body.classList.add(\`size-\${prefs.fontSize}\`);
  fontSelect.value = prefs.fontSize;
}

const fontSelect = document.querySelector("#font-size");
let prefs = loadPrefs();
apply();

document.querySelector("#theme").addEventListener("click", () => {
  prefs.theme = prefs.theme === "dark" ? "light" : "dark";
  savePrefs();
  apply();
});

fontSelect.addEventListener("change", () => {
  prefs.fontSize = fontSelect.value;
  savePrefs();
  apply();
});

document.querySelector("#reset").addEventListener("click", () => {
  localStorage.removeItem(KEY);
  prefs = { ...DEFAULTS };
  apply();
});
`,
        },
      ],
    },
    quiz: [
      {
        question: "What can `localStorage` store directly?",
        options: ["Any JavaScript object", "Only strings", "Only numbers", "Files"],
        answer: 1,
        explanation: "Convert objects with `JSON.stringify` and back with `JSON.parse`.",
      },
      {
        question: "How does `sessionStorage` differ from `localStorage`?",
        options: [
          "It is shared between all websites",
          "It stores more data",
          "It is cleared when the tab is closed",
          "It is encrypted",
        ],
        answer: 2,
        explanation: "localStorage persists; sessionStorage lasts for the tab's session.",
      },
      {
        question: "Why wrap `JSON.parse(localStorage.getItem(key))` in try/catch?",
        options: [
          "Stored data may be corrupted, or storage may be blocked (e.g. private browsing)",
          "JSON.parse is asynchronous",
          "localStorage is slow",
          "It's required syntax",
        ],
        answer: 0,
        explanation: "Fall back to sensible defaults instead of crashing.",
      },
      {
        question: "Which of these should never go in localStorage?",
        options: ["A theme preference", "A draft note", "The last selected tab", "A password or access token"],
        answer: 3,
        explanation: "Any script running on the page can read localStorage.",
      },
    ],
  },

  "project-todo-app": {
    solution: {
      notes: [
        "Every feature follows the same pattern: change `state` in `update()`, then `render()`. Editing stores the id being edited in state; the row then renders an input instead of the title. Enter saves, Escape cancels, and the input saves on blur too. Overdue tasks get a class when their due date is before today and they aren't done.",
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
      .done .title { text-decoration: line-through; opacity: 0.6; }
      .overdue .due { color: #b00020; font-weight: bold; }
    </style>
    <script src="app.js" defer></script>
  </head>
  <body>
    <form id="new-task">
      <input name="title" placeholder="What needs doing?" required maxlength="120" />
      <input name="due" type="date" />
      <button>Add</button>
    </form>
    <ul id="tasks"></ul>
    <button id="clear-done">Clear completed</button>
    <p id="remaining"></p>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const KEY = "dolese.tasks.v2";
const state = { tasks: load(), editing: null };

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function update(change) {
  change(state);
  localStorage.setItem(KEY, JSON.stringify(state.tasks));
  render();
}

const list = document.querySelector("#tasks");
const form = document.querySelector("#new-task");
const today = new Date().toISOString().slice(0, 10);

function render() {
  list.replaceChildren(
    ...state.tasks.map((task) => {
      const li = document.createElement("li");
      li.dataset.id = task.id;
      li.classList.toggle("done", task.done);
      li.classList.toggle("overdue", Boolean(task.due) && task.due < today && !task.done);

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.checked = task.done;
      toggle.className = "toggle";

      let title;
      if (state.editing === task.id) {
        title = document.createElement("input");
        title.className = "edit";
        title.value = task.title;
      } else {
        title = document.createElement("span");
        title.className = "title";
        title.textContent = task.title;
      }

      const due = document.createElement("span");
      due.className = "due";
      due.textContent = task.due ? \` (due \${task.due})\` : "";

      const remove = document.createElement("button");
      remove.textContent = "Delete";
      remove.className = "delete";

      li.append(toggle, " ", title, due, " ", remove);
      return li;
    }),
  );
  list.querySelector(".edit")?.focus();
  const left = state.tasks.filter((t) => !t.done).length;
  document.querySelector("#remaining").textContent = \`\${left} task\${left === 1 ? "" : "s"} left\`;
}

function finishEdit(input, save) {
  const id = input.closest("li").dataset.id;
  update((s) => {
    const title = input.value.trim();
    if (save && title) s.tasks.find((t) => t.id === id).title = title;
    s.editing = null;
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = form.elements.title.value.trim();
  if (!title) return;
  update((s) => s.tasks.push({ id: crypto.randomUUID(), title, due: form.elements.due.value, done: false }));
  form.reset();
});

list.addEventListener("click", (event) => {
  const id = event.target.closest("li")?.dataset.id;
  if (event.target.matches(".toggle")) update((s) => { const t = s.tasks.find((x) => x.id === id); t.done = !t.done; });
  if (event.target.matches(".delete")) update((s) => { s.tasks = s.tasks.filter((t) => t.id !== id); });
});

list.addEventListener("dblclick", (event) => {
  if (event.target.matches(".title")) update((s) => { s.editing = event.target.closest("li").dataset.id; });
});

list.addEventListener("keydown", (event) => {
  if (!event.target.matches(".edit")) return;
  if (event.key === "Enter") finishEdit(event.target, true);
  if (event.key === "Escape") finishEdit(event.target, false);
});

list.addEventListener("focusout", (event) => {
  if (event.target.matches(".edit") && state.editing) finishEdit(event.target, true);
});

document.querySelector("#clear-done").addEventListener("click", () => {
  update((s) => { s.tasks = s.tasks.filter((t) => !t.done); });
});

render();
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does \"single source of truth\" mean in this app?",
        options: [
          "All data lives in one `state` object, and the page is always drawn from it",
          "Only one task can exist",
          "The HTML file holds the data",
          "Every function has its own copy of the tasks",
        ],
        answer: 0,
        explanation: "Never patch the page by hand; change state and re-render.",
      },
      {
        question: "Why does every change go through one `update()` function?",
        options: [
          "It makes the app slower but safer",
          "JavaScript requires it",
          "So saving and re-rendering always happen — they can't be forgotten",
          "It encrypts the data",
        ],
        answer: 2,
        explanation: "Centralising change handling keeps state, storage and screen in sync.",
      },
      {
        question: "A user adds the task `<img src=x onerror=alert(1)>`. What does the app show?",
        options: [
          "A broken image and an alert",
          "Nothing",
          "An error message",
          "The text exactly as typed, because it's inserted with `textContent`",
        ],
        answer: 3,
        explanation: "`textContent` never interprets HTML, so injected code can't run.",
      },
      {
        question: "Why do new tasks need no extra event listeners?",
        options: [
          "Browsers add them automatically",
          "Events are delegated to the list, which already has listeners",
          "Tasks don't support clicks",
          "Listeners are stored in localStorage",
        ],
        answer: 1,
        explanation: "One listener on the parent handles every current and future item.",
      },
    ],
  },
  "regular-expressions": regularExpressionsPractice,
  "working-with-apis": workingWithApisPractice,
  "accessibility": accessibilityPractice,
};
