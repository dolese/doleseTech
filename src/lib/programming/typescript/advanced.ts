import type { LevelTrack } from "../types";

export const advanced: LevelTrack = {
  intro:
    "Master the type system, validate data at runtime, understand the Node.js event loop and streams, and structure, harden and ship production-grade TypeScript services.",
  outcomes: [
    "Write mapped, conditional and template-literal types",
    "Validate untrusted input at runtime and derive types from schemas",
    "Reason about the event loop, worker threads and streams for performance",
    "Architect, configure and deploy a production Node.js service",
  ],
  lessons: [
    {
      slug: "advanced-types",
      title: "Advanced Types: Mapped, Conditional & Template Literal",
      summary: "Compute new types from existing ones with keyof, mapped and conditional types.",
      body: [
        "`keyof T` produces a union of an object type's keys; `T[K]` looks up the type of a property. `typeof value` lifts a runtime value's type into the type world, and `as const` keeps literal values instead of widening them.",
        "Mapped types loop over keys to build a new type — for example, turning every property into a getter or making them all optional. Conditional types (`T extends U ? X : Y`) choose a type based on another, and `infer` captures part of a type, such as a Promise's resolved value.",
        "Template literal types build string types from other types, which is great for event names, routes and CSS-like tokens.",
      ],
      code: [
        {
          filename: "advanced-types.ts",
          lang: "ts",
          source: `
const ROLES = ["admin", "teacher", "student"] as const;
type Role = (typeof ROLES)[number]; // "admin" | "teacher" | "student"

interface User {
  id: number;
  name: string;
  role: Role;
}

type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
// { getId: () => number; getName: () => string; getRole: () => Role }

type Unwrap<T> = T extends Promise<infer U> ? U : T;
type A = Unwrap<Promise<string[]>>; // string[]

type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K;
}[keyof T];

type EventName = \`\${"user" | "order"}:\${"created" | "deleted"}\`;
// "user:created" | "user:deleted" | "order:created" | "order:deleted"

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

function makeGetters<T extends object>(obj: T): Getters<T> {
  const out: Record<string, () => unknown> = {};
  for (const key of Object.keys(obj) as (keyof T & string)[]) {
    out["get" + key[0].toUpperCase() + key.slice(1)] = () => obj[key];
  }
  return out as Getters<T>;
}

const users: User[] = [{ id: 1, name: "Amina", role: "teacher" }];
const names: string[] = pluck(users, "name");
const g = makeGetters(users[0]);
const ev: EventName = "order:created";
const sample: A = ["typed"];
type DataKeys = NonFunctionKeys<User & { save(): void }>; // "id" | "name" | "role"
const key: DataKeys = "role";

console.log(names, g.getRole(), ev, sample, key, ROLES);
`,
        },
      ],
      keyPoints: [
        "`as const` + `typeof X[number]` derives a union from a runtime array — one source of truth.",
        "Mapped types transform every key; `as` in a mapped type renames keys.",
        "Use conditional and `infer` types sparingly — readability still matters.",
      ],
      exercise:
        "Write a type `DeepReadonly<T>` that makes nested objects and arrays readonly. Then write `type Routes = \"/users\" | \"/users/:id\"` and a type `ParamsOf<R>` that extracts `{ id: string }` from \"/users/:id\".",
    },
    {
      slug: "utility-types",
      title: "Utility Types & the satisfies Operator",
      summary: "Partial, Pick, Omit, Record, ReturnType, Awaited — and safer config with satisfies.",
      body: [
        "TypeScript ships utility types that cover most everyday transformations: `Partial<T>` (all optional — perfect for update payloads), `Required<T>`, `Pick<T, K>` and `Omit<T, K>` (subset of keys), `Record<K, V>` (dictionary), `ReturnType<F>`, `Parameters<F>` and `Awaited<T>`.",
        "Derive types from a single source of truth instead of repeating them. If the `User` interface changes, `Omit<User, \"id\">` updates automatically everywhere.",
        "The `satisfies` operator checks that a value matches a type without widening it, so you keep precise literal types (and autocomplete) while still getting validation.",
      ],
      code: [
        {
          filename: "utility-types.ts",
          lang: "ts",
          source: `
interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

type NewUser = Omit<User, "id" | "createdAt">;     // input for create
type UserUpdate = Partial<Pick<User, "name" | "email">>;
type PublicUser = Omit<User, "passwordHash">;      // safe to send to clients

function toPublic({ passwordHash: _omit, ...rest }: User): PublicUser {
  return rest;
}

async function loadUser(id: number) {
  return { id, name: "Amina", email: "amina@example.com", passwordHash: "x", createdAt: new Date() };
}
type Loaded = Awaited<ReturnType<typeof loadUser>>; // the resolved object type

type Theme = "light" | "dark";
const palette = {
  light: { bg: "#ffffff", text: "#1B2435" },
  dark: { bg: "#0E1826", text: "#E7ECF6" },
} satisfies Record<Theme, { bg: string; text: string }>;

const draft: NewUser = { name: "Juma", email: "juma@example.com", passwordHash: "h" };
const patch: UserUpdate = { email: "new@example.com" };

loadUser(1).then((u: Loaded) => {
  console.log(toPublic(u), draft.name, patch, palette.dark.bg);
});
`,
        },
      ],
      keyPoints: [
        "Derive related types (create, update, public) from one base type.",
        "`Omit` sensitive fields to build types that are safe to expose.",
        "`satisfies` validates a value while preserving its exact inferred type.",
      ],
      exercise:
        "Given a `Product` interface, derive `CreateProductInput`, `UpdateProductInput` and `ProductSummary` (id, name, price only). Write a `const` route table with `satisfies Record<string, { method: \"GET\" | \"POST\"; auth: boolean }>`.",
    },
    {
      slug: "runtime-validation",
      title: "Runtime Validation with Zod",
      summary: "Types disappear at runtime — validate external data and infer types from schemas.",
      body: [
        "TypeScript types are erased when code runs. Anything coming from outside your program — HTTP bodies, environment variables, files, third-party APIs — can be any shape, regardless of what your types say.",
        "A schema library such as Zod validates data at runtime and gives you the TypeScript type for free with `z.infer`, so the schema is the single source of truth.",
        "Validate at the boundaries (where data enters), then pass fully typed, trusted values to the rest of your code. Use `safeParse` to get a result object instead of an exception, and return the issues to the client as a 400 response.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
npm install zod
`,
        },
        {
          filename: "validation.ts",
          lang: "ts",
          source: `
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().email(),
  phone: z.string().regex(/^0[67]\\d{8}$/, "Use a Tanzanian mobile number like 0712345678"),
  form: z.coerce.number().int().min(1).max(6),
  subjects: z.array(z.string()).min(1).max(10),
});

type RegisterInput = z.infer<typeof RegisterSchema>;

function register(input: RegisterInput): string {
  return input.name + " registered for Form " + input.form;
}

const body: unknown = {
  name: "  Amina ",
  email: "amina@example.com",
  phone: "0712345678",
  form: "4",
  subjects: ["Maths", "Biology"],
};

const parsed = RegisterSchema.safeParse(body);
if (parsed.success) {
  console.log(register(parsed.data)); // name trimmed, form coerced to number
} else {
  console.log(parsed.error.flatten().fieldErrors);
}

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});
export const env = EnvSchema.parse(process.env);
`,
        },
      ],
      keyPoints: [
        "Types are compile-time only; validate every external input at runtime.",
        "`z.infer` derives the TypeScript type from the schema — no duplication.",
        "Validate environment variables at startup so misconfiguration fails fast.",
      ],
      exercise:
        "Add Zod validation to the HTTP server from the Intermediate track: a `CreateTaskSchema` (title 1–120 chars, optional due date as ISO string, optional priority enum). Return `400` with field errors when validation fails.",
    },
    {
      slug: "event-loop",
      title: "The Event Loop, Concurrency & Worker Threads",
      summary: "How Node.js schedules work, why CPU-heavy code blocks it, and how to fix that.",
      body: [
        "Node.js runs JavaScript on one main thread driven by the event loop. After the current code finishes, Node runs all queued microtasks (`process.nextTick`, then Promise callbacks), then moves through the loop's phases: timers (`setTimeout`), I/O callbacks, `setImmediate`, and so on.",
        "I/O (network, disk) is handled outside the main thread, so thousands of concurrent requests are cheap. But CPU-heavy JavaScript — big loops, image processing, hashing large data — blocks the loop, and every other request waits.",
        "Fix CPU-bound work by moving it to a `worker_threads` Worker, splitting it into chunks, or moving it to a separate service. Measure event-loop delay with `perf_hooks.monitorEventLoopDelay` in production.",
      ],
      code: [
        {
          filename: "event-loop.ts",
          lang: "ts",
          source: `
function demo(): void {
  console.log("1. sync start");

  setTimeout(() => console.log("6. setTimeout (next timers phase)"), 0);
  setImmediate(() => console.log("5. setImmediate (check phase)"));
  Promise.resolve().then(() => console.log("4. promise microtask"));
  process.nextTick(() => console.log("3. nextTick (before promises)"));

  console.log("2. sync end");
}

// Run inside a timer callback so the order is always 1 → 6. (At the top level
// of an ES module, promises can run before nextTick, because the module itself
// is evaluated as a promise job.)
setTimeout(demo, 0);
`,
        },
        {
          filename: "worker.ts",
          lang: "ts",
          source: `
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { fileURLToPath } from "node:url";

function countPrimes(limit: number): number {
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) count++;
  }
  return count;
}

if (isMainThread) {
  const worker = new Worker(fileURLToPath(import.meta.url), {
    workerData: 5_000_000,
    execArgv: ["--import", "tsx"],
  });
  const ticker = setInterval(() => console.log("main thread still responsive"), 200);
  worker.on("message", (count: number) => {
    clearInterval(ticker);
    console.log("Primes found:", count);
  });
  worker.on("error", (err) => console.error(err));
} else {
  parentPort?.postMessage(countPrimes(workerData as number));
}
`,
        },
      ],
      keyPoints: [
        "Microtasks (nextTick, Promises) run before timers and I/O callbacks.",
        "Async I/O scales well; CPU-heavy JavaScript blocks every request.",
        "Offload CPU-bound work to worker threads or separate services.",
      ],
      exercise:
        "Write a server route that computes a large Fibonacci number synchronously and observe how another route becomes slow while it runs. Then move the computation into a Worker and compare response times.",
    },
    {
      slug: "streams",
      title: "Streams & Processing Large Data",
      summary: "Process files and network data piece by piece with streams and pipeline.",
      body: [
        "`readFile` loads a whole file into memory — fine for small files, a crash waiting to happen for a 5 GB log. Streams process data in chunks, so memory use stays flat no matter how large the input.",
        "There are four kinds: Readable (source), Writable (destination), Duplex (both), and Transform (modifies data as it passes through). `pipeline` from `node:stream/promises` connects them and correctly handles errors and cleanup.",
        "Streams handle backpressure: if the destination is slower than the source, reading pauses automatically. Readable streams are also async iterables, so `for await...of` works on them.",
      ],
      code: [
        {
          filename: "streams.ts",
          lang: "ts",
          source: `
import { createReadStream, createWriteStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

async function main(): Promise<void> {
  await writeFile("results.csv", "name,score\\nAmina,88\\nJuma,42\\nNeema,71\\n");

  // 1. Line-by-line processing with constant memory
  const lines = createInterface({ input: createReadStream("results.csv"), crlfDelay: Infinity });
  let total = 0;
  let count = 0;
  for await (const line of lines) {
    const [, score] = line.split(",");
    if (score && !Number.isNaN(Number(score))) {
      total += Number(score);
      count++;
    }
  }
  console.log("Average:", (total / count).toFixed(1));

  // 2. Transform + gzip pipeline
  const upper = new Transform({
    transform(chunk: Buffer, _enc, callback) {
      callback(null, chunk.toString("utf8").toUpperCase());
    },
  });

  await pipeline(
    createReadStream("results.csv"),
    upper,
    createGzip(),
    createWriteStream("results.upper.csv.gz"),
  );
  console.log("Wrote results.upper.csv.gz");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
`,
        },
      ],
      keyPoints: [
        "Use streams whenever input size is unbounded or large.",
        "`pipeline` wires streams together with proper error handling and cleanup.",
        "Readable streams are async iterables — `for await` is often the simplest consumer.",
      ],
      exercise:
        "Generate a CSV with 1,000,000 rows of random student scores using a write stream (respect backpressure by awaiting the `drain` event). Then stream it back to compute the average and the grade distribution, logging `process.memoryUsage().heapUsed` to confirm memory stays low.",
    },
    {
      slug: "architecture",
      title: "Application Architecture & Dependency Injection",
      summary: "Separate routes, services and data access so code stays testable as it grows.",
      body: [
        "As an application grows, mixing HTTP handling, business rules and database code in one place makes every change risky. A layered structure keeps responsibilities clear: routes/controllers (HTTP in and out), services (business rules), repositories (data access).",
        "Each layer depends on interfaces, not concrete implementations. The service receives its repository through its constructor — this is dependency injection. In production you pass a Postgres repository; in tests you pass an in-memory one.",
        "Keep a single composition root (usually `main.ts`) where everything is created and wired together. Nothing else should construct its own dependencies.",
      ],
      code: [
        {
          filename: "architecture.ts",
          lang: "ts",
          source: `
// ── Domain ───────────────────────────────────────────────
interface Student {
  id: string;
  name: string;
  scores: number[];
}

// ── Repository (data access) ─────────────────────────────
interface StudentRepository {
  findById(id: string): Promise<Student | undefined>;
  save(student: Student): Promise<void>;
}

class InMemoryStudentRepository implements StudentRepository {
  private store = new Map<string, Student>();
  async findById(id: string) {
    return this.store.get(id);
  }
  async save(student: Student) {
    this.store.set(student.id, student);
  }
}

// ── Service (business rules) ─────────────────────────────
class StudentNotFoundError extends Error {}

class ReportService {
  constructor(private readonly students: StudentRepository) {}

  async addScore(id: string, score: number): Promise<void> {
    if (score < 0 || score > 100) throw new RangeError("Score must be 0–100");
    const student = await this.students.findById(id);
    if (!student) throw new StudentNotFoundError(id);
    await this.students.save({ ...student, scores: [...student.scores, score] });
  }

  async average(id: string): Promise<number> {
    const student = await this.students.findById(id);
    if (!student) throw new StudentNotFoundError(id);
    if (student.scores.length === 0) return 0;
    return student.scores.reduce((a, b) => a + b, 0) / student.scores.length;
  }
}

// ── Composition root ─────────────────────────────────────
async function main(): Promise<void> {
  const repo = new InMemoryStudentRepository(); // swap for a Postgres repository in production
  const reports = new ReportService(repo);

  await repo.save({ id: "s1", name: "Amina", scores: [] });
  await reports.addScore("s1", 80);
  await reports.addScore("s1", 90);
  console.log("Average:", await reports.average("s1")); // 85
}

main();
`,
        },
      ],
      keyPoints: [
        "Routes handle HTTP, services hold rules, repositories hold data access.",
        "Inject dependencies through constructors; depend on interfaces.",
        "Wire everything in one composition root.",
      ],
      exercise:
        "Add an HTTP layer on top of `ReportService` (using the server from the Intermediate track) and map `StudentNotFoundError` → 404 and `RangeError` → 400. Write tests for `ReportService` using the in-memory repository.",
    },
    {
      slug: "production",
      title: "Production: Build, Configure, Observe & Deploy",
      summary: "Compile for production, log properly, shut down gracefully and ship with Docker.",
      body: [
        "For production, compile TypeScript to JavaScript with `tsc` and run the output with plain `node` — faster startup and no dev tooling on the server. Turn on strict compiler checks such as `noUncheckedIndexedAccess` to catch more bugs.",
        "Configure the app through environment variables (validated at startup, as in the Zod lesson), never hard-coded secrets. Log structured JSON so log platforms can search and alert on it.",
        "Handle `SIGTERM`: stop accepting new connections, let in-flight requests finish, close database pools, then exit. Hosting platforms and Kubernetes send `SIGTERM` on every deploy. Package the app in a small multi-stage Docker image that runs as a non-root user.",
      ],
      code: [
        {
          filename: "tsconfig.json",
          lang: "json",
          source: `
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
`,
        },
        {
          filename: "src/main.ts",
          lang: "ts",
          source: `
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3000);

function log(level: "info" | "error", msg: string, extra: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ time: new Date().toISOString(), level, msg, ...extra }));
}

const server = createServer((req, res) => {
  const started = performance.now();
  res.on("finish", () => {
    log("info", "request", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      ms: Math.round(performance.now() - started),
    });
  });

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok" }));
  }
  res.writeHead(404).end();
});

server.listen(PORT, () => log("info", "server started", { port: PORT }));

function shutdown(signal: string): void {
  log("info", "shutting down", { signal });
  server.close((err) => {
    if (err) log("error", "close failed", { err: String(err) });
    process.exit(err ? 1 : 0);
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // force-exit if stuck
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
`,
        },
        {
          filename: "Dockerfile",
          lang: "dockerfile",
          source: `
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
`,
        },
      ],
      keyPoints: [
        "Compile with `tsc`, run plain `node dist/main.js` in production.",
        "Validate config at startup; log structured JSON; expose a `/health` endpoint.",
        "Handle `SIGTERM` for zero-downtime deploys; run containers as non-root.",
      ],
      exercise:
        "Take your task API from the earlier lessons, add a `/health` endpoint, structured logging and graceful shutdown, build it with the Dockerfile above, run it with `docker run -p 3000:3000`, and confirm `docker stop` triggers a clean shutdown in the logs.",
    },
  ],
};
