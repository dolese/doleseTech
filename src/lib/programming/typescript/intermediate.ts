import type { LevelTrack } from "../types";

export const intermediate: LevelTrack = {
  intro:
    "Model real-world data precisely with union types and generics, organise code with classes, handle asynchronous work and errors properly, and build and test your first HTTP server on Node.js.",
  outcomes: [
    "Model data with union, literal and discriminated union types",
    "Write reusable generic functions and types",
    "Use async/await, Promises and robust error handling",
    "Build a JSON HTTP server and test code with node:test",
  ],
  lessons: [
    {
      slug: "unions-and-narrowing",
      title: "Union Types & Narrowing",
      summary: "Values that can be one of several types, and how TypeScript narrows them safely.",
      body: [
        "A union type `A | B` means a value can be either. Literal types restrict a value to exact options: `\"pending\" | \"paid\" | \"failed\"` is far safer than a plain `string`.",
        "Before using a union, you narrow it: checks like `typeof`, `in`, `instanceof` or comparing a shared field tell TypeScript which member you have inside each branch.",
        "A discriminated union gives every member a common literal field (often `kind` or `type`). Switching on that field narrows perfectly, and assigning the leftover case to `never` makes the compiler warn you if a new case is added but not handled.",
      ],
      code: [
        {
          filename: "payments.ts",
          lang: "ts",
          source: `
type Payment =
  | { kind: "mpesa"; phone: string; amount: number }
  | { kind: "card"; last4: string; amount: number }
  | { kind: "cash"; amount: number };

function describe(p: Payment): string {
  switch (p.kind) {
    case "mpesa":
      return "M-Pesa from " + p.phone + ": " + p.amount + " TSh";
    case "card":
      return "Card ****" + p.last4 + ": " + p.amount + " TSh";
    case "cash":
      return "Cash: " + p.amount + " TSh";
    default: {
      const unhandled: never = p;
      return unhandled;
    }
  }
}

function formatId(id: string | number): string {
  return typeof id === "number" ? id.toString().padStart(6, "0") : id.toUpperCase();
}

console.log(describe({ kind: "mpesa", phone: "0712 345 678", amount: 15000 }));
console.log(formatId(42), formatId("inv-7"));
`,
        },
      ],
      keyPoints: [
        "Prefer literal unions over plain strings for fixed sets of values.",
        "Narrow with `typeof`, `in`, `instanceof` or a discriminant field.",
        "The `never` check turns a forgotten case into a compile error.",
      ],
      exercise:
        "Model a `Shape` union of circle, rectangle and triangle (each with its own fields) and write `area(shape)`. Add a fourth shape and confirm the compiler points to the switch that needs updating.",
    },
    {
      slug: "generics",
      title: "Generics",
      summary: "Write functions and types that work with any type while staying type-safe.",
      body: [
        "Generics are type parameters. `function first<T>(items: T[]): T | undefined` works for arrays of numbers, strings or students — and the return type follows whatever goes in, instead of collapsing to `any`.",
        "Constraints limit what a type parameter may be: `<T extends { id: number }>` accepts any object that has a numeric `id`.",
        "Generic types are common for wrappers such as API responses (`ApiResult<T>`), caches and repositories.",
      ],
      code: [
        {
          filename: "generics.ts",
          lang: "ts",
          source: `
function first<T>(items: T[]): T | undefined {
  return items[0];
}

function groupBy<T, K extends string | number>(items: T[], key: (item: T) => K): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    const k = key(item);
    (groups[k] ??= []).push(item);
  }
  return groups;
}

function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

function wrap<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

const people = [
  { id: 1, name: "Amina", form: 4 },
  { id: 2, name: "Juma", form: 3 },
  { id: 3, name: "Neema", form: 4 },
];

const n = first([10, 20, 30]);   // number | undefined
console.log(n, findById(people, 2)?.name);
console.log(groupBy(people, (p) => p.form));

const result = wrap(people.length);
if (result.ok) console.log("Count:", result.data);
`,
        },
      ],
      keyPoints: [
        "Use a generic when the output type depends on the input type.",
        "`extends` constrains a type parameter to shapes you can rely on.",
        "Don't add generics that are used only once — they add noise without safety.",
      ],
      exercise:
        "Write a generic `Stack<T>` (as a class or functions) with `push`, `pop` and `peek`. Then write `uniqueBy<T>(items, key)` that removes duplicates using a key function.",
    },
    {
      slug: "classes",
      title: "Classes & Object-Oriented Design",
      summary: "Constructors, access modifiers, interfaces, inheritance and abstract classes.",
      body: [
        "A class bundles data with the methods that operate on it. TypeScript adds access modifiers: `private` members are hidden from outside code, `protected` ones are visible to subclasses, and `readonly` fields can't change after construction.",
        "Parameter properties (`constructor(private balance: number)`) declare and assign a field in one step.",
        "A class can `implements` an interface to promise it has a certain shape — this lets you swap implementations (for example, a real payment gateway vs a fake one in tests). Prefer composition and interfaces over deep inheritance chains.",
      ],
      code: [
        {
          filename: "account.ts",
          lang: "ts",
          source: `
interface Notifier {
  send(to: string, message: string): void;
}

class ConsoleNotifier implements Notifier {
  send(to: string, message: string): void {
    console.log("[to " + to + "] " + message);
  }
}

class InsufficientFundsError extends Error {
  constructor(public readonly shortBy: number) {
    super("Insufficient funds: short by " + shortBy);
    this.name = "InsufficientFundsError";
  }
}

class Account {
  private balance = 0;

  constructor(
    public readonly owner: string,
    private readonly notifier: Notifier,
  ) {}

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Deposit must be positive");
    this.balance += amount;
    this.notifier.send(this.owner, "Deposited " + amount + ". Balance " + this.balance);
  }

  withdraw(amount: number): void {
    if (amount > this.balance) throw new InsufficientFundsError(amount - this.balance);
    this.balance -= amount;
    this.notifier.send(this.owner, "Withdrew " + amount + ". Balance " + this.balance);
  }

  get currentBalance(): number {
    return this.balance;
  }
}

const acc = new Account("Amina", new ConsoleNotifier());
acc.deposit(50000);
acc.withdraw(20000);
console.log(acc.currentBalance); // 30000
`,
        },
      ],
      keyPoints: [
        "Keep state `private` and expose behaviour through methods.",
        "Depend on interfaces (`Notifier`), not concrete classes, so parts are swappable.",
        "Extend `Error` for domain-specific errors that callers can detect.",
      ],
      exercise:
        "Build a `Library` class that manages `Book` objects: add a book, borrow by ISBN, return a book, and list available books. Throw a custom `BookNotAvailableError` when borrowing a book that is already out.",
    },
    {
      slug: "async-await",
      title: "Asynchronous Code: Promises & async/await",
      summary: "Handle slow operations (network, files, timers) without blocking Node.js.",
      body: [
        "Node.js runs your JavaScript on a single thread. Slow operations — HTTP requests, database queries, file reads — are asynchronous: they return a `Promise` and Node.js keeps doing other work until the result is ready.",
        "`async` functions always return a Promise; inside them, `await` pauses that function (not the whole program) until a Promise settles.",
        "Run independent operations in parallel with `Promise.all`, and use `Promise.allSettled` when some may fail and you still want the others. Awaiting in a loop runs things one after another, which is slower when the tasks don't depend on each other.",
      ],
      code: [
        {
          filename: "async.ts",
          lang: "ts",
          source: `
import { setTimeout as sleep } from "node:timers/promises";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function fetchTodo(id: number): Promise<Todo> {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/" + id);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return (await res.json()) as Todo;
}

async function slowSquare(n: number): Promise<number> {
  await sleep(300);
  return n * n;
}

async function main(): Promise<void> {
  console.time("parallel");
  const squares = await Promise.all([1, 2, 3].map(slowSquare)); // ~300ms, not 900ms
  console.timeEnd("parallel");
  console.log(squares);

  const results = await Promise.allSettled([fetchTodo(1), fetchTodo(2)]);
  for (const r of results) {
    if (r.status === "fulfilled") console.log("OK:", r.value.title);
    else console.log("Failed:", r.reason);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
`,
        },
      ],
      keyPoints: [
        "`await` only pauses the current async function — the process keeps serving other work.",
        "Use `Promise.all` for independent tasks; avoid sequential `await` in loops when order doesn't matter.",
        "Always handle rejections: `try/catch` inside, or `.catch` on the top-level call.",
      ],
      exercise:
        "Fetch users 1–5 from `https://jsonplaceholder.typicode.com/users/{id}` in parallel and print their names and cities. Then add a timeout: if a request takes more than 2 seconds, fail it (hint: `AbortSignal.timeout(2000)`).",
    },
    {
      slug: "error-handling",
      title: "Error Handling",
      summary: "try/catch with unknown errors, custom error classes and the Result pattern.",
      body: [
        "In TypeScript the value caught by `catch` is `unknown`, because anything can be thrown. Narrow it with `instanceof Error` before reading `.message`.",
        "Custom error classes make failures meaningful: callers can check `err instanceof NotFoundError` and respond correctly (for example, return HTTP 404 instead of 500). Attach the original error with `{ cause }` so you don't lose the root cause.",
        "For expected failures — invalid input, not found — returning a `Result` object instead of throwing makes the failure part of the function's type, so callers can't forget to handle it. Reserve exceptions for truly unexpected situations.",
      ],
      code: [
        {
          filename: "errors.ts",
          lang: "ts",
          source: `
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(resource + " " + id + " not found");
    this.name = "NotFoundError";
  }
}

type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

function parseAge(input: string): Result<number> {
  const n = Number(input);
  if (!Number.isInteger(n)) return { ok: false, error: "Age must be a whole number" };
  if (n < 0 || n > 120) return { ok: false, error: "Age must be between 0 and 120" };
  return { ok: true, value: n };
}

const db = new Map([["s1", "Amina"]]);

function getStudent(id: string): string {
  const name = db.get(id);
  if (!name) throw new NotFoundError("Student", id);
  return name;
}

function loadConfig(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Config is not valid JSON", { cause: err });
  }
}

for (const input of ["17", "abc", "200"]) {
  const r = parseAge(input);
  console.log(input, r.ok ? "-> " + r.value : "-> error: " + r.error);
}

try {
  getStudent("s9");
} catch (err) {
  if (err instanceof NotFoundError) console.log("404:", err.message);
  else throw err;
}

try {
  loadConfig("{bad json");
} catch (err) {
  if (err instanceof Error) {
    const cause = err.cause instanceof Error ? err.cause.message : String(err.cause);
    console.log(err.message, "| cause:", cause);
  }
}
`,
        },
      ],
      keyPoints: [
        "Caught values are `unknown` — check `instanceof Error` first.",
        "Custom error classes let callers handle each failure differently.",
        "Return a `Result` for expected failures; throw for unexpected ones. Never swallow errors silently.",
      ],
      exercise:
        "Write `parseScoreLine(line)` that turns \"Amina,88\" into `{ name, score }` and returns a `Result` with clear error messages for missing commas, empty names and invalid scores. Process a list of lines and print the valid rows and the error count.",
    },
    {
      slug: "http-server",
      title: "Building an HTTP Server",
      summary: "Create a JSON API with Node's built-in http module — routes, body parsing, status codes.",
      body: [
        "Every web framework (Express, Fastify, Next.js) is built on Node's `node:http` module. Building a small server with it directly teaches you what the frameworks do for you: matching the method and URL, reading the request body, setting headers and status codes.",
        "Use proper status codes: `200` OK, `201` Created, `400` bad input, `404` not found, `500` unexpected error. Always respond with `Content-Type: application/json` for JSON APIs.",
        "Read the body by collecting the request stream's chunks, then `JSON.parse` it inside a `try/catch` — clients can send anything.",
      ],
      code: [
        {
          filename: "server.ts",
          lang: "ts",
          source: `
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

interface Task {
  id: number;
  title: string;
  done: boolean;
}

const tasks: Task[] = [{ id: 1, title: "Learn TypeScript", done: false }];
let nextId = 2;

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");

  try {
    if (req.method === "GET" && url.pathname === "/tasks") {
      return send(res, 200, tasks);
    }

    if (req.method === "POST" && url.pathname === "/tasks") {
      const body = await readJson(req);
      const title = (body as { title?: unknown }).title;
      if (typeof title !== "string" || title.trim() === "") {
        return send(res, 400, { error: "title is required" });
      }
      const task: Task = { id: nextId++, title: title.trim(), done: false };
      tasks.push(task);
      return send(res, 201, task);
    }

    send(res, 404, { error: "Not found" });
  } catch (err) {
    if (err instanceof SyntaxError) return send(res, 400, { error: "Invalid JSON" });
    console.error(err);
    send(res, 500, { error: "Internal server error" });
  }
});

server.listen(3000, () => console.log("Listening on http://localhost:3000"));
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
npx tsx server.ts
curl http://localhost:3000/tasks
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Build an API"}'
`,
        },
      ],
      keyPoints: [
        "A server is a function from request to response — route on method + path.",
        "Validate every request body; never trust client input.",
        "Return accurate status codes and log unexpected errors server-side.",
      ],
      exercise:
        "Add `PATCH /tasks/:id` to mark a task done and `DELETE /tasks/:id` to remove it, returning 404 for unknown ids. Then add `GET /tasks?done=true` filtering using `url.searchParams`.",
    },
    {
      slug: "testing",
      title: "Testing with node:test",
      summary: "Write automated tests with Node's built-in test runner and assertions.",
      body: [
        "Automated tests check that your code does what you expect — and keep checking every time you change it. Node.js includes a test runner (`node:test`) and assertions (`node:assert/strict`), so you don't need extra libraries to start.",
        "Group related tests with `describe`, write each case with `it` (or `test`), and cover the normal case, edge cases (empty input, zero, boundaries) and error cases.",
        "Pure functions — same input, same output, no side effects — are the easiest to test, which is one more reason to keep business logic separate from I/O.",
      ],
      code: [
        {
          filename: "grade.ts",
          lang: "ts",
          source: `
export function gradeFor(score: number): string {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError("Score must be between 0 and 100");
  }
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "F";
}
`,
        },
        {
          filename: "grade.test.ts",
          lang: "ts",
          source: `
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gradeFor } from "./grade";

describe("gradeFor", () => {
  it("returns A for top scores", () => {
    assert.equal(gradeFor(90), "A");
  });

  it("handles grade boundaries exactly", () => {
    assert.equal(gradeFor(75), "A");
    assert.equal(gradeFor(74), "B");
    assert.equal(gradeFor(30), "D");
    assert.equal(gradeFor(29), "F");
  });

  it("rejects out-of-range scores", () => {
    assert.throws(() => gradeFor(101), RangeError);
    assert.throws(() => gradeFor(-1), RangeError);
  });
});
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
node --import tsx --test grade.test.ts
`,
        },
      ],
      keyPoints: [
        "Test behaviour, including boundaries and failure cases — not just the happy path.",
        "`node:test` + `node:assert/strict` need no extra dependencies.",
        "Keep logic in pure functions so it's easy to test.",
      ],
      exercise:
        "Write tests for the `parseAge` function from the Error Handling lesson: a valid age, a decimal, a negative number, text input and the boundaries 0 and 120. Add a `test` script to package.json.",
    },
  ],
};
