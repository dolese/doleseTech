import type { Practice } from "../../types";
import { authentication as authenticationPractice, cachingAndRateLimiting as cachingAndRateLimitingPractice, projectResultsPortal as projectResultsPortalPractice } from "./more";

export const advanced: Record<string, Practice> = {
  "advanced-types": {
    solution: {
      notes: [
        "`DeepReadonly` is a recursive mapped type: primitives and functions stay as they are, arrays become `ReadonlyArray`s of deep-readonly items, and objects get `readonly` keys whose values are made deep-readonly too.",
        "`ParamsOf` uses template literal types with `infer` to peel one `:param` segment at a time and collects each name as a `string` property.",
      ],
      code: [
        {
          filename: "deep-types.ts",
          lang: "ts",
          source: `
type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type ParamsOf<R extends string> = R extends \`\${string}:\${infer Param}/\${infer Rest}\`
  ? { [K in Param]: string } & ParamsOf<\`/\${Rest}\`>
  : R extends \`\${string}:\${infer Param}\`
    ? { [K in Param]: string }
    : {};

interface School {
  name: string;
  forms: { level: number; streams: string[] }[];
}

const school: DeepReadonly<School> = {
  name: "Azania",
  forms: [{ level: 4, streams: ["A", "B"] }],
};
// school.forms[0].streams.push("C");   // error: push does not exist on ReadonlyArray
// school.forms[0].level = 5;            // error: level is read-only

type Routes = "/users" | "/users/:id";
type UserParams = ParamsOf<"/users/:id">;                          // { id: string }
type ResultParams = ParamsOf<"/schools/:schoolId/results/:term">;  // { schoolId: string } & { term: string }

const p1: UserParams = { id: "42" };
const p2: ResultParams = { schoolId: "S1", term: "2" };
const route: Routes = "/users/:id";
console.log(school.forms[0].streams, p1, p2, route);
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `keyof { id: number; name: string }` produce?",
        options: ["`number | string`", "`\"id\" | \"name\"`", "`[\"id\", \"name\"]`", "`object`"],
        answer: 1,
        explanation: "`keyof` gives a union of the property names.",
      },
      {
        question: "Given `const ROLES = [\"admin\", \"teacher\"] as const`, what is `(typeof ROLES)[number]`?",
        options: ["`string`", "`number`", "`\"admin\" | \"teacher\"`", "`readonly string[]`"],
        answer: 2,
        explanation: "`as const` keeps the literal values, and indexing with `number` yields the union of elements.",
      },
      {
        question: "In `T extends Promise<infer U> ? U : T`, what does `infer U` do?",
        options: [
          "Captures the type inside the Promise so it can be used in the result",
          "Creates a new Promise",
          "Forces T to be a Promise",
          "Makes U optional",
        ],
        answer: 0,
        explanation: "`infer` declares a type variable that is filled in by pattern-matching against T.",
      },
      {
        question: "What does a template literal type like `` `${\"user\" | \"order\"}:created` `` produce?",
        options: [
          "A runtime string",
          "An error",
          "`string`",
          "`\"user:created\" | \"order:created\"`",
        ],
        answer: 3,
        explanation: "Template literal types distribute over unions, producing every combination.",
      },
    ],
  },

  "utility-types": {
    solution: {
      notes: [
        "Each input type is derived from the one `Product` interface, so changing `Product` updates them all. The route table uses `satisfies`: every entry is checked against the allowed shape, yet `routes` keeps its exact keys, so a typo like `routes[\"/prodcts\"]` is still caught.",
      ],
      code: [
        {
          filename: "products-types.ts",
          lang: "ts",
          source: `
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: Date;
}

type CreateProductInput = Omit<Product, "id" | "createdAt">;
type UpdateProductInput = Partial<CreateProductInput>;
type ProductSummary = Pick<Product, "id" | "name" | "price">;

const routes = {
  "/products": { method: "GET", auth: false },
  "/products/new": { method: "POST", auth: true },
} satisfies Record<string, { method: "GET" | "POST"; auth: boolean }>;

const input: CreateProductInput = { name: "Geometry set", price: 4500, stock: 40 };
const patch: UpdateProductInput = { price: 4000 };
const summary: ProductSummary = { id: 1, name: input.name, price: patch.price ?? input.price };

console.log(summary, routes["/products/new"].auth);   // { id: 1, name: 'Geometry set', price: 4000 } true
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which utility type makes every property optional — ideal for an update payload?",
        options: ["`Required<T>`", "`Readonly<T>`", "`Partial<T>`", "`Pick<T, K>`"],
        answer: 2,
        explanation: "`Partial<T>` lets a client send only the fields it wants to change.",
      },
      {
        question: "How do you build a user type that is safe to send to clients, without the password hash?",
        options: [
          "`Omit<User, \"passwordHash\">`",
          "`Pick<User, \"passwordHash\">`",
          "`Partial<User>`",
          "`Record<User, string>`",
        ],
        answer: 0,
        explanation: "`Omit` removes the listed keys; deriving it from `User` keeps it in sync automatically.",
      },
      {
        question: "What is the result type of `Awaited<ReturnType<typeof loadUser>>` when `loadUser` is async and returns a user object?",
        options: ["`Promise<User>`", "`ReturnType`", "`unknown`", "The resolved user object type"],
        answer: 3,
        explanation: "`ReturnType` gives `Promise<...>`; `Awaited` unwraps it to the resolved value.",
      },
      {
        question: "What does `satisfies` do that a type annotation does not?",
        options: [
          "It converts values at runtime",
          "It checks the value against a type while keeping the value's precise inferred type",
          "It makes properties optional",
          "It disables type checking",
        ],
        answer: 1,
        explanation: "With an annotation the variable takes the wider type; with `satisfies` it keeps its exact literal types.",
      },
    ],
  },

  "runtime-validation": {
    solution: {
      notes: [
        "Define the schema once and derive the type from it with `z.infer`. In the route, `safeParse` the body: on failure return 400 with `flatten().fieldErrors`, so the client sees exactly which field is wrong.",
      ],
      code: [
        {
          filename: "create-task.ts",
          lang: "ts",
          source: `
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

function handleCreate(body: unknown): { status: number; body: unknown } {
  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { errors: parsed.error.flatten().fieldErrors } };
  }
  const task: CreateTaskInput & { id: number } = { id: 1, ...parsed.data };
  return { status: 201, body: task };
}

console.log(JSON.stringify(handleCreate({ title: "  Revise vectors ", dueDate: "2026-11-01T08:00:00Z" })));
// {"status":201,"body":{"id":1,"title":"Revise vectors","dueDate":"2026-11-01T08:00:00Z","priority":"normal"}}
console.log(JSON.stringify(handleCreate({ title: "", priority: "urgent" })));
// {"status":400,"body":{"errors":{"title":["Title is required"],"priority":["Invalid enum value. ..."]}}}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why aren't TypeScript types enough to validate an HTTP request body?",
        options: [
          "Types are erased at runtime, so they can't check data arriving from outside",
          "Types are too slow",
          "HTTP bodies are always strings",
          "TypeScript can't describe objects",
        ],
        answer: 0,
        explanation: "Types exist only at compile time; external data must be checked when the program runs.",
      },
      {
        question: "What does `z.infer<typeof Schema>` give you?",
        options: [
          "A runtime validator",
          "A JSON example",
          "The TypeScript type described by the schema",
          "A list of errors",
        ],
        answer: 2,
        explanation: "The schema is the single source of truth for both validation and the static type.",
      },
      {
        question: "What is the difference between `parse` and `safeParse`?",
        options: [
          "`safeParse` is faster",
          "There is none",
          "`parse` never throws",
          "`parse` throws on invalid data; `safeParse` returns a success/failure result object",
        ],
        answer: 3,
        explanation: "`safeParse` lets you handle invalid input as a normal value, e.g. to return a 400.",
      },
      {
        question: "Why validate environment variables at startup?",
        options: [
          "It speeds up requests",
          "Misconfiguration fails immediately with a clear error instead of later in production",
          "Environment variables are always numbers",
          "It encrypts them",
        ],
        answer: 1,
        explanation: "Failing fast at boot is far easier to diagnose than a strange error hours later.",
      },
    ],
  },

  "event-loop": {
    solution: {
      notes: [
        "While `/fib-sync` computes, the event loop is blocked, so even `/ping` has to wait. `/fib-worker` runs the same calculation in a worker thread, and `/ping` keeps answering instantly. Try `curl localhost:3000/fib-sync` and, at the same time, `curl localhost:3000/ping` in another terminal.",
      ],
      code: [
        {
          filename: "fib-server.ts",
          lang: "ts",
          source: `
import { createServer } from "node:http";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { fileURLToPath } from "node:url";

function fib(n: number): number {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

function fibInWorker(n: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(fileURLToPath(import.meta.url), { workerData: n, execArgv: ["--import", "tsx"] });
    worker.once("message", resolve);
    worker.once("error", reject);
  });
}

if (isMainThread) {
  createServer(async (req, res) => {
    const started = performance.now();
    let body: string;
    if (req.url === "/fib-sync") body = String(fib(40));                 // blocks everyone
    else if (req.url === "/fib-worker") body = String(await fibInWorker(40));   // main thread stays free
    else body = "pong";
    res.end(body + " (" + Math.round(performance.now() - started) + " ms)\\n");
  }).listen(3000, () => console.log("Try /fib-sync, /fib-worker and /ping on port 3000"));
} else {
  parentPort?.postMessage(fib(workerData as number));
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "In which order do these log? `setTimeout(A, 0)`, `Promise.resolve().then(B)`, `console.log(C)`",
        options: ["A, B, C", "C, B, A", "B, C, A", "C, A, B"],
        answer: 1,
        explanation: "Synchronous code first, then microtasks (Promise callbacks), then timers.",
      },
      {
        question: "Why does a CPU-heavy loop in a request handler slow down every other request?",
        options: [
          "Node.js limits each request to one second",
          "It uses too much memory",
          "JavaScript runs on one main thread, so the event loop can't process anything else until the loop finishes",
          "Because of the network",
        ],
        answer: 2,
        explanation: "I/O is offloaded, but your JavaScript runs on a single thread.",
      },
      {
        question: "Which is the best fix for an expensive calculation inside a Node.js server?",
        options: [
          "Wrap it in `async`",
          "Add `await` before it",
          "Use `setTimeout(fn, 0)` around the whole calculation",
          "Move it to a `worker_threads` Worker (or a separate service)",
        ],
        answer: 3,
        explanation: "`async`/`await` don't move CPU work off the main thread; a Worker does.",
      },
      {
        question: "What does `process.nextTick` schedule its callback relative to Promise callbacks (in CommonJS code)?",
        options: ["Before them", "After them", "After timers", "In a separate thread"],
        answer: 0,
        explanation: "The nextTick queue is drained before the Promise microtask queue.",
      },
    ],
  },

  streams: {
    solution: {
      notes: [
        "When `write` returns `false`, the stream's buffer is full: wait for the `drain` event before writing more. That's backpressure, and it keeps memory flat even for a million rows. Reading back uses `readline` line by line, so the file is never fully in memory either.",
      ],
      code: [
        {
          filename: "million.ts",
          lang: "ts",
          source: `
import { createReadStream, createWriteStream } from "node:fs";
import { once } from "node:events";
import { createInterface } from "node:readline";

const FILE = "scores.csv";
const ROWS = 1_000_000;

async function generate(): Promise<void> {
  const out = createWriteStream(FILE);
  out.write("student,score\\n");
  for (let i = 1; i <= ROWS; i++) {
    const ok = out.write("S" + i + "," + Math.floor(Math.random() * 101) + "\\n");
    if (!ok) await once(out, "drain");          // respect backpressure
  }
  out.end();
  await once(out, "finish");
}

function grade(score: number): string {
  return score >= 75 ? "A" : score >= 65 ? "B" : score >= 45 ? "C" : score >= 30 ? "D" : "F";
}

async function analyse(): Promise<void> {
  const lines = createInterface({ input: createReadStream(FILE), crlfDelay: Infinity });
  let total = 0;
  let count = 0;
  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };

  for await (const line of lines) {
    const score = Number(line.split(",")[1]);
    if (Number.isNaN(score)) continue;          // header row
    total += score;
    count++;
    distribution[grade(score)]++;
  }

  console.log("Rows:", count, "average:", (total / count).toFixed(2));
  console.log(distribution);
  console.log("Heap used:", Math.round(process.memoryUsage().heapUsed / 1024 / 1024), "MB");
}

await generate();
await analyse();
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why use a stream instead of `readFile` for a 5 GB log file?",
        options: [
          "Streams process the data in chunks, so memory use stays small",
          "`readFile` can't read text",
          "Streams are always faster for small files",
          "`readFile` only works with JSON",
        ],
        answer: 0,
        explanation: "`readFile` loads the whole file into memory; streams handle it piece by piece.",
      },
      {
        question: "What does it mean when `writable.write()` returns `false`?",
        options: [
          "The write failed",
          "The file is closed",
          "The internal buffer is full — wait for `drain` before writing more",
          "The stream finished",
        ],
        answer: 2,
        explanation: "That's backpressure. Ignoring it lets memory grow without limit.",
      },
      {
        question: "What advantage does `pipeline()` from `node:stream/promises` have over chaining `.pipe()`?",
        options: [
          "It is shorter to type",
          "It compresses data automatically",
          "It only works with files",
          "It propagates errors and cleans up every stream properly",
        ],
        answer: 3,
        explanation: "With bare `.pipe()`, an error in one stream can leave others open and unhandled.",
      },
      {
        question: "Which stream type modifies data as it passes through?",
        options: ["Readable", "Transform", "Writable", "Static"],
        answer: 1,
        explanation: "A Transform is both writable and readable, changing chunks along the way (e.g. gzip).",
      },
    ],
  },

  architecture: {
    solution: {
      notes: [
        "The HTTP layer translates domain errors into status codes in one place: `StudentNotFoundError` → 404, `RangeError` → 400, anything else → 500. Because `ReportService` only depends on the `StudentRepository` interface, the tests use the in-memory repository — no database or server needed.",
      ],
      code: [
        {
          filename: "report-service.ts",
          lang: "ts",
          source: `
export interface Student {
  id: string;
  name: string;
  scores: number[];
}

export interface StudentRepository {
  findById(id: string): Promise<Student | undefined>;
  save(student: Student): Promise<void>;
}

export class InMemoryStudentRepository implements StudentRepository {
  private store = new Map<string, Student>();
  async findById(id: string) {
    return this.store.get(id);
  }
  async save(student: Student) {
    this.store.set(student.id, student);
  }
}

export class StudentNotFoundError extends Error {}

export class ReportService {
  constructor(private readonly students: StudentRepository) {}

  async addScore(id: string, score: number): Promise<void> {
    if (score < 0 || score > 100) throw new RangeError("Score must be 0-100");
    const student = await this.students.findById(id);
    if (!student) throw new StudentNotFoundError(id);
    await this.students.save({ ...student, scores: [...student.scores, score] });
  }

  async average(id: string): Promise<number> {
    const student = await this.students.findById(id);
    if (!student) throw new StudentNotFoundError(id);
    return student.scores.length ? student.scores.reduce((a, b) => a + b, 0) / student.scores.length : 0;
  }
}

/** HTTP layer: one place that maps domain errors to status codes. */
export function statusFor(err: unknown): number {
  if (err instanceof StudentNotFoundError) return 404;
  if (err instanceof RangeError) return 400;
  return 500;
}
`,
        },
        {
          filename: "report-service.test.ts",
          lang: "ts",
          source: `
import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryStudentRepository, ReportService, StudentNotFoundError, statusFor } from "./report-service";

describe("ReportService", () => {
  let repo: InMemoryStudentRepository;
  let service: ReportService;

  beforeEach(async () => {
    repo = new InMemoryStudentRepository();
    service = new ReportService(repo);
    await repo.save({ id: "s1", name: "Amina", scores: [] });
  });

  it("averages added scores", async () => {
    await service.addScore("s1", 80);
    await service.addScore("s1", 90);
    assert.equal(await service.average("s1"), 85);
  });

  it("returns 0 for a student with no scores", async () => {
    assert.equal(await service.average("s1"), 0);
  });

  it("rejects out-of-range scores and unknown students", async () => {
    await assert.rejects(service.addScore("s1", 101), RangeError);
    await assert.rejects(service.average("nope"), StudentNotFoundError);
  });

  it("maps errors to HTTP status codes", () => {
    assert.equal(statusFor(new StudentNotFoundError("x")), 404);
    assert.equal(statusFor(new RangeError("bad")), 400);
    assert.equal(statusFor(new Error("boom")), 500);
  });
});
`,
        },
      ],
    },
    quiz: [
      {
        question: "In a layered app, where do business rules such as \"a score must be 0–100\" belong?",
        options: ["In the HTTP route handler", "In the service layer", "In the database driver", "In the CSS"],
        answer: 1,
        explanation: "Routes translate HTTP; services hold the rules; repositories handle data access.",
      },
      {
        question: "What is dependency injection in this lesson?",
        options: [
          "Passing a service its dependencies (like a repository) through its constructor",
          "Installing packages with npm",
          "Importing every module at the top",
          "Using global variables",
        ],
        answer: 0,
        explanation: "The service doesn't create its repository — it receives one, so it can be swapped.",
      },
      {
        question: "Why does the service depend on the `StudentRepository` interface rather than a Postgres class?",
        options: [
          "Interfaces run faster",
          "Postgres doesn't support classes",
          "TypeScript requires interfaces for async methods",
          "So tests (or another database) can supply a different implementation",
        ],
        answer: 3,
        explanation: "Depending on an interface decouples business logic from storage details.",
      },
      {
        question: "What is the composition root?",
        options: [
          "The root folder of the project",
          "The first route",
          "The one place (e.g. `main.ts`) where dependencies are created and wired together",
          "The database's main table",
        ],
        answer: 2,
        explanation: "Keeping all wiring in one place makes the rest of the code free of construction details.",
      },
    ],
  },

  production: {
    solution: {
      notes: [
        "Combine the task routes with the production pieces from the lesson: a `/health` endpoint, one JSON log line per request, and a `SIGTERM` handler that stops accepting connections and exits once in-flight requests finish. Compile with `tsc`, run with plain `node`, and `docker stop` sends the SIGTERM you can watch in the logs.",
      ],
      code: [
        {
          filename: "src/main.ts",
          lang: "ts",
          source: `
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3000);
const tasks = [{ id: 1, title: "Ship it", done: false }];

function log(level: "info" | "error", msg: string, extra: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ time: new Date().toISOString(), level, msg, ...extra }));
}

const server = createServer((req, res) => {
  const started = performance.now();
  res.on("finish", () =>
    log("info", "request", { method: req.method, url: req.url, status: res.statusCode, ms: Math.round(performance.now() - started) }),
  );

  res.setHeader("Content-Type", "application/json");
  if (req.url === "/health") return res.end(JSON.stringify({ status: "ok", uptime: Math.round(process.uptime()) }));
  if (req.method === "GET" && req.url === "/tasks") return res.end(JSON.stringify(tasks));
  res.writeHead(404).end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => log("info", "server started", { port: PORT }));

function shutdown(signal: string): void {
  log("info", "shutting down", { signal });
  server.close(() => {
    log("info", "closed cleanly");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
docker build -t task-api .
docker run --name task-api -p 3000:3000 task-api
curl localhost:3000/health          # {"status":"ok","uptime":3}
docker stop task-api                # logs: "shutting down" (SIGTERM) then "closed cleanly"
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why run compiled JavaScript (`node dist/main.js`) in production instead of `tsx`?",
        options: [
          "Faster startup and no development tooling needed on the server",
          "tsx can't run servers",
          "TypeScript is not allowed in production",
          "It enables HTTPS",
        ],
        answer: 0,
        explanation: "Compiling ahead of time removes work from startup and keeps the image small.",
      },
      {
        question: "What should a server do when it receives `SIGTERM`?",
        options: [
          "Ignore it",
          "Exit immediately, dropping requests",
          "Restart itself",
          "Stop accepting new connections, finish in-flight requests, then exit",
        ],
        answer: 3,
        explanation: "Graceful shutdown lets deploys happen without failing users' requests.",
      },
      {
        question: "Why log structured JSON instead of plain text?",
        options: [
          "It's shorter",
          "Log platforms can search, filter and alert on individual fields",
          "Plain text is not allowed",
          "JSON logs are encrypted",
        ],
        answer: 1,
        explanation: "Fields like `status` and `ms` become queryable data.",
      },
      {
        question: "Which is a good container practice from this lesson?",
        options: [
          "Store secrets in the image",
          "Run as root for convenience",
          "Use a multi-stage build and run as a non-root user",
          "Install dev dependencies in the final image",
        ],
        answer: 2,
        explanation: "Multi-stage builds keep images small; non-root users limit damage if something goes wrong.",
      },
    ],
  },
  "authentication-and-authorization": authenticationPractice,
  "caching-and-rate-limiting": cachingAndRateLimitingPractice,
  "project-results-portal-api": projectResultsPortalPractice,
};
