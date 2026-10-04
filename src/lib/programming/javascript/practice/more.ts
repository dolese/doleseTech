import type { Practice } from "../../types";

export const datesNumbersIntl: Practice = {
  solution: {
    notes: [
      "Every date is built in UTC (`T00:00:00Z` and the `getUTC…`/`setUTC…` methods), so the plan is identical on every computer. `addMonths` clamps the day to the last day of the target month, using day 0 of the following month. The amounts are whole shillings: each instalment is the rounded-down share and the last one takes the remainder, so the total always adds up exactly.",
    ],
    code: [
      {
        filename: "receipt.js",
        lang: "js",
        source: `
const DAY = 24 * 60 * 60 * 1000;
const tzs = new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

// Dates are built in UTC so the result is the same in every time zone.
function utcDate(isoDay) {
  return new Date(isoDay + "T00:00:00Z");
}

function daysUntil(isoDay, today) {
  return Math.round((utcDate(isoDay) - utcDate(today)) / DAY);
}

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));          // 31 Jan + 1 month = 28/29 Feb, not 3 March
  return d;
}

function instalments(total, count, firstDue) {
  const base = Math.floor(total / count);
  return Array.from({ length: count }, (_, i) => ({
    due: addMonths(utcDate(firstDue), i),
    amount: i === count - 1 ? total - base * (count - 1) : base,   // last one takes the remainder
  }));
}

const today = "2026-01-20";
console.log("Days until exams:", daysUntil("2026-11-02", today));

const plan = instalments(250000, 3, "2026-01-31");
for (const { due, amount } of plan) {
  console.log(dateFmt.format(due).padEnd(12), tzs.format(amount).padStart(14));
}
console.log("Total".padEnd(12), tzs.format(plan.reduce((s, p) => s + p.amount, 0)).padStart(14));
`,
      },
    ],
  },
  quiz: [
    {
      question: "What does `new Date(2026, 1, 14)` create?",
      options: ["14 January 2026", "14 February 2026", "1 February 2026", "An invalid date"],
      answer: 1,
      explanation: "Months are 0-based in the Date constructor, so 1 is February.",
    },
    {
      question: "Why should a fees system store 25500 rather than 255.00 for an amount?",
      options: [
        "Integers use less memory",
        "Intl can only format integers",
        "Whole units avoid floating-point rounding errors when adding",
        "JSON can't store decimals",
      ],
      answer: 2,
      explanation: "Decimals like 0.1 cannot be stored exactly; sums of whole numbers are exact.",
    },
    {
      question: "How do you show a date in East Africa Time on a computer set to another time zone?",
      options: [
        "Add 3 hours to the Date with setHours",
        "Pass `timeZone: \"Africa/Dar_es_Salaam\"` to Intl.DateTimeFormat",
        "Use `toISOString()`",
        "It's impossible in the browser",
      ],
      answer: 1,
      explanation: "The Date stays the same moment; the formatter converts it for display.",
    },
    {
      question: "What does `Number(\"42abc\")` return?",
      options: ["NaN", "42", "\"42\"", "0"],
      answer: 0,
      explanation: "`Number` needs the whole string to be numeric; `parseInt(\"42abc\", 10)` would give 42.",
    },
  ],
};

export const regularExpressions: Practice = {
  solution: {
    notes: [
      "One pattern with named groups reads the three parts of a line and tolerates extra spaces; a second, anchored pattern checks the admission number on its own so the error message can say exactly what is wrong. The date conversion reorders the three groups with `$3-$2-$1`, and `\\b` stops it matching inside longer numbers.",
    ],
    code: [
      {
        filename: "parse.js",
        lang: "js",
        source: `
const ADMISSION = /^ADM-(\\d{4})-(\\d{4})$/;

function parseLine(line) {
  const m = line.match(/^\\s*(?<adm>\\S+)\\s*:\\s*(?<name>[A-Za-z' ]+?)\\s*:\\s*(?<score>\\d{1,3})\\s*$/);
  if (!m) return { error: \`cannot read "\${line.trim()}"\` };
  const { adm, name, score } = m.groups;
  const parts = adm.match(ADMISSION);
  if (!parts) return { error: \`bad admission number \${adm}\` };
  if (Number(score) > 100) return { error: \`score \${score} is above 100\` };
  return { adm, year: Number(parts[1]), name: name.replace(/\\s+/g, " "), score: Number(score) };
}

const input = \`
ADM-2026-0001 : Amina  Hassan : 88
ADM-2026-0002: Juma Said:42
ADM-26-0003 : Neema Kimaro : 71
ADM-2025-0104 : Ali Mohamed : 105
just some text
\`;

const lines = input.split("\\n").filter((l) => l.trim() !== "");
for (const r of lines.map(parseLine)) {
  console.log(r.error ? \`skip: \${r.error}\` : \`\${r.adm} (\${r.year}) \${r.name} \${r.score}\`);
}

// Turn 14/03/2026 dates into ISO 2026-03-14 with a replacer
const notice = "Exams run from 02/11/2026 to 20/11/2026; results on 15/12/2026.";
console.log(notice.replace(/\\b(\\d{2})\\/(\\d{2})\\/(\\d{4})\\b/g, "$3-$2-$1"));
`,
      },
    ],
  },
  quiz: [
    {
      question: "Why anchor a validation pattern with `^` and `$`?",
      options: [
        "It makes the regex faster",
        "So the whole input must match, not just part of it",
        "They are required in JavaScript",
        "To ignore case",
      ],
      answer: 1,
      explanation: "Without anchors, `/\\d{10}/` would accept \"abc0712345678xyz\".",
    },
    {
      question: "What does `\"a1b22c333\".match(/\\d+/g)` return?",
      options: ["\"1\"", "[\"1\", \"22\", \"333\"]", "true", "[\"a\", \"b\", \"c\"]"],
      answer: 1,
      explanation: "With the `g` flag, `match` returns every matched string.",
    },
    {
      question: "How do you read a named group `(?<score>\\d+)` from a match `m`?",
      options: ["`m.score`", "`m[score]`", "`m.groups.score`", "`m.named(\"score\")`"],
      answer: 2,
      explanation: "Named groups live on the match's `groups` object.",
    },
    {
      question: "Is a regex check in the browser enough to keep bad data out of the database?",
      options: [
        "Yes, if the pattern is anchored",
        "Yes, with the `u` flag",
        "Only for numbers",
        "No: the server must validate again, because client code can be bypassed",
      ],
      answer: 3,
      explanation: "Client-side checks improve the experience; security and data quality need server checks.",
    },
  ],
};

export const workingWithApis: Practice = {
  solution: {
    notes: [
      "The loop calls `request()` and only retries when the error could be temporary: status 0 (network error or timeout) or 5xx. A 422 is the client's own mistake, so retrying would just fail again. The delay doubles each time (exponential backoff) so a struggling server gets room to recover. Put `retry.js` next to `api.js` and `package.json` from the lesson.",
    ],
    code: [
      {
        filename: "retry.js",
        lang: "js",
        source: `
import { ApiError, request } from "./api.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry only failures that might succeed later: network errors, timeouts (status 0) and 5xx.
async function requestWithRetry(path, options = {}, { retries = 3, baseDelayMs = 200 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await request(path, options);
    } catch (err) {
      const retryable = err instanceof ApiError && (err.status === 0 || err.status >= 500);
      if (!retryable || attempt > retries) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1);          // 200, 400, 800 ms ...
      console.log(\`attempt \${attempt} failed (\${err.status}), retrying in \${delay} ms\`);
      await sleep(delay);
    }
  }
}

// With the server running: node retry.js
const token = "demo-token";
console.log(await requestWithRetry("/flaky", { token }));
try {
  await requestWithRetry("/students", { method: "POST", body: { name: "" }, token });
} catch (err) {
  console.log(\`not retried: \${err.status} \${err.message}\`);
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "A POST returns status 422. What does `await fetch(...)` do?",
      options: [
        "Throws a TypeError",
        "Returns null",
        "Resolves normally with `res.ok === false`",
        "Retries automatically",
      ],
      answer: 2,
      explanation: "fetch only rejects for network failures and cancellations; check `res.ok` yourself.",
    },
    {
      question: "Which header tells the server the body is JSON?",
      options: ["`Accept: application/json`", "`Content-Type: application/json`", "`Authorization: JSON`", "`Body-Type: json`"],
      answer: 1,
      explanation: "`Content-Type` describes what you send; `Accept` says what you want back.",
    },
    {
      question: "How do you stop a fetch that is taking longer than 2 seconds?",
      options: [
        "`fetch(url, { timeout: 2000 })`",
        "Wrap it in setTimeout",
        "Call `res.cancel()`",
        "`fetch(url, { signal: AbortSignal.timeout(2000) })`",
      ],
      answer: 3,
      explanation: "An abort signal cancels the request; fetch has no `timeout` option.",
    },
    {
      question: "Which failure should a retry helper NOT retry?",
      options: ["503 Service Unavailable", "A network error", "422 Unprocessable Content", "A timeout"],
      answer: 2,
      explanation: "4xx means the request itself is wrong; sending it again gives the same answer.",
    },
  ],
};

export const accessibility: Practice = {
  solution: {
    notes: [
      "Each tab is a real `<button>`, with `role=\"tab\"` saying what kind of control it is. Only the selected tab has `tabindex=\"0\"`, so Tab moves from the tab list straight into the panel; the arrow keys move between tabs. `aria-selected`, `aria-controls` and `aria-labelledby` let a screen reader say \"Biology, tab, 2 of 3, selected\" and name each panel.",
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
    <title>Results by subject</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 1rem auto; padding: 0 1rem; }
      [role="tablist"] { display: flex; gap: 0.25rem; border-bottom: 2px solid #ccc; }
      [role="tab"] { padding: 0.5rem 1rem; border: 0; background: #eee; font-size: 1rem; }
      [role="tab"][aria-selected="true"] { background: #1a73e8; color: #fff; }
      [role="tabpanel"] { padding: 1rem 0; }
      :focus-visible { outline: 3px solid #f9a825; outline-offset: 2px; }
    </style>
    <script src="tabs.js" defer></script>
  </head>
  <body>
    <main>
      <h1>Form 4 results</h1>
      <div role="tablist" aria-label="Subjects">
        <button role="tab" id="tab-maths" aria-controls="panel-maths" aria-selected="true">Maths</button>
        <button role="tab" id="tab-biology" aria-controls="panel-biology" aria-selected="false" tabindex="-1">Biology</button>
        <button role="tab" id="tab-chemistry" aria-controls="panel-chemistry" aria-selected="false" tabindex="-1">Chemistry</button>
      </div>
      <section role="tabpanel" id="panel-maths" aria-labelledby="tab-maths" tabindex="0">
        <p>Average 70.8 · Highest: Ali Mohamed (95)</p>
      </section>
      <section role="tabpanel" id="panel-biology" aria-labelledby="tab-biology" tabindex="0" hidden>
        <p>Average 67.8 · Highest: Neema Kimaro (84)</p>
      </section>
      <section role="tabpanel" id="panel-chemistry" aria-labelledby="tab-chemistry" tabindex="0" hidden>
        <p>Average 61.0 · Highest: Amina Hassan (77)</p>
      </section>
    </main>
  </body>
</html>
`,
      },
      {
        filename: "tabs.js",
        lang: "js",
        source: `
const tabs = [...document.querySelectorAll('[role="tab"]')];

function select(tab) {
  for (const t of tabs) {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;               // roving tabindex: only the current tab is in the Tab order
    document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
  }
  tab.focus();
}

for (const tab of tabs) {
  tab.addEventListener("click", () => select(tab));
  tab.addEventListener("keydown", (event) => {
    const i = tabs.indexOf(tab);
    const next = {
      ArrowRight: tabs[(i + 1) % tabs.length],
      ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[event.key];
    if (next) {
      event.preventDefault();
      select(next);
    }
  });
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "Why use `<button>` instead of `<div onclick>`?",
      options: [
        "Buttons look nicer",
        "Buttons are focusable and work with Enter/Space and screen readers by default",
        "Divs can't have click listeners",
        "Buttons load faster",
      ],
      answer: 1,
      explanation: "A div needs tabindex, a role and key handling just to approach what a button does already.",
    },
    {
      question: "How do you connect an error message to its input for screen readers?",
      options: [
        "Make the text red",
        "Put the message in the placeholder",
        "Give the input `aria-describedby` pointing to the message's id",
        "Use `alert()`",
      ],
      answer: 2,
      explanation: "The message is read out when the input gets focus, and colour alone isn't enough.",
    },
    {
      question: "What does an element with `role=\"status\"` do?",
      options: [
        "Announces its new text to screen readers without moving focus",
        "Shows a loading spinner",
        "Prevents the form from submitting",
        "Hides content from screen readers",
      ],
      answer: 0,
      explanation: "It is a polite live region: changes are read out when the reader is idle.",
    },
    {
      question: "After a modal dialog closes, where should focus go?",
      options: [
        "To the top of the page",
        "Nowhere",
        "To the first link on the page",
        "Back to the control that opened it (or the next logical place)",
      ],
      answer: 3,
      explanation: "Returning focus keeps keyboard and screen-reader users where they were.",
    },
  ],
};

export const testingJavascript: Practice = {
  solution: {
    notes: [
      "`mock.timers.enable` replaces `setTimeout` with a fake clock, and `tick(299)` moves it forward instantly, so the test proves that nothing fires before 300 ms and that only the last call runs. `mock.method(globalThis, \"fetch\", ...)` swaps in a fake fetch that returns a real `Response`, and `mock.restoreAll()` in `afterEach` puts the real one back.",
    ],
    code: [
      {
        filename: "search.js",
        lang: "js",
        source: `
export function debounce(fn, waitMs) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}

export async function searchStudents(query) {
  const q = query.trim();
  if (q.length < 2) return [];
  const res = await fetch(\`/api/students?q=\${encodeURIComponent(q)}\`);
  if (!res.ok) throw new Error(\`search failed: \${res.status}\`);
  return res.json();
}
`,
      },
      {
        filename: "search.test.js",
        lang: "js",
        source: `
import { afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { debounce, searchStudents } from "./search.js";

afterEach(() => mock.restoreAll());

describe("debounce", () => {
  it("calls once, with the last arguments, after the wait", () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    const spy = mock.fn();
    const debounced = debounce(spy, 300);

    debounced("a");
    debounced("am");
    mock.timers.tick(299);
    assert.equal(spy.mock.callCount(), 0);          // still waiting

    debounced("ami");                               // restarts the wait
    mock.timers.tick(300);
    assert.equal(spy.mock.callCount(), 1);
    assert.deepEqual(spy.mock.calls[0].arguments, ["ami"]);
    mock.timers.reset();
  });
});

describe("searchStudents", () => {
  it("skips the request for short queries", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () => assert.fail("should not fetch"));
    assert.deepEqual(await searchStudents(" a "), []);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("encodes the query and returns the JSON body", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json([{ name: "Amina Hassan" }]));
    assert.deepEqual(await searchStudents("Amina H"), [{ name: "Amina Hassan" }]);
    assert.equal(fetchMock.mock.calls[0].arguments[0], "/api/students?q=Amina%20H");
  });

  it("throws on an error status", async () => {
    mock.method(globalThis, "fetch", async () => new Response("oops", { status: 500 }));
    await assert.rejects(searchStudents("Juma"), /search failed: 500/);
  });
});
`,
      },
    ],
  },
  quiz: [
    {
      question: "Which command runs every `*.test.js` file with Node's built-in runner?",
      options: ["`node test`", "`npm install test`", "`node --test`", "`node --run-tests *.js`"],
      answer: 2,
      explanation: "`node --test` discovers test files by name and runs them.",
    },
    {
      question: "How do you check that an async function rejects?",
      options: [
        "`await assert.rejects(promise, /message/)`",
        "`assert.throws(promise)`",
        "`assert.equal(promise, Error)`",
        "Wrap it in try/catch without assertions",
      ],
      answer: 0,
      explanation: "`assert.throws` is for synchronous code; `rejects` awaits the promise.",
    },
    {
      question: "Why pass `fetchJson` into `loadClassAverage` instead of calling fetch directly?",
      options: [
        "It runs faster",
        "Tests can pass a fake, so they don't need a network or server",
        "fetch is not available in functions",
        "It avoids using async",
      ],
      answer: 1,
      explanation: "Injecting dependencies makes code easy to test in isolation.",
    },
    {
      question: "What does `mock.timers.tick(300)` do?",
      options: [
        "Waits 300 ms of real time",
        "Fails the test after 300 ms",
        "Sets the test timeout",
        "Moves the fake clock forward 300 ms instantly, firing due timers",
      ],
      answer: 3,
      explanation: "Fake timers make time-based tests instant and deterministic.",
    },
  ],
};

export const introToReact: Practice = {
  solution: {
    notes: [
      "`useState(() => loadSaved() ?? [])` reads localStorage only on the first render. The fetch effect runs only while the status is \"loading\", that is when nothing was saved. A second effect saves the list whenever it changes. The average is derived from `students` during render, and the updater form `setStudents(prev => ...)` always works on the latest list.",
    ],
    code: [
      {
        filename: "src/App.jsx",
        lang: "jsx",
        source: `
import { useEffect, useState } from "react";

const STORAGE_KEY = "results-app.students";

// Read saved students once, when the component first renders.
function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export default function App() {
  const [students, setStudents] = useState(() => loadSaved() ?? []);
  const [status, setStatus] = useState(() => (loadSaved() ? "ready" : "loading"));
  const [name, setName] = useState("");
  const [score, setScore] = useState("");

  useEffect(() => {
    if (status !== "loading") return;            // already loaded from localStorage
    const controller = new AbortController();
    fetch("/students.json", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(\`HTTP \${res.status}\`))))
      .then((data) => {
        setStudents(data);
        setStatus("ready");
      })
      .catch((err) => err.name !== "AbortError" && setStatus("error"));
    return () => controller.abort();
  }, [status]);

  // Save whenever the list changes (after the initial load).
  useEffect(() => {
    if (status === "ready") localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students, status]);

  function add(event) {
    event.preventDefault();
    if (name.trim().length < 2 || score === "") return;
    setStudents((prev) => [...prev, { id: Date.now(), name: name.trim(), score: Number(score) }]);
    setName("");
    setScore("");
  }

  function remove(id) {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }

  const average = students.length
    ? (students.reduce((sum, s) => sum + s.score, 0) / students.length).toFixed(1)
    : "–";

  if (status === "loading") return <p>Loading…</p>;
  if (status === "error") return <p role="alert">Could not load students.</p>;

  return (
    <main>
      <h1>Form 4 results</h1>
      <p>
        {students.length} students · class average <strong>{average}</strong>
      </p>
      <form onSubmit={add}>
        <input aria-label="Name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input aria-label="Score" type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
        <button>Add</button>
      </form>
      <ul>
        {students.map((s) => (
          <li key={s.id}>
            {s.name} — {s.score}{" "}
            <button type="button" onClick={() => remove(s.id)} aria-label={\`Remove \${s.name}\`}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "Why does `students.push(newStudent); setStudents(students)` fail to update the page?",
      options: [
        "push is not allowed in React",
        "It's the same array object, so React sees no change",
        "setStudents only accepts strings",
        "It updates twice",
      ],
      answer: 1,
      explanation: "Create a new array (`[...students, newStudent]`) so React notices the change.",
    },
    {
      question: "What is the `key` prop on list items for?",
      options: [
        "Styling each row",
        "Sorting the list",
        "Letting React track which item is which between renders",
        "Encrypting the data",
      ],
      answer: 2,
      explanation: "Stable keys (like ids) keep each row's state and DOM attached to the right item.",
    },
    {
      question: "When does `useEffect(fn, [])` run `fn`?",
      options: [
        "Once after the component first renders (twice in StrictMode development)",
        "Before every render",
        "Only when the user clicks",
        "Never; an empty array disables it",
      ],
      answer: 0,
      explanation: "An empty dependency list means \"after mount\"; StrictMode double-runs it in dev to test cleanup.",
    },
    {
      question: "Where should a filtered list (search results) live?",
      options: [
        "In its own useState, updated in an effect",
        "In localStorage",
        "In a global variable",
        "Computed during render from the list and the query",
      ],
      answer: 3,
      explanation: "Derived data computed during render can never go out of sync with its source.",
    },
  ],
};
