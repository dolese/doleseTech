import type { Lesson } from "../types";

// Lessons added after the first release; inserted into their levels in
// beginner.ts / intermediate.ts / advanced.ts.

export const datesNumbersIntl: Lesson = {
  slug: "dates-numbers-and-intl",
  title: "Numbers, Dates & Intl Formatting",
  summary: "Floating-point pitfalls, safe money handling, the Date object and locale-aware formatting with Intl.",
  body: [
    "JavaScript has one `number` type for integers and decimals, stored as 64-bit floating point. That is why `0.1 + 0.2` is not exactly `0.3`, and why `toFixed` can surprise you. For money, store whole shillings (or cents) as integers and only format them for display. Convert text with `Number(text)`, which gives `NaN` for anything that isn't a number; `parseInt(text, 10)` stops at the first non-digit.",
    "A `Date` stores one moment in time (milliseconds since 1 January 1970 UTC). Watch out for two traps: months are 0-based in `new Date(year, month, day)` (10 is November), and `new Date(\"2026-03-14\")` is read as midnight UTC while `new Date(2026, 2, 14)` is midnight in the computer's local time zone. Subtracting two dates gives milliseconds; to add days, change the date with `setDate(getDate() + n)`.",
    "`Intl` formats numbers, currencies, percentages, dates and relative times for any locale and time zone, with no library. Create a formatter once (`new Intl.NumberFormat(...)`, `new Intl.DateTimeFormat(...)`) and reuse it. Pass `timeZone: \"Africa/Dar_es_Salaam\"` to show East Africa Time whatever the visitor's computer is set to.",
  ],
  code: [
    {
      filename: "dates.js",
      lang: "js",
      source: `
// Numbers: one type for integers and decimals (64-bit floating point)
console.log(0.1 + 0.2);                         // 0.30000000000000004
console.log((0.1 + 0.2).toFixed(2));            // "0.30" (a string)
console.log((1.005).toFixed(2));                // "1.00", not "1.01": 1.005 is stored as 1.00499...
console.log(Number("42"), Number("42abc"), parseInt("42abc", 10));   // 42 NaN 42
console.log(Number.isInteger(5.0), Number.MAX_SAFE_INTEGER);

// Money: keep whole shillings (or cents) as integers, format only for display
const fees = [150000, 75000, 25500];
const total = fees.reduce((sum, f) => sum + f, 0);
const tzs = new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });
console.log(tzs.format(total));
console.log(new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(2 / 3));

// Dates: months are 0-based in the constructor (0 = January)
const exams = new Date(2026, 10, 2);             // 2 November 2026, local time
const registered = new Date("2026-03-14T09:30:00+03:00");
const DAY = 24 * 60 * 60 * 1000;
console.log(Math.round((exams - registered) / DAY), "days until exams");
console.log(registered.toISOString());          // always UTC: 2026-03-14T06:30:00.000Z

// Add days by changing the date, never by assuming 30-day months
const deadline = new Date(registered);
deadline.setDate(deadline.getDate() + 42);

const long = new Intl.DateTimeFormat("en-GB", {
  weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Dar_es_Salaam",
});
console.log("Fee deadline:", long.format(deadline));
const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dar_es_Salaam" });
console.log("Paid at", time.format(registered), "EAT");

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
console.log(rtf.format(-1, "day"), "|", rtf.format(3, "week"));
`,
    },
  ],
  keyPoints: [
    "Floating point is approximate: keep money in whole units and format at the edge.",
    "`Date` months are 0-based; date-only ISO strings are UTC, constructor numbers are local time.",
    "`Intl.NumberFormat`, `DateTimeFormat` and `RelativeTimeFormat` handle currency, locale and time zone.",
  ],
  exercise:
    "Write `daysUntil(isoDay, today)` and `instalments(total, count, firstDue)`, which splits a fee into monthly payments (the last payment takes any remainder, and a due date of 31 January becomes 28 February, not 3 March). Print the plan as a table with dates and TZS amounts formatted by Intl.",
};

export const regularExpressions: Lesson = {
  slug: "regular-expressions",
  title: "Regular Expressions",
  summary: "Validate and extract text with patterns: test, match, matchAll, named groups, replace and split.",
  body: [
    "A regular expression describes a text pattern. Write it as a literal between slashes, `/^0[67]\\d{8}$/`, followed by flags: `g` finds every match, `i` ignores case. The essentials are `\\d` (digit), `\\w` (letter, digit or _), `\\s` (whitespace), `.` (any character), classes like `[67]`, quantifiers `+ * ? {8}`, and the anchors `^` and `$` for the start and end. `\\b` marks a word boundary.",
    "`regex.test(text)` answers yes or no. `text.match(regex)` without `g` returns the first match and its capture groups; with `g` it returns every matched string. `text.matchAll(regex)` (needs `g`) gives full match objects for every match, and named groups `(?<score>\\d+)` make the results readable through `m.groups`.",
    "`text.replace(regex, \"$1 $2\")` rewrites matches using the groups, and passing a function lets you compute each replacement. `text.split(/\\s*,\\s*/)` splits on a pattern. Keep patterns small and test them on good and bad input, and remember that a regex check in the browser is only for user feedback: the server must validate again.",
  ],
  code: [
    {
      filename: "patterns.js",
      lang: "js",
      source: `
// A regex literal: /pattern/flags. test() answers yes/no.
const phone = /^(?:\\+255|0)([67]\\d{8})$/;
for (const raw of ["0712345678", "+255754000111", "0812345678", "071234567"]) {
  const m = raw.match(phone);
  console.log(raw.padEnd(15), m ? "valid -> 0" + m[1] : "invalid");
}

// g flag + matchAll: every match, with capture groups
const text = "Amina scored 88 in Maths, Juma 42 in Maths and Neema 71 in Biology.";
console.log(text.match(/\\d+/g));                                   // [ '88', '42', '71' ]

const result = /(?<name>[A-Z][a-z]+)(?: scored)? (?<score>\\d+) in (?<subject>\\w+)/g;
for (const m of text.matchAll(result)) {
  const { name, score, subject } = m.groups;
  console.log(name, subject, Number(score));
}

// replace: $1-style references, or a function for each match
console.log("Juma   Said ,   Form   4".replace(/\\s+/g, " ").replace(" ,", ","));
console.log("0712345678".replace(/(\\d{4})(\\d{3})(\\d{3})/, "$1 $2 $3"));
console.log(text.replace(/\\d+/g, (n) => (Number(n) >= 50 ? n : \`\${n} (fail)\`)));

// i = ignore case, \\b = word boundary
console.log(/\\bexam\\b/i.test("Mock EXAM starts Monday"), /\\bexam\\b/.test("Mock exams start Monday"));

// split on a pattern
console.log("Maths; Biology ,Chemistry;Physics".split(/\\s*[;,]\\s*/));
`,
    },
  ],
  keyPoints: [
    "Anchor validation patterns with `^...$` so the whole string must match.",
    "Use the `g` flag with `matchAll` and named groups to extract structured data.",
    "`replace` accepts `$1` references or a function, and `split` accepts a pattern.",
  ],
  exercise:
    "Parse lines like `ADM-2026-0001 : Amina Hassan : 88` into objects `{ adm, year, name, score }` using named groups. Reject lines with a badly formatted admission number, scores above 100 or unreadable text, and print why. Then convert every date like 02/11/2026 in a notice to ISO format with `replace`.",
};

export const workingWithApis: Lesson = {
  slug: "working-with-apis",
  title: "Working with APIs: POST, Headers & Errors",
  summary: "Send JSON with fetch, add auth headers, handle HTTP errors and timeouts, and cancel requests with AbortController.",
  body: [
    "Reading data is only half of using an API. To create something, call `fetch(url, { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify(data) })`. Protected APIs usually expect a token in the `Authorization: Bearer <token>` header. The small server below uses only Node's built-in `http` module, so you can practise against it locally (`node server.js`, Node 18 or newer).",
    "`fetch` only rejects when the request could not be made at all (offline, DNS failure, cancelled). A 401, 404, 422 or 500 response still resolves, so always check `res.ok` or `res.status`. Wrapping fetch in one `request()` helper means every call gets the same headers, JSON handling and errors: a custom `ApiError` that carries the status.",
    "Never wait forever: `AbortSignal.timeout(ms)` cancels a request that takes too long, and an `AbortController` lets you cancel on demand, for example when the user types a new search before the old one finished. A cancelled fetch rejects with an `AbortError` (or `TimeoutError`), which you usually ignore rather than show. In a browser page calling a different origin, the server must also send CORS headers.",
  ],
  code: [
    {
      filename: "package.json",
      lang: "json",
      source: `
{
  "name": "students-api-demo",
  "type": "module",
  "private": true
}
`,
    },
    {
      filename: "server.js",
      lang: "js",
      source: `
// A tiny practice API using only Node's built-in http module: node server.js
import { createServer } from "node:http";

const students = [{ id: 1, name: "Amina Hassan", form: 4 }];
let flakyCalls = 0;

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let text = "";
  for await (const chunk of req) text += chunk;
  return JSON.parse(text || "{}");
}

createServer(async (req, res) => {
  if (req.headers.authorization !== "Bearer demo-token") return send(res, 401, { error: "Missing or wrong token" });

  if (req.method === "GET" && req.url === "/students") return send(res, 200, students);

  if (req.method === "POST" && req.url === "/students") {
    let body;
    try {
      body = await readJson(req);
    } catch {
      return send(res, 400, { error: "Body must be JSON" });
    }
    if (typeof body.name !== "string" || body.name.trim().length < 2) return send(res, 422, { error: "name is required" });
    const student = { id: students.length + 1, name: body.name.trim(), form: Number(body.form) || 1 };
    students.push(student);
    return send(res, 201, student);
  }

  if (req.url === "/slow") return setTimeout(() => send(res, 200, { ok: true }), 3000);

  // Fails twice with 503, then succeeds: used in the exercise.
  if (req.url === "/flaky") return ++flakyCalls % 3 === 0 ? send(res, 200, { ok: true, attempt: flakyCalls }) : send(res, 503, { error: "Try again" });

  send(res, 404, { error: "Not found" });
}).listen(3000, () => console.log("API on http://localhost:3000"));
`,
    },
    {
      filename: "api.js",
      lang: "js",
      source: `
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const BASE_URL = "http://localhost:3000";

export async function request(path, { method = "GET", body, token, timeoutMs = 2000 } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = \`Bearer \${token}\`;

  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),       // gives up if the server is too slow
    });
  } catch (err) {
    if (err.name === "TimeoutError") throw new ApiError(0, \`Timed out after \${timeoutMs} ms\`);
    throw new ApiError(0, \`Network error: \${err.message}\`);
  }

  const data = res.headers.get("Content-Type")?.includes("application/json") ? await res.json() : null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? res.statusText);   // fetch does NOT throw on 4xx/5xx
  return data;
}
`,
    },
    {
      filename: "client.js",
      lang: "js",
      source: `
// Start the server in one terminal (node server.js), then run: node client.js
import { ApiError, request } from "./api.js";

const token = "demo-token";

const created = await request("/students", { method: "POST", body: { name: "Juma Said", form: 3 }, token });
console.log("Created:", created);

console.log("All:", await request("/students", { token }));

for (const attempt of [
  () => request("/students", { method: "POST", body: { name: "" }, token }),
  () => request("/students"),
  () => request("/slow", { token, timeoutMs: 500 }),
]) {
  try {
    await attempt();
  } catch (err) {
    if (err instanceof ApiError) console.log(\`Failed (\${err.status}): \${err.message}\`);
    else throw err;
  }
}

// Cancel on demand: e.g. the user typed again before the last search finished
const controller = new AbortController();
const pending = fetch("http://localhost:3000/slow", { headers: { Authorization: \`Bearer \${token}\` }, signal: controller.signal });
controller.abort();
await pending.catch((err) => console.log("Cancelled:", err.name));
`,
    },
  ],
  keyPoints: [
    "Send JSON with `method`, a `Content-Type` header and `JSON.stringify(body)`.",
    "fetch does not throw on HTTP errors: check `res.ok` and raise your own error with the status.",
    "Use `AbortSignal.timeout` and `AbortController` so requests can time out or be cancelled.",
  ],
  exercise:
    "Write `requestWithRetry(path, options, { retries, baseDelayMs })` on top of `request()`. It retries network errors, timeouts and 5xx responses with exponential backoff (200, 400, 800 ms...), but never retries 4xx errors. Test it against the server's `/flaky` route, which fails twice before succeeding.",
};

export const accessibility: Lesson = {
  slug: "accessibility",
  title: "Accessibility (a11y)",
  summary: "Build pages everyone can use: semantic HTML, labels, keyboard support, focus management and ARIA.",
  body: [
    "Many people use the web with a keyboard only, a screen reader, zoom or voice control. Most accessibility comes free from semantic HTML: a real `<button>` is focusable and works with Enter and Space, `<label for>` gives every input a spoken name and a bigger click target, and headings and `<main>` let screen-reader users jump around the page. A `<div onclick>` has none of this.",
    "Forms should explain problems in words, not only colour. Link each error message to its input with `aria-describedby`, mark the field with `aria-invalid=\"true\"` and move focus to the first invalid field. A live region (`role=\"status\"`) announces messages such as \"Saved\" without moving focus. Show where focus is with `:focus-visible` styles. Never remove the outline without a replacement.",
    "Use ARIA only to describe what HTML cannot: `aria-expanded` on a button that shows and hides content, roles for custom widgets such as tabs. The native `<dialog>` element with `showModal()` traps focus and closes on Escape; afterwards, return focus to where the user was. Test with only the keyboard (Tab, Shift+Tab, Enter, Escape) and run an automated checker such as Lighthouse or axe.",
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
    <title>Register a student</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 1rem auto; padding: 0 1rem; }
      label { display: block; margin-top: 0.75rem; font-weight: 600; }
      input { display: block; padding: 0.4rem; font-size: 1rem; }
      [aria-invalid="true"] { border: 2px solid #b00020; }
      .error { color: #b00020; margin: 0.25rem 0 0; }
      :focus-visible { outline: 3px solid #1a73e8; outline-offset: 2px; }
      .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    </style>
    <script src="app.js" defer></script>
  </head>
  <body>
    <main>
      <h1>Register a student</h1>
      <form id="register" novalidate>
        <label for="name">Full name</label>
        <input id="name" name="name" autocomplete="name" aria-describedby="name-error" />
        <p class="error" id="name-error"></p>

        <label for="phone">Parent's phone <span class="visually-hidden">(10 digits, starting with 0)</span></label>
        <input id="phone" name="phone" type="tel" inputmode="numeric" aria-describedby="phone-hint phone-error" />
        <p id="phone-hint">e.g. 0712345678</p>
        <p class="error" id="phone-error"></p>

        <button type="button" id="fees-toggle" aria-expanded="false" aria-controls="fees">Show fee details</button>
        <div id="fees" hidden>
          <p>Tuition TSh 150,000 per term. Uniform TSh 45,000.</p>
        </div>

        <p><button type="submit">Register</button></p>
      </form>

      <!-- Screen readers announce changes to a live region without moving focus -->
      <p id="status" role="status"></p>

      <dialog id="confirm" aria-labelledby="confirm-title">
        <h2 id="confirm-title">Register this student?</h2>
        <p id="confirm-text"></p>
        <form method="dialog">
          <button value="cancel">Cancel</button>
          <button value="ok">Yes, register</button>
        </form>
      </dialog>
    </main>
  </body>
</html>
`,
    },
    {
      filename: "app.js",
      lang: "js",
      source: `
const form = document.querySelector("#register");
const status = document.querySelector("#status");
const dialog = document.querySelector("#confirm");
const toggle = document.querySelector("#fees-toggle");

// A disclosure: a real <button> is focusable and works with Enter/Space for free
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  document.getElementById(toggle.getAttribute("aria-controls")).hidden = open;
  toggle.textContent = open ? "Show fee details" : "Hide fee details";
});

function setError(input, message) {
  document.getElementById(\`\${input.id}-error\`).textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

function validate() {
  const name = form.elements.name;
  const phone = form.elements.phone;
  setError(name, name.value.trim().length < 2 ? "Enter the student's full name." : "");
  setError(phone, /^0[67]\\d{8}$/.test(phone.value.trim()) ? "" : "Enter a 10-digit phone number starting with 06 or 07.");
  return form.querySelector('[aria-invalid="true"]');
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const firstInvalid = validate();
  if (firstInvalid) {
    firstInvalid.focus();                        // take keyboard and screen-reader users to the problem
    status.textContent = "Please fix the highlighted fields.";
    return;
  }
  status.textContent = "";
  document.querySelector("#confirm-text").textContent = \`\${form.elements.name.value.trim()}, parent phone \${form.elements.phone.value.trim()}\`;
  dialog.showModal();                            // traps focus inside; Escape closes it
});

dialog.addEventListener("close", () => {
  if (dialog.returnValue === "ok") {
    status.textContent = \`\${form.elements.name.value.trim()} registered.\`;
    form.reset();
    form.elements.name.focus();
  } else {
    form.querySelector('button[type="submit"]').focus();   // return focus where the user was
  }
});
`,
    },
  ],
  keyPoints: [
    "Semantic elements (`button`, `label`, `main`, headings) give keyboard and screen-reader support for free.",
    "Tie errors to inputs with `aria-describedby` and `aria-invalid`, and move focus to the problem.",
    "Announce changes with a live region, manage focus around dialogs and always keep visible focus styles.",
  ],
  exercise:
    "Build accessible tabs for Maths, Biology and Chemistry results: `role=\"tablist\"`, `tab` and `tabpanel`, `aria-selected`, and a roving tabindex so only the current tab is in the Tab order. Left/Right arrows move between tabs (wrapping around), and Home/End jump to the first and last.",
};

export const testingJavascript: Lesson = {
  slug: "testing-javascript",
  title: "Testing JavaScript",
  summary: "Unit tests with Node's built-in test runner: assertions, table tests, async code, mocks and coverage.",
  body: [
    "Automated tests check that your code still does what it should after every change. Node (20 or newer; 22 LTS recommended) ships a complete test runner, so you need no packages: put tests in files named `*.test.js`, import `describe`/`it` from `node:test` and `assert` from `node:assert/strict`, and run `node --test`. Vitest and Jest use almost the same `describe`/`it`/`expect` style, so the skills carry over.",
    "Good unit tests are small and specific: one behaviour per test, with a name that says what should happen. Test the boundaries (74 and 75, empty lists) and the error cases with `assert.throws` and `assert.rejects`. A table of input → expected output keeps many cases readable.",
    "Code that talks to the network, the clock or storage is easier to test when the dependency is passed in as a parameter: a test can pass a fake. `mock.fn()` creates a fake that records its calls, `mock.method(obj, \"name\")` replaces a method (such as `globalThis.fetch`), and `mock.timers` controls `setTimeout` so a test never really waits. `--experimental-test-coverage` shows which lines your tests never ran.",
  ],
  code: [
    {
      filename: "package.json",
      lang: "json",
      source: `
{
  "name": "grades",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "node --test",
    "test:watch": "node --test --watch",
    "coverage": "node --test --experimental-test-coverage"
  }
}
`,
    },
    {
      filename: "grades.js",
      lang: "js",
      source: `
export function grade(score) {
  if (!Number.isFinite(score) || score < 0 || score > 100) throw new RangeError(\`invalid score: \${score}\`);
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "F";
}

export function average(scores) {
  if (scores.length === 0) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

// Takes its dependency (fetchJson) as a parameter, so tests can pass a fake.
export async function loadClassAverage(fetchJson, formId) {
  const students = await fetchJson(\`/api/forms/\${formId}/results\`);
  return average(students.map((s) => s.score));
}
`,
    },
    {
      filename: "grades.test.js",
      lang: "js",
      source: `
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { average, grade, loadClassAverage } from "./grades.js";

describe("grade", () => {
  it("uses the boundaries from the school scale", () => {
    const cases = [[100, "A"], [75, "A"], [74, "B"], [65, "B"], [45, "C"], [30, "D"], [29, "F"], [0, "F"]];
    for (const [score, expected] of cases) assert.equal(grade(score), expected, \`score \${score}\`);
  });

  it("rejects impossible scores", () => {
    assert.throws(() => grade(101), RangeError);
    assert.throws(() => grade(Number.NaN), /invalid score/);
  });
});

describe("average", () => {
  it("rounds to one decimal place", () => assert.equal(average([88, 79, 71]), 79.3));
  it("returns null for an empty list", () => assert.equal(average([]), null));
});

describe("loadClassAverage", () => {
  it("fetches the form's results and averages them", async () => {
    const fakeFetch = mock.fn(async () => [{ score: 80 }, { score: 60 }]);
    assert.equal(await loadClassAverage(fakeFetch, 4), 70);
    assert.equal(fakeFetch.mock.callCount(), 1);
    assert.deepEqual(fakeFetch.mock.calls[0].arguments, ["/api/forms/4/results"]);
  });

  it("passes errors through", async () => {
    const failing = async () => { throw new Error("offline"); };
    await assert.rejects(loadClassAverage(failing, 4), /offline/);
  });
});
`,
    },
  ],
  keyPoints: [
    "`node --test` finds and runs `*.test.js` files with no extra packages.",
    "Test boundaries and failures as well as the happy path, using `assert.throws`/`rejects`.",
    "Pass dependencies in, and use `mock.fn`, `mock.method` and `mock.timers` to keep tests fast and isolated.",
  ],
  exercise:
    "Write `debounce(fn, waitMs)` and `searchStudents(query)` (which fetches `/api/students?q=...` but skips queries shorter than 2 characters). Test the debounce with `mock.timers` without really waiting, and test the search by replacing `globalThis.fetch` with `mock.method`, including an error status.",
};

export const introToReact: Lesson = {
  slug: "intro-to-react",
  title: "Introduction to React",
  summary: "Components, props, JSX, state with useState, lists with keys, controlled forms and loading data with useEffect.",
  body: [
    "React builds interfaces from components: functions that take props and return JSX, an HTML-like syntax that compiles to JavaScript. Instead of changing the DOM yourself, you describe what the page should look like for the current data, and React updates the DOM when the data changes. Vite creates a ready-to-run project with a fast dev server.",
    "`useState` stores data that changes, such as the list of students or the text in an input. Calling the setter re-renders the component. Never mutate state (`students.push`); create a new array or object instead. Inputs whose `value` comes from state and whose `onChange` updates it are called controlled inputs. Values you can compute from state, such as a filtered list, should be computed during render rather than stored.",
    "Lists need a stable `key` on each item so React can tell rows apart. `useEffect` runs code after rendering, which suits loading data; return a cleanup function (here, aborting the fetch) for when the component goes away. Development mode with `<StrictMode>` runs effects twice on purpose to reveal missing cleanups. `npm run build` produces static files you can deploy anywhere.",
  ],
  code: [
    {
      filename: "Terminal",
      lang: "bash",
      source: `
npm create vite@latest results-app -- --template react
cd results-app
npm install
npm run dev          # opens http://localhost:5173 and reloads as you save
`,
    },
    {
      filename: "public/students.json",
      lang: "json",
      source: `
[
  { "id": 1, "name": "Amina Hassan", "score": 88 },
  { "id": 2, "name": "Juma Said", "score": 42 },
  { "id": 3, "name": "Neema Kimaro", "score": 71 }
]
`,
    },
    {
      filename: "src/main.jsx",
      lang: "jsx",
      source: `
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
    },
    {
      filename: "src/StudentList.jsx",
      lang: "jsx",
      source: `
// A component is a function that takes props and returns JSX.
function StudentRow({ student }) {
  const passed = student.score >= 30;
  return (
    <li>
      {student.name} — {student.score} {passed ? "✔" : <strong>(needs support)</strong>}
    </li>
  );
}

export default function StudentList({ students }) {
  if (students.length === 0) return <p>No students match.</p>;
  return (
    <ul>
      {students.map((s) => (
        <StudentRow key={s.id} student={s} />   // key lets React track each row
      ))}
    </ul>
  );
}
`,
    },
    {
      filename: "src/App.jsx",
      lang: "jsx",
      source: `
import { useEffect, useState } from "react";
import StudentList from "./StudentList.jsx";

export default function App() {
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState("loading");     // "loading" | "ready" | "error"
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [score, setScore] = useState("");

  // Runs after the first render; the cleanup cancels the request if the component goes away.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/students.json", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then((data) => {
        setStudents(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (name.trim().length < 2 || score === "") return;
    // Never mutate state: build a new array so React sees the change.
    setStudents([...students, { id: Date.now(), name: name.trim(), score: Number(score) }]);
    setName("");
    setScore("");
  }

  // Derived values are computed during render, not stored in state.
  const visible = students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <main>
      <h1>Form 4 results</h1>

      <form onSubmit={handleSubmit}>
        <input aria-label="Name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input aria-label="Score" type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
        <button>Add</button>
      </form>

      <input aria-label="Search" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />

      {status === "loading" && <p>Loading…</p>}
      {status === "error" && <p role="alert">Could not load students.</p>}
      {status === "ready" && <StudentList students={visible} />}
    </main>
  );
}
`,
    },
  ],
  keyPoints: [
    "Components are functions of props that return JSX; React updates the DOM for you.",
    "Keep changing data in `useState`, always replace rather than mutate it, and derive the rest during render.",
    "Give list items a stable `key`, and load data in `useEffect` with a cleanup function.",
  ],
  exercise:
    "Extend the app: show the number of students and the class average, add a Remove button on every row, and save the list to localStorage so it survives a reload (load the JSON file only when nothing is saved yet).",
};
