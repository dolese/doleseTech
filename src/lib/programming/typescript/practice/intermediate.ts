import type { Practice } from "../../types";
import { restApiExpress as restApiExpressPractice, postgresWithPg as postgresWithPgPractice } from "./more";

export const intermediate: Record<string, Practice> = {
  "unions-and-narrowing": {
    solution: {
      notes: [
        "Model the shapes as a discriminated union on `kind`. The `switch` narrows each case, and the `never` check in `default` means that adding a fourth shape (for example a `square`) makes the compiler point at this function until you handle it.",
      ],
      code: [
        {
          filename: "shapes.ts",
          lang: "ts",
          source: `
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default: {
      const unhandled: never = shape;
      throw new Error("Unknown shape: " + JSON.stringify(unhandled));
    }
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 1 },
  { kind: "rectangle", width: 3, height: 4 },
  { kind: "triangle", base: 6, height: 2 },
];

for (const s of shapes) console.log(s.kind, area(s).toFixed(2));
// circle 3.14 / rectangle 12.00 / triangle 6.00
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does the type `\"pending\" | \"paid\" | \"failed\"` allow?",
        options: ["Any string", "Exactly one of those three strings", "All three at once", "Only `\"pending\"`"],
        answer: 1,
        explanation: "A union of literal types restricts the value to the listed options.",
      },
      {
        question: "In a discriminated union, what is the discriminant?",
        options: [
          "A shared literal field (such as `kind`) whose value identifies each member",
          "The first property alphabetically",
          "A special TypeScript keyword",
          "The member with the most fields",
        ],
        answer: 0,
        explanation: "Switching on the shared literal field lets TypeScript narrow to the exact member.",
      },
      {
        question: "Why assign the leftover case to a variable of type `never`?",
        options: [
          "To make the code faster",
          "To log unknown cases",
          "So the compiler reports an error if a new union member is not handled",
          "It is required in every switch",
        ],
        answer: 2,
        explanation: "If any member is unhandled, it can't be assigned to `never`, so you get a compile error.",
      },
      {
        question: "Inside `if (typeof id === \"number\")`, what is the type of `id` declared as `string | number`?",
        options: ["`string | number`", "`string`", "`unknown`", "`number`"],
        answer: 3,
        explanation: "The `typeof` check narrows the union to `number` inside that branch.",
      },
    ],
  },

  generics: {
    solution: {
      notes: [
        "A generic class `Stack<T>` stores items of one type and returns that same type from `pop` and `peek`. `uniqueBy` remembers the keys it has already seen in a `Set`, keeping only the first item for each key.",
      ],
      code: [
        {
          filename: "stack.ts",
          lang: "ts",
          source: `
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

function uniqueBy<T, K>(items: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const history = new Stack<string>();
history.push("Home");
history.push("Lessons");
console.log(history.pop(), history.peek(), history.size);   // Lessons Home 1

const entries = [
  { id: 1, name: "Amina" },
  { id: 2, name: "Juma" },
  { id: 1, name: "Amina (duplicate)" },
];
console.log(uniqueBy(entries, (e) => e.id).map((e) => e.name));   // [ 'Amina', 'Juma' ]
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is the main benefit of `function first<T>(items: T[]): T | undefined` over using `any`?",
        options: [
          "It runs faster",
          "The return type follows the input type, so type checking is kept",
          "It accepts more kinds of input",
          "It removes `undefined` from the result",
        ],
        answer: 1,
        explanation: "With generics, `first([1, 2])` returns `number | undefined` instead of losing all type information.",
      },
      {
        question: "What does `<T extends { id: number }>` mean?",
        options: [
          "T must be a number",
          "T inherits from a class called id",
          "T can be any type that has a numeric `id` property",
          "T is optional",
        ],
        answer: 2,
        explanation: "`extends` adds a constraint: only types with that shape are accepted.",
      },
      {
        question: "Which is a correctly typed generic API result?",
        options: [
          "`type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }`",
          "`type ApiResult = <T>`",
          "`type ApiResult<T> = T | T`",
          "`interface ApiResult extends T {}`",
        ],
        answer: 0,
        explanation: "A generic discriminated union describes both the success shape (with `data: T`) and the failure shape.",
      },
      {
        question: "When should you avoid adding a generic type parameter?",
        options: [
          "When the function has more than one parameter",
          "When working with arrays",
          "When the function is exported",
          "When the type parameter is used only once and adds no type safety",
        ],
        answer: 3,
        explanation: "A generic should connect types (input to output); otherwise it's just noise.",
      },
    ],
  },

  classes: {
    solution: {
      notes: [
        "`Library` keeps its books in a private `Map` keyed by ISBN. Borrowing checks two failure cases — unknown ISBN and already borrowed — and throws a specific error for the second, so callers can tell them apart with `instanceof`.",
      ],
      code: [
        {
          filename: "library.ts",
          lang: "ts",
          source: `
interface Book {
  readonly isbn: string;
  title: string;
  available: boolean;
}

class BookNotAvailableError extends Error {
  constructor(public readonly isbn: string) {
    super("Book " + isbn + " is already borrowed");
    this.name = "BookNotAvailableError";
  }
}

class Library {
  private books = new Map<string, Book>();

  add(isbn: string, title: string): void {
    this.books.set(isbn, { isbn, title, available: true });
  }

  borrow(isbn: string): Book {
    const book = this.books.get(isbn);
    if (!book) throw new Error("No book with ISBN " + isbn);
    if (!book.available) throw new BookNotAvailableError(isbn);
    book.available = false;
    return book;
  }

  giveBack(isbn: string): void {
    const book = this.books.get(isbn);
    if (book) book.available = true;
  }

  availableBooks(): string[] {
    return [...this.books.values()].filter((b) => b.available).map((b) => b.title);
  }
}

const library = new Library();
library.add("978-1", "Things Fall Apart");
library.add("978-2", "Kinjeketile");

library.borrow("978-1");
console.log(library.availableBooks());      // [ 'Kinjeketile' ]

try {
  library.borrow("978-1");
} catch (err) {
  if (err instanceof BookNotAvailableError) console.log("Sorry:", err.message);
}

library.giveBack("978-1");
console.log(library.availableBooks());      // [ 'Things Fall Apart', 'Kinjeketile' ]
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `constructor(private readonly notifier: Notifier) {}` do?",
        options: [
          "Declares and assigns a private, read-only field in one step",
          "Creates a public field",
          "Calls the parent constructor",
          "Nothing — the body is empty",
        ],
        answer: 0,
        explanation: "Parameter properties declare the field and assign the argument automatically.",
      },
      {
        question: "Why depend on an interface such as `Notifier` instead of a concrete `SmsNotifier` class?",
        options: [
          "Interfaces are faster",
          "Classes can't be passed as arguments",
          "Implementations become swappable — e.g. a fake notifier in tests",
          "TypeScript requires it",
        ],
        answer: 2,
        explanation: "Code that depends on an interface works with any object of that shape.",
      },
      {
        question: "What is the benefit of a custom error class like `InsufficientFundsError`?",
        options: [
          "It prevents all errors",
          "It makes stack traces shorter",
          "It is the only way to throw in TypeScript",
          "Callers can detect that specific failure with `instanceof` and react appropriately",
        ],
        answer: 3,
        explanation: "Specific error types let callers handle each failure differently.",
      },
      {
        question: "Which member can be accessed from outside the class?",
        options: ["`private balance`", "A `public` method or a getter", "`#balance`", "None of them"],
        answer: 1,
        explanation: "Public members (the default) form the class's interface; private ones are hidden.",
      },
    ],
  },

  "async-await": {
    solution: {
      notes: [
        "Start all five requests at once with `map` and wait for them together with `Promise.all`. `AbortSignal.timeout(2000)` cancels any request that takes longer than two seconds; the `catch` reports it instead of crashing.",
      ],
      code: [
        {
          filename: "users.ts",
          lang: "ts",
          source: `
const BASE_URL = "https://jsonplaceholder.typicode.com";

interface User {
  id: number;
  name: string;
  address: { city: string };
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(BASE_URL + "/users/" + id, { signal: AbortSignal.timeout(2000) });
  if (!res.ok) throw new Error("HTTP " + res.status + " for user " + id);
  return (await res.json()) as User;
}

async function main(): Promise<void> {
  try {
    const users = await Promise.all([1, 2, 3, 4, 5].map(fetchUser));
    for (const u of users) console.log(u.name + " - " + u.address.city);
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") console.log("A request took longer than 2 seconds");
    else console.log("Failed:", err instanceof Error ? err.message : err);
  }
}

main();
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `await` pause?",
        options: [
          "The whole Node.js process",
          "Only the current `async` function",
          "All other requests",
          "The event loop",
        ],
        answer: 1,
        explanation: "Other work keeps running while one async function waits for its Promise.",
      },
      {
        question: "Three independent requests each take 300 ms. Roughly how long does `await Promise.all([...])` take?",
        options: ["About 300 ms", "About 900 ms", "About 100 ms", "It depends on the order"],
        answer: 0,
        explanation: "They run concurrently, so the total is about as long as the slowest one.",
      },
      {
        question: "When should you use `Promise.allSettled` instead of `Promise.all`?",
        options: [
          "When you want the fastest result only",
          "When there is only one promise",
          "When some promises may fail and you still want the results of the others",
          "Never — they are identical",
        ],
        answer: 2,
        explanation: "`Promise.all` rejects as soon as one promise fails; `allSettled` reports every outcome.",
      },
      {
        question: "What is wrong with `for (const id of ids) { results.push(await fetchUser(id)); }` for independent requests?",
        options: [
          "It doesn't compile",
          "It loses the results",
          "It runs requests in parallel",
          "It runs them one after another, which is slower than starting them together",
        ],
        answer: 3,
        explanation: "Each `await` waits before starting the next request. Use `Promise.all` when they don't depend on each other.",
      },
    ],
  },

  "error-handling": {
    solution: {
      notes: [
        "`parseScoreLine` returns a `Result` instead of throwing, so each failure is an ordinary value with a clear message. The caller separates valid rows from errors without any `try/catch`.",
      ],
      code: [
        {
          filename: "parse-scores.ts",
          lang: "ts",
          source: `
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

interface ScoreRow {
  name: string;
  score: number;
}

function parseScoreLine(line: string): Result<ScoreRow> {
  const parts = line.split(",");
  if (parts.length !== 2) return { ok: false, error: "Expected 'name,score' but got '" + line + "'" };

  const name = parts[0].trim();
  if (name === "") return { ok: false, error: "Name is empty in '" + line + "'" };

  const score = Number(parts[1]);
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    return { ok: false, error: "Invalid score in '" + line + "'" };
  }
  return { ok: true, value: { name, score } };
}

const lines = ["Amina,88", "Juma 42", ",70", "Neema,abc", "Ali,95"];
const valid: ScoreRow[] = [];
let errors = 0;

for (const line of lines) {
  const r = parseScoreLine(line);
  if (r.ok) valid.push(r.value);
  else {
    errors++;
    console.log("Skipped:", r.error);
  }
}

console.log(valid);                      // [ { name: 'Amina', score: 88 }, { name: 'Ali', score: 95 } ]
console.log("Errors:", errors);          // Errors: 3
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is the type of `err` in `catch (err)` with strict TypeScript settings?",
        options: ["`Error`", "`any`", "`unknown`", "`string`"],
        answer: 2,
        explanation: "Anything can be thrown, so the caught value is `unknown` until you check it, e.g. with `instanceof Error`.",
      },
      {
        question: "When is returning a `Result` object better than throwing?",
        options: [
          "For expected failures such as invalid user input",
          "For every possible error",
          "Only in async functions",
          "When the program must stop immediately",
        ],
        answer: 0,
        explanation: "Expected failures become part of the return type, so callers can't forget to handle them.",
      },
      {
        question: "What does `new Error(\"Config is not valid JSON\", { cause: err })` preserve?",
        options: ["The line number only", "Nothing extra", "The program state", "The original underlying error"],
        answer: 3,
        explanation: "`cause` keeps the root error attached, which makes debugging much easier.",
      },
      {
        question: "Which is a bad practice?",
        options: [
          "Using custom error classes",
          "An empty `catch {}` that silently ignores errors",
          "Re-throwing errors you can't handle",
          "Checking `err instanceof Error`",
        ],
        answer: 1,
        explanation: "Swallowing errors hides bugs. Handle them, or let them propagate.",
      },
    ],
  },

  "http-server": {
    solution: {
      notes: [
        "Match `/tasks/:id` with a regular expression to get the id, then look the task up. `PATCH` marks it done, `DELETE` removes it, and both return 404 for unknown ids. `GET /tasks?done=true` filters with `url.searchParams`.",
      ],
      code: [
        {
          filename: "server.ts",
          lang: "ts",
          source: `
import { createServer, type ServerResponse } from "node:http";

interface Task {
  id: number;
  title: string;
  done: boolean;
}

let tasks: Task[] = [
  { id: 1, title: "Learn TypeScript", done: true },
  { id: 2, title: "Build an API", done: false },
];

function send(res: ServerResponse, status: number, body?: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");

  if (req.method === "GET" && url.pathname === "/tasks") {
    const done = url.searchParams.get("done");
    const list = done === null ? tasks : tasks.filter((t) => t.done === (done === "true"));
    return send(res, 200, list);
  }

  const match = url.pathname.match(/^\\/tasks\\/(\\d+)$/);
  if (match) {
    const id = Number(match[1]);
    const task = tasks.find((t) => t.id === id);
    if (!task) return send(res, 404, { error: "Task not found" });

    if (req.method === "PATCH") {
      task.done = true;
      return send(res, 200, task);
    }
    if (req.method === "DELETE") {
      tasks = tasks.filter((t) => t.id !== id);
      return send(res, 204);
    }
  }

  send(res, 404, { error: "Not found" });
});

server.listen(3000, () => console.log("Listening on http://localhost:3000"));
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
curl "http://localhost:3000/tasks?done=false"   # [{"id":2,"title":"Build an API","done":false}]
curl -X PATCH http://localhost:3000/tasks/2      # {"id":2,"title":"Build an API","done":true}
curl -X DELETE http://localhost:3000/tasks/1     # (204 No Content)
curl -X PATCH http://localhost:3000/tasks/99     # {"error":"Task not found"}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which status code should a successful `POST` that creates a resource return?",
        options: ["200 OK", "201 Created", "204 No Content", "302 Found"],
        answer: 1,
        explanation: "201 tells the client a new resource was created.",
      },
      {
        question: "A client sends a body that isn't valid JSON. Which status fits best?",
        options: ["400 Bad Request", "404 Not Found", "500 Internal Server Error", "201 Created"],
        answer: 0,
        explanation: "The client's input is wrong, so it's a 4xx — specifically 400.",
      },
      {
        question: "Why wrap `JSON.parse` of a request body in `try/catch`?",
        options: [
          "It makes parsing faster",
          "JSON.parse only works inside try",
          "To log every request",
          "Clients can send anything, and invalid JSON throws a `SyntaxError`",
        ],
        answer: 3,
        explanation: "Never trust client input; handle bad JSON with a clear 400 response.",
      },
      {
        question: "How do you read `?done=true` from a request URL in Node.js?",
        options: [
          "`req.query.done`",
          "`req.body.done`",
          "`new URL(req.url, base).searchParams.get(\"done\")`",
          "`process.argv.done`",
        ],
        answer: 2,
        explanation: "The `URL` class parses the query string into `searchParams`.",
      },
    ],
  },

  testing: {
    solution: {
      notes: [
        "Test the normal case, each failure reason, and both boundaries (0 and 120). Each test checks the whole `Result` with `assert.deepEqual`, so a wrong error message is caught too.",
      ],
      code: [
        {
          filename: "parse-age.ts",
          lang: "ts",
          source: `
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseAge(input: string): Result<number> {
  const n = Number(input);
  if (!Number.isInteger(n)) return { ok: false, error: "Age must be a whole number" };
  if (n < 0 || n > 120) return { ok: false, error: "Age must be between 0 and 120" };
  return { ok: true, value: n };
}
`,
        },
        {
          filename: "parse-age.test.ts",
          lang: "ts",
          source: `
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseAge } from "./parse-age";

describe("parseAge", () => {
  it("accepts a valid age", () => {
    assert.deepEqual(parseAge("17"), { ok: true, value: 17 });
  });

  it("accepts the boundaries 0 and 120", () => {
    assert.deepEqual(parseAge("0"), { ok: true, value: 0 });
    assert.deepEqual(parseAge("120"), { ok: true, value: 120 });
  });

  it("rejects decimals and text", () => {
    assert.deepEqual(parseAge("17.5"), { ok: false, error: "Age must be a whole number" });
    assert.deepEqual(parseAge("abc"), { ok: false, error: "Age must be a whole number" });
  });

  it("rejects ages out of range", () => {
    assert.deepEqual(parseAge("-1"), { ok: false, error: "Age must be between 0 and 120" });
    assert.deepEqual(parseAge("121"), { ok: false, error: "Age must be between 0 and 120" });
  });
});
`,
        },
        {
          filename: "package.json",
          lang: "json",
          source: `
{
  "scripts": {
    "test": "node --import tsx --test *.test.ts"
  }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which modules provide a test runner and assertions built into Node.js?",
        options: ["`jest` and `chai`", "`node:test` and `node:assert/strict`", "`mocha` and `sinon`", "`node:fs` and `node:path`"],
        answer: 1,
        explanation: "Node.js ships its own test runner and assertions — no extra dependencies needed.",
      },
      {
        question: "For `gradeFor` with an A at 75 and above, which pair of values best tests the boundary?",
        options: ["50 and 100", "0 and 100", "75 and 74", "1 and 2"],
        answer: 2,
        explanation: "Boundary bugs hide right at the edge: test the value on each side of it.",
      },
      {
        question: "How do you check that a function throws a `RangeError`?",
        options: [
          "`assert.throws(() => fn(), RangeError)`",
          "`assert.equal(fn(), RangeError)`",
          "`try { fn() } catch {}`",
          "`assert.ok(RangeError)`",
        ],
        answer: 0,
        explanation: "Pass a function to `assert.throws` so the assertion can call it and catch the error.",
      },
      {
        question: "Why are pure functions the easiest to test?",
        options: [
          "They are always short",
          "They run faster",
          "They don't need TypeScript",
          "Same input always gives the same output, with no side effects to set up",
        ],
        answer: 3,
        explanation: "No files, network or global state to arrange — just call and compare.",
      },
    ],
  },
  "rest-api-express": restApiExpressPractice,
  "postgres-with-pg": postgresWithPgPractice,
};
