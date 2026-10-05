import type { Lesson } from "../types";

// Lessons added after the first release; inserted into their levels in
// beginner.ts / intermediate.ts / advanced.ts.

export const textAndDates: Lesson = {
  slug: "text-and-dates",
  title: "Working with Text & Dates",
  summary: "String methods, template literals and template literal types, neat formatting with padStart and Intl, and safe date handling.",
  body: [
    "Strings never change in place: `trim`, `toUpperCase`, `replaceAll`, `slice` and friends all return a new string. Chain them to clean messy input, and use `split` with a regular expression such as `/\\s+/` to break text on any amount of whitespace. `at(-1)` reads the last character, and `includes`/`startsWith` answer simple questions without a regex.",
    "Template literals (`${value}` inside backticks) build text, and `padEnd`/`padStart` line it up in columns. TypeScript adds template literal types: the type `Term ${1 | 2 | 3}` (written between backticks in code, as below) accepts only \"Term 1\", \"Term 2\" or \"Term 3\", so a typo becomes a compile error instead of a bug. `Intl.NumberFormat` formats money and percentages correctly for any locale.",
    "A `Date` is one moment in time, stored in UTC. Parse unambiguous ISO strings with an offset (`2026-03-14T09:30:00+03:00`), display with `Intl.DateTimeFormat` and a `timeZone`, and compare with `getTime()`. Text typed by people needs checking: `new Date` happily turns 31/02 into 3 March, so validate the parts yourself and return `null` (typed as `Date | null`) when the input is not a real date.",
  ],
  code: [
    {
      filename: "text.ts",
      lang: "ts",
      source: `
// Strings are immutable: every method returns a new string.
const raw = "   juma   SAID ,  form 4  ";
const name = raw.split(",")[0].trim().split(/\\s+/).map(capitalize).join(" ");
console.log(JSON.stringify(name));                        // "Juma Said"

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const sentence = "Photosynthesis happens in the chloroplasts of green plants.";
console.log(sentence.includes("green"), sentence.startsWith("Photo"), sentence.at(-1));   // true true .
console.log(sentence.replaceAll("s", "S").slice(0, 14));   // PhotoSyntheSiS

// Template literal types catch typos in string formats at compile time.
type Term = \`Term \${1 | 2 | 3}\`;
const term: Term = "Term 2";
// const bad: Term = "Term 4";                            // error: not assignable to type Term

// Neat columns with padEnd / padStart
interface Row { student: string; score: number; balance: number }
const rows: Row[] = [
  { student: "Amina Hassan", score: 88, balance: 0 },
  { student: "Juma Said", score: 42, balance: 200_000 },
];
const tzs = new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });
console.log(\`\${"Name".padEnd(14)}\${"Score".padStart(6)}\${"Balance".padStart(14)}  (\${term})\`);
for (const r of rows) {
  console.log(\`\${r.student.padEnd(14)}\${String(r.score).padStart(6)}\${tzs.format(r.balance).padStart(14)}\`);
}

// Dates: a Date is one moment in time. Months are 0-based in the constructor.
const registered = new Date("2026-03-14T09:30:00+03:00");
const exams = new Date("2026-11-02T08:00:00+03:00");
const DAY_MS = 24 * 60 * 60 * 1000;
console.log(Math.floor((exams.getTime() - registered.getTime()) / DAY_MS), "days to exams");   // 232

const eat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full", timeStyle: "short", timeZone: "Africa/Dar_es_Salaam",
});
console.log(eat.format(registered));
console.log(registered.toISOString());                     // 2026-03-14T06:30:00.000Z (always UTC)

// Parse user input defensively: invalid dates are NaN, not exceptions.
function parseDayMonthYear(text: string): Date | null {
  const m = /^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})$/.exec(text.trim());
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(year, month - 1, day));
  // Reject dates JavaScript "rolls over", e.g. 31/02 becoming 3 March
  return d.getUTCDate() === day && d.getUTCMonth() === month - 1 ? d : null;
}
console.log(parseDayMonthYear("14/03/2008")?.toISOString().slice(0, 10), parseDayMonthYear("31/02/2008"));
`,
    },
  ],
  keyPoints: [
    "String methods return new strings; combine `trim`, `split(/\\s+/)`, `map` and `join` to clean text.",
    "Template literal types restrict strings to a pattern at compile time.",
    "Display dates with `Intl.DateTimeFormat` and a `timeZone`; validate user-typed dates and return `Date | null`.",
  ],
  exercise:
    "Write and export `initials(fullName)` (\"amina hassan\" → \"A.H.\"), `maskPhone(phone)` (any 10-digit number with spaces or dashes → \"0712***678\", throwing for anything else) and `ageOn(bornIso, onIso)`. Print an aligned table of initials, masked phone and age for three students.",
};

export const restApiExpress: Lesson = {
  slug: "rest-api-express",
  title: "REST APIs with Express",
  summary: "Build a typed CRUD API with Express 5: routes, params, JSON bodies, type guards, status codes, error middleware and HTTP tests.",
  body: [
    "Express is the most widely used Node.js web framework. Compared with the raw `node:http` server from the previous lessons, it gives you routing with parameters (`/students/:id`), body parsing (`express.json()`), helpers such as `res.status(201).json(...)`, and middleware: functions that run in order for every request. Express 5 also passes errors from `async` handlers to your error middleware automatically.",
    "A REST API maps HTTP methods onto resources: `GET /students` lists, `GET /students/:id` reads one, `POST` creates (201 plus a `Location` header), `PATCH` changes some fields, `DELETE` removes (204, no body). `req.body` arrives as untyped JSON, so check it with a type guard (`body is NewStudent`) before trusting it. Throw an `HttpError` with a status for expected problems and let one error handler (the middleware with four parameters) turn every error into a JSON response.",
    "Export a `createApp()` function instead of starting the server in the same file. `server.ts` calls `listen`, and tests start the same app on port 0 (any free port) and call it with `fetch`, so they exercise real HTTP: routing, status codes, headers and JSON.",
  ],
  code: [
    {
      filename: "Terminal",
      lang: "bash",
      source: `
npm install express
npm install --save-dev @types/express
npx tsx watch src/server.ts      # restarts on every save
`,
    },
    {
      filename: "src/app.ts",
      lang: "ts",
      source: `
import express, { type NextFunction, type Request, type Response } from "express";

export interface Student {
  id: number;
  name: string;
  form: number;
}

interface NewStudent {
  name: string;
  form: number;
}

// A type guard: after it returns true, TypeScript knows \`body\` is a NewStudent.
function isNewStudent(body: unknown): body is NewStudent {
  if (typeof body !== "object" || body === null) return false;
  const { name, form } = body as Record<string, unknown>;
  return typeof name === "string" && name.trim().length >= 2 && Number.isInteger(form) && (form as number) >= 1 && (form as number) <= 6;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function createApp(students: Student[] = []) {
  const app = express();
  app.use(express.json());                         // parses JSON bodies into req.body
  let nextId = Math.max(0, ...students.map((s) => s.id)) + 1;

  function findStudent(id: string): Student {
    const student = students.find((s) => s.id === Number(id));
    if (!student) throw new HttpError(404, \`Student \${id} not found\`);
    return student;
  }

  app.get("/students", (_req, res) => {
    res.json(students);
  });

  app.get("/students/:id", (req, res) => {
    res.json(findStudent(req.params.id));
  });

  app.post("/students", (req, res) => {
    if (!isNewStudent(req.body)) throw new HttpError(400, "name (2+ letters) and form (1-6) are required");
    const student: Student = { id: nextId++, name: req.body.name.trim(), form: req.body.form };
    students.push(student);
    res.status(201).location(\`/students/\${student.id}\`).json(student);
  });

  app.patch("/students/:id", (req, res) => {
    const student = findStudent(req.params.id);
    const changes = { ...student, ...req.body, id: student.id };
    if (!isNewStudent(changes)) throw new HttpError(400, "invalid name or form");
    Object.assign(student, { name: changes.name.trim(), form: changes.form });
    res.json(student);
  });

  app.delete("/students/:id", (req, res) => {
    const student = findStudent(req.params.id);
    students.splice(students.indexOf(student), 1);
    res.status(204).end();
  });

  // Unknown routes, then one error handler for everything (Express 5 also catches async errors).
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err instanceof SyntaxError) return res.status(400).json({ error: "Body must be valid JSON" });
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
`,
    },
    {
      filename: "src/server.ts",
      lang: "ts",
      source: `
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
const app = createApp([{ id: 1, name: "Amina Hassan", form: 4 }]);
app.listen(port, () => console.log(\`API on http://localhost:\${port}\`));
`,
    },
    {
      filename: "test/app.test.ts",
      lang: "ts",
      source: `
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../src/app";

let server: Server;
let base: string;

before(async () => {
  server = createApp([{ id: 1, name: "Amina Hassan", form: 4 }]).listen(0);   // port 0 = any free port
  await new Promise((resolve) => server.once("listening", resolve));
  base = \`http://localhost:\${(server.address() as AddressInfo).port}\`;
});
after(() => server.close());

const post = (path: string, body: string) =>
  fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body });

describe("students API", () => {
  it("creates a student and returns 201 with a Location header", async () => {
    const res = await post("/students", JSON.stringify({ name: "Juma Said", form: 3 }));
    assert.equal(res.status, 201);
    assert.equal(res.headers.get("location"), "/students/2");
    assert.deepEqual(await res.json(), { id: 2, name: "Juma Said", form: 3 });
  });

  it("rejects invalid input and broken JSON with 400", async () => {
    assert.equal((await post("/students", JSON.stringify({ name: "J", form: 9 }))).status, 400);
    assert.equal((await post("/students", "{not json")).status, 400);
  });

  it("updates, deletes and then 404s", async () => {
    const patched = await fetch(\`\${base}/students/1\`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ form: 5 }),
    });
    assert.equal((await patched.json()).form, 5);
    assert.equal((await fetch(\`\${base}/students/1\`, { method: "DELETE" })).status, 204);
    assert.equal((await fetch(\`\${base}/students/1\`)).status, 404);
  });
});
`,
    },
    {
      filename: "Terminal",
      lang: "bash",
      source: `
node --import tsx --test test/*.test.ts     # runs the HTTP tests
`,
    },
  ],
  keyPoints: [
    "Routes plus middleware: `express.json()` first, then routes, then a 404 handler, then the error handler.",
    "Validate `req.body` with a type guard; use 201/204/400/404 status codes correctly.",
    "Export `createApp()` so tests can run the real app on port 0 and call it with fetch.",
  ],
  exercise:
    "Make `GET /students` accept `?form=4&search=am&limit=10&offset=0`. Parse and check every query value (400 for `limit=500` or `form=abc`), filter by form and name, and return `{ total, items }`. Keep the logic in pure functions and test them with node:test.",
};

export const postgresWithPg: Lesson = {
  slug: "postgres-with-pg",
  title: "PostgreSQL with node-postgres",
  summary: "Connect with a pool, run parameterised queries with typed rows, and keep related changes atomic with transactions.",
  body: [
    "`pg` (node-postgres) is the standard PostgreSQL driver for Node.js. Create one `Pool` for the whole application: it opens a few connections and lends them to queries, which is much faster than connecting per request. Keep the connection string in an environment variable (`DATABASE_URL`), never in the code, and call `pool.end()` when a script finishes so Node can exit.",
    "Always pass values as parameters (`WHERE form = $1`, then `[form]`). The values travel separately from the SQL text, so a name like `' OR '1'='1` is just text and SQL injection is impossible. `pool.query<Student>(...)` types the rows; TypeScript cannot check that the SQL really returns those columns, so keep queries and their row types close together. Note the conversions: `integer` arrives as a number, but `bigint`, `numeric`, `count()` and `sum()` arrive as strings unless you cast them in SQL.",
    "A transaction groups statements so they all succeed or all fail. It must run on one connection: take a client with `pool.connect()`, run `BEGIN`, your statements and `COMMIT`, and on any error `ROLLBACK`. Always `release()` the client in `finally`. A small `withTransaction` helper keeps this correct everywhere, and CHECK constraints in the schema are your last line of defence: here a payment that would make the balance negative is rolled back completely.",
  ],
  code: [
    {
      filename: "Terminal",
      lang: "bash",
      source: `
npm install pg
npm install --save-dev @types/pg
createdb school_api
psql school_api -f schema.sql
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/school_api"
npx tsx src/main.ts
`,
    },
    {
      filename: "schema.sql",
      lang: "sql",
      source: `
CREATE TABLE students (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL CHECK (length(trim(name)) >= 2),
  form       smallint NOT NULL CHECK (form BETWEEN 1 AND 6),
  balance    integer NOT NULL DEFAULT 0 CHECK (balance >= 0),   -- fees owed, whole shillings
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id integer NOT NULL REFERENCES students(id),
  amount     integer NOT NULL CHECK (amount > 0),
  paid_at    timestamptz NOT NULL DEFAULT now()
);
`,
    },
    {
      filename: "src/db.ts",
      lang: "ts",
      source: `
import pg from "pg";

// One pool for the whole app: it keeps a few connections open and reuses them.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// Run several statements on ONE connection, committing only if all succeed.
export async function withTransaction<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();                     // always give the connection back to the pool
  }
}
`,
    },
    {
      filename: "src/students.ts",
      lang: "ts",
      source: `
import { pool, withTransaction } from "./db";

export interface Student {
  id: number;
  name: string;
  form: number;
  balance: number;
}

// $1, $2 ... are parameters: the values travel separately from the SQL, so no SQL injection.
export async function createStudent(name: string, form: number, balance = 0): Promise<Student> {
  const { rows } = await pool.query<Student>(
    "INSERT INTO students (name, form, balance) VALUES ($1, $2, $3) RETURNING id, name, form, balance",
    [name, form, balance],
  );
  return rows[0];
}

export async function findByForm(form: number): Promise<Student[]> {
  const { rows } = await pool.query<Student>(
    "SELECT id, name, form, balance FROM students WHERE form = $1 ORDER BY name",
    [form],
  );
  return rows;
}

export async function searchByName(text: string): Promise<Student[]> {
  const { rows } = await pool.query<Student>(
    "SELECT id, name, form, balance FROM students WHERE name ILIKE '%' || $1 || '%' ORDER BY name",
    [text],
  );
  return rows;
}

export async function findById(id: number): Promise<Student | undefined> {
  const { rows } = await pool.query<Student>("SELECT id, name, form, balance FROM students WHERE id = $1", [id]);
  return rows[0];
}

// Insert the payment and reduce the balance together, or not at all.
export async function recordPayment(studentId: number, amount: number): Promise<number> {
  return withTransaction(async (client) => {
    await client.query("INSERT INTO payments (student_id, amount) VALUES ($1, $2)", [studentId, amount]);
    const { rows } = await client.query<{ balance: number }>(
      "UPDATE students SET balance = balance - $2 WHERE id = $1 RETURNING balance",
      [studentId, amount],
    );
    if (rows.length === 0) throw new Error(\`student \${studentId} not found\`);
    return rows[0].balance;
  });
}
`,
    },
    {
      filename: "src/main.ts",
      lang: "ts",
      source: `
import { pool } from "./db";
import { createStudent, findById, findByForm, recordPayment, searchByName } from "./students";

const amina = await createStudent("Amina Hassan", 4, 150_000);
await createStudent("Juma Said", 4, 200_000);
console.log(await findByForm(4));

console.log("Balance after paying 50,000:", await recordPayment(amina.id, 50_000));

try {
  await recordPayment(amina.id, 500_000);           // would make the balance negative
} catch (err) {
  // The CHECK constraint failed, so the transaction rolled back the payment row too.
  console.log("Rejected:", (err as Error).message);
}
console.log("Still:", (await findById(amina.id))?.balance);

console.log(await searchByName("jum"));               // [ { id: 2, name: 'Juma Said', ... } ]
// Malicious input is just text when you use parameters: it matches no names.
console.log(await searchByName("' OR '1'='1"));        // []

await pool.end();                                     // let the process exit
`,
    },
  ],
  keyPoints: [
    "One shared `Pool`; connection settings from `DATABASE_URL`.",
    "Parameters (`$1`, `$2`) for every value: no string-building, no SQL injection.",
    "Transactions on a single client with BEGIN/COMMIT/ROLLBACK and `release()` in `finally`.",
  ],
  exercise:
    "Add `paymentSummary(form)` (each student's number of payments, total paid and balance, as numbers, including students with no payments) and `promoteForm(form, nextYearFee)`, which moves a form up one level and adds next year's fee to exactly those students, in one transaction. Show that promoting form 6 rolls back.",
};

export const authentication: Lesson = {
  slug: "authentication-and-authorization",
  title: "Authentication & Authorization",
  summary: "Hash passwords with scrypt, issue and verify JWTs, and protect Express routes with login and role checks.",
  body: [
    "Authentication answers \"who are you?\"; authorization answers \"are you allowed to do this?\". Never store passwords: store a slow, salted hash. Node's built-in `scrypt` is designed to be slow for attackers, a random salt makes identical passwords hash differently, and `timingSafeEqual` compares without leaking timing information. On a failed login, give the same message whether the email or the password was wrong.",
    "After login, the API returns a token the client sends back in `Authorization: Bearer <token>`. A JSON Web Token (JWT) carries claims (the user id in `sub`, the role, an expiry) and a signature made with a server secret, so the server can trust it without a database lookup. The payload is only encoded, not encrypted: anyone can read it, but changing it breaks the signature. Keep tokens short-lived, keep the secret in the environment, and pin the algorithm when verifying.",
    "Middleware applies the rules: `requireAuth` verifies the token and puts the user on `req.user` (a `declare global` block tells TypeScript about it) or answers 401; `requireRole(\"teacher\")` answers 403 for anyone else. Role checks are not enough on their own: a parent may read results, but only their own child's. That is object-level authorization, and it is one of the most common security bugs in real APIs.",
  ],
  code: [
    {
      filename: "Terminal",
      lang: "bash",
      source: `
npm install express jose
npm install --save-dev @types/express
# A long random secret, kept out of the code (e.g. in .env or your host's settings)
export JWT_SECRET="$(node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))')"
npx tsx src/server.ts
`,
    },
    {
      filename: "src/passwords.ts",
      lang: "ts",
      source: `
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

// Never store passwords. Store a slow, salted hash: "salt:hash" in hex.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return \`\${salt.toString("hex")}:\${hash.toString("hex")}\`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);         // constant time: doesn't leak how many bytes matched
}
`,
    },
    {
      filename: "src/tokens.ts",
      lang: "ts",
      source: `
import { SignJWT, jwtVerify } from "jose";

export type Role = "teacher" | "parent" | "student";

export interface AuthUser {
  id: number;
  role: Role;
}

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("1h")                          // short-lived: a stolen token stops working soon
    .sign(secretKey());
}

// Throws if the signature is wrong, the token was changed, or it has expired.
export async function verifyToken(token: string): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
  const role = payload.role;
  if (role !== "teacher" && role !== "parent" && role !== "student") throw new Error("bad role");
  return { id: Number(payload.sub), role };
}
`,
    },
    {
      filename: "src/auth.ts",
      lang: "ts",
      source: `
import type { NextFunction, Request, Response } from "express";
import { type AuthUser, type Role, verifyToken } from "./tokens";

// Teach TypeScript that authenticated requests carry a user.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Authentication: who are you? 401 if we can't tell.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    req.user = await verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Please log in" });
  }
}

// Authorization: are you allowed to do this? 403 if not.
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role)) return next();
    res.status(403).json({ error: "You are not allowed to do that" });
  };
}
`,
    },
    {
      filename: "src/app.ts",
      lang: "ts",
      source: `
import express from "express";
import { requireAuth, requireRole } from "./auth";
import { verifyPassword } from "./passwords";
import { type Role, signToken } from "./tokens";

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: Role;
}

export function createApp(users: User[]) {
  const app = express();
  app.use(express.json());
  const grades: { studentId: number; subject: string; score: number }[] = [];

  app.post("/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    const user = users.find((u) => u.email === String(email).toLowerCase());
    // Same message whether the email or the password was wrong: don't reveal which accounts exist.
    if (!user || typeof password !== "string" || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Wrong email or password" });
    }
    res.json({ token: await signToken({ id: user.id, role: user.role }) });
  });

  app.get("/me", requireAuth, (req, res) => {
    res.json(req.user);
  });

  app.get("/grades", requireAuth, requireRole("teacher"), (_req, res) => {
    res.json(grades);
  });

  app.post("/grades", requireAuth, requireRole("teacher"), (req, res) => {
    const { studentId, subject, score } = req.body ?? {};
    if (!Number.isInteger(studentId) || typeof subject !== "string" || !Number.isInteger(score)) {
      return res.status(400).json({ error: "studentId, subject and score are required" });
    }
    grades.push({ studentId, subject, score });
    res.status(201).json({ studentId, subject, score });
  });

  return app;
}
`,
    },
    {
      filename: "src/server.ts",
      lang: "ts",
      source: `
import { createApp } from "./app";
import { hashPassword } from "./passwords";

// Demo accounts; a real app loads users from the database.
const app = createApp([
  { id: 1, email: "teacher@school.tz", passwordHash: await hashPassword("chalk-and-board-2026"), role: "teacher" },
  { id: 2, email: "amina@school.tz", passwordHash: await hashPassword("photosynthesis!"), role: "student" },
]);
app.listen(3000, () => console.log("API on http://localhost:3000"));
`,
    },
    {
      filename: "test/auth.test.ts",
      lang: "ts",
      source: `
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../src/app";
import { hashPassword, verifyPassword } from "../src/passwords";

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
let server: Server;
let base: string;

before(async () => {
  server = createApp([
    { id: 1, email: "teacher@school.tz", passwordHash: await hashPassword("chalk"), role: "teacher" },
    { id: 2, email: "amina@school.tz", passwordHash: await hashPassword("leaf"), role: "student" },
  ]).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = \`http://localhost:\${(server.address() as AddressInfo).port}\`;
});
after(() => server.close());

async function login(email: string, password: string): Promise<Response> {
  return fetch(\`\${base}/login\`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
}
const auth = (token: string) => ({ Authorization: \`Bearer \${token}\` });

describe("passwords", () => {
  it("hashes with a random salt and verifies", async () => {
    const a = await hashPassword("secret");
    assert.notEqual(a, await hashPassword("secret"));
    assert.equal(await verifyPassword("secret", a), true);
    assert.equal(await verifyPassword("Secret", a), false);
  });
});

describe("login and roles", () => {
  it("rejects a wrong password with 401", async () => {
    assert.equal((await login("teacher@school.tz", "nope")).status, 401);
  });

  it("401 without a token, 403 with the wrong role, 200 for a teacher", async () => {
    assert.equal((await fetch(\`\${base}/grades\`)).status, 401);
    const { token: studentToken } = await (await login("amina@school.tz", "leaf")).json();
    assert.equal((await fetch(\`\${base}/grades\`, { headers: auth(studentToken) })).status, 403);
    const { token: teacherToken } = await (await login("teacher@school.tz", "chalk")).json();
    assert.equal((await fetch(\`\${base}/grades\`, { headers: auth(teacherToken) })).status, 200);
    assert.deepEqual(await (await fetch(\`\${base}/me\`, { headers: auth(teacherToken) })).json(), { id: 1, role: "teacher" });
  });

  it("rejects a token whose payload was edited", async () => {
    const { token } = await (await login("amina@school.tz", "leaf")).json();
    const [header, , signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "2", role: "teacher", exp: 9999999999 })).toString("base64url");
    assert.equal((await fetch(\`\${base}/grades\`, { headers: auth(\`\${header}.\${forged}.\${signature}\`) })).status, 401);
  });
});
`,
    },
  ],
  keyPoints: [
    "Store salted, slow password hashes (scrypt) and compare them with `timingSafeEqual`.",
    "JWTs are signed, not encrypted: short expiry, secret from the environment, algorithm pinned.",
    "401 means \"not logged in\", 403 means \"not allowed\"; check ownership as well as the role.",
  ],
  exercise:
    "Add `GET /students/:id/results`. Teachers can see any student, students only themselves, and parents only the children linked to them in a `families` list. Put the rule in a pure `canViewStudent(user, studentId, families)` function and test every case.",
};

export const cachingAndRateLimiting: Lesson = {
  slug: "caching-and-rate-limiting",
  title: "Caching & Rate Limiting",
  summary: "Speed up repeated reads with a TTL cache and HTTP caching headers, and protect the API with rate limits.",
  body: [
    "Caching keeps the result of slow work so the next request is fast. The common pattern is cache-aside: look in the cache, and on a miss load from the database and store the result with a time-to-live (TTL). Two details matter: when many requests miss at the same moment, load once and share the promise; and when the data changes, delete the cached entry so nobody sees stale results for a whole TTL. An in-memory `Map` works for one server process; with several servers, use a shared store such as Redis.",
    "HTTP has caching built in. `Cache-Control: private, max-age=30` lets the browser reuse a response for 30 seconds without asking. Express adds an `ETag` (a fingerprint of the body) to JSON responses; when the browser revalidates with `If-None-Match`, an unchanged response becomes a tiny `304 Not Modified`.",
    "Rate limiting caps how often one client can call you, which protects against password guessing, scraping and runaway scripts. A fixed window counts requests per key (IP address or user id) per time window and answers `429 Too Many Requests` with a `Retry-After` header when the count is exceeded. Use a strict limit on `/login` and a generous one elsewhere. Behind a proxy or load balancer, set `app.set(\"trust proxy\", 1)` so `req.ip` is the real client address. Passing the clock in as `now()` makes both the cache and the limiter easy to test.",
  ],
  code: [
    {
      filename: "src/cache.ts",
      lang: "ts",
      source: `
type Clock = () => number;

interface Entry<V> {
  value: V;
  expiresAt: number;
}

// A small in-memory cache with a time-to-live. For several servers, use a shared cache such as Redis.
export class TtlCache<V> {
  private entries = new Map<string, Entry<V>>();
  private loading = new Map<string, Promise<V>>();

  constructor(private ttlMs: number, private now: Clock = Date.now) {}

  get(key: string): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  // Cache-aside: return the cached value, or load it ONCE even if many requests ask at the same time.
  async getOrLoad(key: string, load: () => Promise<V>): Promise<V> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const inFlight = this.loading.get(key);
    if (inFlight) return inFlight;

    const promise = load()
      .then((value) => {
        this.set(key, value);
        return value;
      })
      .finally(() => this.loading.delete(key));
    this.loading.set(key, promise);
    return promise;
  }
}
`,
    },
    {
      filename: "src/rateLimit.ts",
      lang: "ts",
      source: `
import type { NextFunction, Request, Response } from "express";

interface Options {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
  now?: () => number;
}

// Fixed window: at most \`max\` requests per key in each window of \`windowMs\`.
export function rateLimit({ windowMs, max, key = (req) => req.ip ?? "unknown", now = Date.now }: Options) {
  const windows = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const k = key(req);
    const t = now();
    let w = windows.get(k);
    if (!w || w.resetAt <= t) {
      w = { count: 0, resetAt: t + windowMs };
      windows.set(k, w);
    }
    w.count++;

    const resetSeconds = Math.ceil((w.resetAt - t) / 1000);
    res.set("RateLimit-Limit", String(max));
    res.set("RateLimit-Remaining", String(Math.max(0, max - w.count)));
    res.set("RateLimit-Reset", String(resetSeconds));

    if (w.count > max) {
      res.set("Retry-After", String(resetSeconds));
      return res.status(429).json({ error: "Too many requests, slow down" });
    }
    next();
  };
}
`,
    },
    {
      filename: "src/app.ts",
      lang: "ts",
      source: `
import express from "express";
import { TtlCache } from "./cache";
import { rateLimit } from "./rateLimit";

export interface Ranking {
  position: number;
  name: string;
  average: number;
}

// \`loadRanking\` stands in for a slow database query.
export function createApp(loadRanking: (form: number) => Promise<Ranking[]>) {
  const app = express();
  app.use(express.json());
  const rankings = new TtlCache<Ranking[]>(60_000);

  app.use("/login", rateLimit({ windowMs: 15 * 60_000, max: 5 }));   // slow down password guessing
  app.use(rateLimit({ windowMs: 60_000, max: 100 }));                 // general limit for everything

  app.get("/forms/:form/ranking", async (req, res) => {
    const form = Number(req.params.form);
    const ranking = await rankings.getOrLoad(\`ranking:\${form}\`, () => loadRanking(form));
    // Browsers may reuse this response for 30 s; Express adds an ETag so later requests can get 304.
    res.set("Cache-Control", "private, max-age=30");
    res.json(ranking);
  });

  app.post("/forms/:form/results", (req, res) => {
    // ...save the result to the database, then drop the stale cached ranking
    rankings.delete(\`ranking:\${Number(req.params.form)}\`);
    res.status(201).json({ saved: true });
  });

  app.post("/login", (_req, res) => {
    res.status(401).json({ error: "Wrong email or password" });
  });

  return app;
}
`,
    },
    {
      filename: "test/cache.test.ts",
      lang: "ts",
      source: `
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp, type Ranking } from "../src/app";
import { TtlCache } from "../src/cache";

describe("TtlCache", () => {
  it("expires entries after the TTL", () => {
    let now = 0;
    const cache = new TtlCache<string>(1000, () => now);
    cache.set("a", "x");
    now = 999;
    assert.equal(cache.get("a"), "x");
    now = 1000;
    assert.equal(cache.get("a"), undefined);
  });

  it("loads once for concurrent requests", async () => {
    const cache = new TtlCache<number>(1000);
    let calls = 0;
    const load = async () => {
      calls++;
      return 42;
    };
    const values = await Promise.all([cache.getOrLoad("k", load), cache.getOrLoad("k", load), cache.getOrLoad("k", load)]);
    assert.deepEqual(values, [42, 42, 42]);
    assert.equal(calls, 1);
  });
});

describe("HTTP caching and limits", () => {
  let server: Server;
  let base: string;
  let queries = 0;
  const ranking: Ranking[] = [{ position: 1, name: "Amina Hassan", average: 83.5 }];

  before(async () => {
    server = createApp(async () => {
      queries++;
      return ranking;
    }).listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    base = \`http://localhost:\${(server.address() as AddressInfo).port}\`;
  });
  after(() => server.close());

  it("serves repeat requests from the cache and answers 304 for a matching ETag", async () => {
    const first = await fetch(\`\${base}/forms/4/ranking\`);
    const etag = first.headers.get("etag")!;
    await fetch(\`\${base}/forms/4/ranking\`);
    assert.equal(queries, 1);
    // What a browser sends when its cached copy is older than max-age:
    const again = await fetch(\`\${base}/forms/4/ranking\`, { headers: { "If-None-Match": etag, "Cache-Control": "max-age=0" } });
    assert.equal(again.status, 304);

    await fetch(\`\${base}/forms/4/results\`, { method: "POST" });   // invalidates
    await fetch(\`\${base}/forms/4/ranking\`);
    assert.equal(queries, 2);
  });

  it("returns 429 with Retry-After after 5 login attempts", async () => {
    const statuses: number[] = [];
    let last: Response | undefined;
    for (let i = 0; i < 6; i++) {
      last = await fetch(\`\${base}/login\`, { method: "POST" });
      statuses.push(last.status);
    }
    assert.deepEqual(statuses, [401, 401, 401, 401, 401, 429]);
    assert.equal(last!.headers.get("retry-after"), "900");
  });
});
`,
    },
  ],
  keyPoints: [
    "Cache-aside with a TTL; share in-flight loads and invalidate when data changes.",
    "`Cache-Control` and ETags let browsers skip or shrink repeat requests.",
    "Rate-limit per key with 429 and `Retry-After`; be strict on login. Inject the clock for tests.",
  ],
  exercise:
    "Implement a token-bucket limiter: each key has a bucket of `capacity` tokens that refills at `refillPerSecond`, and each request spends one. Return whether the request is allowed and how long to wait, wrap it in middleware that limits per user id (or IP when logged out), and test bursts, refills, the capacity cap and separate keys with a fake clock.",
};

export const projectResultsPortal: Lesson = {
  slug: "project-results-portal-api",
  title: "Project: Results Portal API",
  summary: "Put it all together: a PostgreSQL-backed API with validated config, login, roles, parent access, upserts, cached rankings and integration tests.",
  body: [
    "This project combines the advanced lessons into a small but realistic service: teachers record exam results, parents log in to see their own child's results, and teachers get a cached ranking for each form. The code is split by responsibility: `config.ts` validates the environment with Zod at startup, `db.ts` owns the pool, `results.ts` holds every SQL query, and `app.ts` wires HTTP routes to them. `passwords.ts`, `tokens.ts` and `auth.ts` come from the Authentication lesson, and `cache.ts` from the Caching lesson.",
    "Input is validated with Zod schemas at the edge (`Login`, `NewResult`), and the error handler turns a `ZodError` into a 400 listing each problem. Saving a result is an upsert (`ON CONFLICT ... DO UPDATE`), so correcting a mark doesn't create duplicates, and it invalidates the cached ranking for that form and term. The ranking uses `rank()`, so equal averages share a position. Parents asking for someone else's child get 404, so the API doesn't reveal which ids exist.",
    "The tests are integration tests: they seed a real test database, start the app on a free port and log in as each kind of user. They are slower than unit tests, but they prove the SQL, the auth rules and the HTTP layer work together. `server.ts` also handles SIGTERM/SIGINT, finishing open requests and closing the pool, which hosts send when they deploy a new version.",
  ],
  code: [
    {
      filename: "Terminal",
      lang: "bash",
      source: `
mkdir results-portal && cd results-portal && npm init -y && npm pkg set type=module
npm install express pg zod jose
npm install --save-dev typescript tsx @types/node @types/express @types/pg
# Copy passwords.ts, tokens.ts and auth.ts from the Authentication lesson
# and cache.ts from the Caching lesson into src/
createdb results_portal
psql results_portal -f schema.sql
cp .env.example .env            # then edit the values
node --env-file=.env --import tsx src/seed.ts
node --env-file=.env --import tsx src/server.ts
`,
    },
    {
      filename: ".env.example",
      lang: "text",
      source: `
DATABASE_URL=postgres://postgres:postgres@localhost:5432/results_portal
JWT_SECRET=replace-with-64-random-hex-characters-from-crypto-randomBytes
PORT=3000
`,
    },
    {
      filename: "schema.sql",
      lang: "sql",
      source: `
CREATE TABLE users (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  role          text NOT NULL CHECK (role IN ('teacher', 'parent', 'student'))
);

CREATE TABLE students (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name      text NOT NULL,
  form      smallint NOT NULL CHECK (form BETWEEN 1 AND 6),
  parent_id integer REFERENCES users(id)
);

CREATE TABLE results (
  student_id integer NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject    text NOT NULL,
  term       text NOT NULL,
  score      smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
  PRIMARY KEY (student_id, subject, term)
);

CREATE INDEX students_form_idx ON students (form);
CREATE INDEX students_parent_idx ON students (parent_id);
`,
    },
    {
      filename: "src/config.ts",
      lang: "ts",
      source: `
import { z } from "zod";

// Validate the environment once at startup: fail fast with a clear message instead of later at random.
const Env = z.object({
  DATABASE_URL: z.string().startsWith("postgres://"),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().default(3000),
});

export const config = Env.parse(process.env);
`,
    },
    {
      filename: "src/db.ts",
      lang: "ts",
      source: `
import pg from "pg";
import { config } from "./config";

export const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 10 });
`,
    },
    {
      filename: "src/results.ts",
      lang: "ts",
      source: `
import { pool } from "./db";

export interface Result {
  subject: string;
  term: string;
  score: number;
}

export interface RankingRow {
  position: number;
  studentId: number;
  name: string;
  average: number;
}

export async function findUserByEmail(email: string) {
  const { rows } = await pool.query<{ id: number; passwordHash: string; role: "teacher" | "parent" | "student" }>(
    \`SELECT id, password_hash AS "passwordHash", role FROM users WHERE email = $1\`,
    [email.toLowerCase()],
  );
  return rows[0];
}

export async function findStudent(id: number) {
  const { rows } = await pool.query<{ id: number; name: string; form: number; parentId: number | null }>(
    \`SELECT id, name, form, parent_id AS "parentId" FROM students WHERE id = $1\`,
    [id],
  );
  return rows[0];
}

export async function resultsFor(studentId: number): Promise<Result[]> {
  const { rows } = await pool.query<Result>(
    "SELECT subject, term, score FROM results WHERE student_id = $1 ORDER BY term, subject",
    [studentId],
  );
  return rows;
}

// Insert, or replace the score if this student already has one for that subject and term.
export async function saveResult(studentId: number, r: Result): Promise<void> {
  await pool.query(
    \`INSERT INTO results (student_id, subject, term, score) VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id, subject, term) DO UPDATE SET score = EXCLUDED.score\`,
    [studentId, r.subject, r.term, r.score],
  );
}

export async function formRanking(form: number, term: string): Promise<RankingRow[]> {
  const { rows } = await pool.query<RankingRow>(
    \`SELECT rank() OVER (ORDER BY avg(r.score) DESC)::int AS position,
            s.id AS "studentId", s.name,
            round(avg(r.score), 1)::float AS average
       FROM students s JOIN results r ON r.student_id = s.id
      WHERE s.form = $1 AND r.term = $2
      GROUP BY s.id
      ORDER BY position, s.name\`,
    [form, term],
  );
  return rows;
}
`,
    },
    {
      filename: "src/app.ts",
      lang: "ts",
      source: `
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "./auth";
import { TtlCache } from "./cache";
import { verifyPassword } from "./passwords";
import * as db from "./results";
import { signToken, type AuthUser } from "./tokens";

const Login = z.object({ email: z.email(), password: z.string().min(1) });
const NewResult = z.object({
  studentId: z.number().int().positive(),
  subject: z.string().trim().min(2).max(40),
  term: z.string().regex(/^\\d{4}-T[123]$/, "term looks like 2026-T1"),
  score: z.number().int().min(0).max(100),
});
const RankingQuery = z.object({ term: z.string().regex(/^\\d{4}-T[123]$/) });

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function canView(user: AuthUser, studentId: number): Promise<boolean> {
  if (user.role === "teacher") return true;
  const student = await db.findStudent(studentId);
  if (!student) return false;
  return user.role === "parent" ? student.parentId === user.id : false;
}

export function createApp() {
  const app = express();
  app.use(express.json());
  const rankings = new TtlCache<db.RankingRow[]>(60_000);

  app.post("/login", async (req, res) => {
    const { email, password } = Login.parse(req.body);
    const user = await db.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) throw new HttpError(401, "Wrong email or password");
    res.json({ token: await signToken({ id: user.id, role: user.role }) });
  });

  app.get("/students/:id/results", requireAuth, async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    // 404 rather than 403 for strangers, so the API doesn't reveal which ids exist
    if (!(await canView(req.user!, id))) throw new HttpError(404, "Student not found");
    res.json(await db.resultsFor(id));
  });

  app.post("/results", requireAuth, requireRole("teacher"), async (req, res) => {
    const { studentId, ...result } = NewResult.parse(req.body);
    const student = await db.findStudent(studentId);
    if (!student) throw new HttpError(404, "Student not found");
    await db.saveResult(studentId, result);
    rankings.delete(\`\${student.form}:\${result.term}\`);
    res.status(201).json({ studentId, ...result });
  });

  app.get("/forms/:form/ranking", requireAuth, requireRole("teacher"), async (req, res) => {
    const form = z.coerce.number().int().min(1).max(6).parse(req.params.form);
    const { term } = RankingQuery.parse(req.query);
    res.json(await rankings.getOrLoad(\`\${form}:\${term}\`, () => db.formRanking(form, term)));
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", issues: err.issues.map((i) => \`\${i.path.join(".")}: \${i.message}\`) });
    }
    if (err instanceof SyntaxError) return res.status(400).json({ error: "Body must be valid JSON" });
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
`,
    },
    {
      filename: "src/server.ts",
      lang: "ts",
      source: `
import { createApp } from "./app";
import { config } from "./config";
import { pool } from "./db";

const server = createApp().listen(config.PORT, () => console.log(\`Results portal on http://localhost:\${config.PORT}\`));

// Finish in-flight requests and close database connections on shutdown (Ctrl+C, or a deploy).
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
function shutdown() {
  server.close(() => pool.end().then(() => process.exit(0)));
}
`,
    },
    {
      filename: "src/seed.ts",
      lang: "ts",
      source: `
import { pool } from "./db";
import { hashPassword } from "./passwords";

await pool.query("TRUNCATE results, students, users RESTART IDENTITY CASCADE");

const user = async (email: string, password: string, role: string) =>
  (await pool.query<{ id: number }>(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
    [email, await hashPassword(password), role],
  )).rows[0].id;

await user("teacher@school.tz", "chalk-and-board-2026", "teacher");
const mama = await user("mama.amina@example.com", "familia-yetu-2026", "parent");

const students: [string, number, number | null, number, number][] = [
  // name, form, parent, Maths, Biology
  ["Amina Hassan", 4, mama, 88, 79],
  ["Juma Said", 4, null, 29, 48],
  ["Neema Kimaro", 4, null, 71, 84],
  ["Ali Mohamed", 4, null, 95, 60],
];
for (const [name, form, parentId, maths, biology] of students) {
  const { rows } = await pool.query<{ id: number }>(
    "INSERT INTO students (name, form, parent_id) VALUES ($1, $2, $3) RETURNING id",
    [name, form, parentId],
  );
  await pool.query(
    "INSERT INTO results (student_id, subject, term, score) VALUES ($1, 'Maths', '2026-T1', $2), ($1, 'Biology', '2026-T1', $3)",
    [rows[0].id, maths, biology],
  );
}
console.log("Seeded", students.length, "students");
await pool.end();
`,
    },
    {
      filename: "test/api.test.ts",
      lang: "ts",
      source: `
// Runs against a real test database: createdb results_portal_test && psql results_portal_test -f schema.sql
// then: node --env-file=.env.test --import tsx --test test/*.test.ts
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../src/app";
import { pool } from "../src/db";

let server: Server;
let base: string;

before(async () => {
  execFileSync(process.execPath, ["--import", "tsx", "src/seed.ts"], { stdio: "ignore" });   // known data
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = \`http://localhost:\${(server.address() as AddressInfo).port}\`;
});
after(async () => {
  server.close();
  await pool.end();
});

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(\`\${base}/login\`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
  });
  return (await res.json()).token;
}
const get = (path: string, token: string) => fetch(base + path, { headers: { Authorization: \`Bearer \${token}\` } });

describe("results portal", () => {
  it("lets a parent see only their own child", async () => {
    const token = await login("mama.amina@example.com", "familia-yetu-2026");
    const own = await get("/students/1/results", token);
    assert.deepEqual(await own.json(), [
      { subject: "Biology", term: "2026-T1", score: 79 },
      { subject: "Maths", term: "2026-T1", score: 88 },
    ]);
    assert.equal((await get("/students/2/results", token)).status, 404);
    assert.equal((await get("/forms/4/ranking?term=2026-T1", token)).status, 403);
  });

  it("ranks a form and refreshes after a new result", async () => {
    const token = await login("teacher@school.tz", "chalk-and-board-2026");
    const before = await (await get("/forms/4/ranking?term=2026-T1", token)).json();
    assert.deepEqual(before.map((r: { name: string; position: number }) => [r.position, r.name]), [
      [1, "Amina Hassan"], [2, "Ali Mohamed"], [2, "Neema Kimaro"], [4, "Juma Said"],
    ]);

    const saved = await fetch(\`\${base}/results\`, {
      method: "POST",
      headers: { Authorization: \`Bearer \${token}\`, "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: 2, subject: "Maths", term: "2026-T1", score: 99 }),
    });
    assert.equal(saved.status, 201);
    const afterSave = await (await get("/forms/4/ranking?term=2026-T1", token)).json();
    assert.equal(afterSave.find((r: { name: string }) => r.name === "Juma Said").average, 73.5);
  });

  it("explains invalid input", async () => {
    const token = await login("teacher@school.tz", "chalk-and-board-2026");
    const res = await fetch(\`\${base}/results\`, {
      method: "POST",
      headers: { Authorization: \`Bearer \${token}\`, "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: 1, subject: "Maths", term: "Term 1", score: 120 }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.deepEqual(body.issues, ["term: term looks like 2026-T1", "score: Too big: expected number to be <=100"]);
  });
});
`,
    },
  ],
  keyPoints: [
    "Separate config, database access, SQL queries and HTTP routes; validate config and input with Zod.",
    "Upserts for corrections, `rank()` for fair positions, cache invalidation on every write.",
    "Integration tests against a seeded test database prove the whole stack works together.",
  ],
  exercise:
    "Add `GET /students/:id/report?term=2026-T1` for teachers and parents: the student's name, each subject with its score and grade (A ≥ 75, B ≥ 65, C ≥ 45, D ≥ 30, otherwise F), their average and their position such as \"2 of 4\". Reuse the cached ranking, keep the report-building logic in a pure, unit-tested function, and add an integration test.",
};
