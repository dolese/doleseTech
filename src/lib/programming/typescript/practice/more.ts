import type { Practice } from "../../types";

export const textAndDates: Practice = {
  solution: {
    notes: [
      "`initials` splits on any whitespace, so double spaces don't create empty parts. `maskPhone` first strips everything that isn't a digit with `replace(/\\D/g, \"\")`, then refuses anything that isn't exactly 10 digits rather than printing nonsense. `ageOn` works on the ISO parts directly and subtracts a year if this year's birthday hasn't happened yet, which avoids time-zone surprises entirely.",
    ],
    code: [
      {
        filename: "report.ts",
        lang: "ts",
        source: `
interface Student {
  name: string;
  phone: string;
  born: string;          // ISO date, e.g. "2008-03-14"
}

export function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\\s+/)
    .map((part) => part[0].toUpperCase() + ".")
    .join("");
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\\D/g, "");
  if (digits.length !== 10) throw new Error(\`expected 10 digits, got "\${phone}"\`);
  return \`\${digits.slice(0, 4)}***\${digits.slice(-3)}\`;
}

export function ageOn(bornIso: string, onIso: string): number {
  const [by, bm, bd] = bornIso.split("-").map(Number);
  const [y, m, d] = onIso.split("-").map(Number);
  const hadBirthday = m > bm || (m === bm && d >= bd);
  return y - by - (hadBirthday ? 0 : 1);
}

const students: Student[] = [
  { name: "amina hassan", phone: "0712 345 678", born: "2008-03-14" },
  { name: "Juma  Said", phone: "0754-000-111", born: "2009-11-30" },
  { name: "neema kimaro", phone: "0688222333", born: "2008-12-01" },
];

const today = "2026-10-05";
console.log(\`\${"Initials".padEnd(10)}\${"Phone".padEnd(13)}\${"Age".padStart(4)}\`);
for (const s of students) {
  console.log(\`\${initials(s.name).padEnd(10)}\${maskPhone(s.phone).padEnd(13)}\${String(ageOn(s.born, today)).padStart(4)}\`);
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "What does `\"  Juma  \".trim()` do to the original string?",
      options: [
        "Changes it to \"Juma\"",
        "Nothing: it returns a new string \"Juma\"",
        "Removes only the leading spaces",
        "Throws, because strings are constant",
      ],
      answer: 1,
      explanation: "Strings are immutable; every string method returns a new value.",
    },
    {
      question: "A variable has the template literal type `Term ${1 | 2 | 3}`. Which value is a compile error?",
      options: ["\"Term 1\"", "\"Term 3\"", "\"Term 4\"", "\"Term 2\""],
      answer: 2,
      explanation: "The template literal type allows only the three listed numbers.",
    },
    {
      question: "Why does `parseDayMonthYear(\"31/02/2008\")` check `getUTCDate()` after building the date?",
      options: [
        "Date rolls invalid days over (31 February becomes 2 March), so the check catches it",
        "To convert the date to UTC",
        "Because months are 1-based",
        "It is required by TypeScript",
      ],
      answer: 0,
      explanation: "If the day changed, the input wasn't a real calendar date.",
    },
    {
      question: "How do you print a time in East Africa Time on a server running in UTC?",
      options: [
        "Add 3 to `getHours()`",
        "Set `process.env.TZ` inside each function",
        "Use `toISOString()`",
        "Format with `Intl.DateTimeFormat` and `timeZone: \"Africa/Dar_es_Salaam\"`",
      ],
      answer: 3,
      explanation: "The Date is the same moment; the formatter converts it for display.",
    },
  ],
};

export const restApiExpress: Practice = {
  solution: {
    notes: [
      "Query-string values are always strings (or arrays of strings when a key repeats), so `parseListQuery` converts each one, checks its range and throws the lesson's `HttpError(400)`, which the error middleware already turns into JSON. Filtering and paging are a pure function, so most tests need no server at all. `total` counts every match before paging, so a client can show \"page 2 of 5\".",
    ],
    code: [
      {
        filename: "src/list.ts",
        lang: "ts",
        source: `
import { HttpError, type Student } from "./app";

export interface ListQuery {
  form?: number;
  search?: string;
  limit: number;
  offset: number;
}

// req.query values are strings (or arrays of strings), so convert and check each one.
export function parseListQuery(query: Record<string, unknown>): ListQuery {
  const int = (key: string, fallback: number, min: number, max: number): number => {
    const raw = query[key];
    if (raw === undefined) return fallback;
    const n = Number(raw);
    if (typeof raw !== "string" || !Number.isInteger(n) || n < min || n > max) {
      throw new HttpError(400, \`\${key} must be a whole number from \${min} to \${max}\`);
    }
    return n;
  };
  return {
    form: query.form === undefined ? undefined : int("form", 0, 1, 6),
    search: typeof query.search === "string" && query.search.trim() !== "" ? query.search.trim().toLowerCase() : undefined,
    limit: int("limit", 20, 1, 100),
    offset: int("offset", 0, 0, Number.MAX_SAFE_INTEGER),
  };
}

export function listStudents(students: Student[], q: ListQuery): { total: number; items: Student[] } {
  const matches = students.filter(
    (s) => (q.form === undefined || s.form === q.form) && (q.search === undefined || s.name.toLowerCase().includes(q.search)),
  );
  return { total: matches.length, items: matches.slice(q.offset, q.offset + q.limit) };
}

// In app.ts, replace the GET /students route with:
//   app.get("/students", (req, res) => {
//     res.json(listStudents(students, parseListQuery(req.query as Record<string, unknown>)));
//   });
`,
      },
      {
        filename: "test/list.test.ts",
        lang: "ts",
        source: `
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { listStudents, parseListQuery } from "../src/list";

const students = [
  { id: 1, name: "Amina Hassan", form: 4 },
  { id: 2, name: "Juma Said", form: 3 },
  { id: 3, name: "Ali Mohamed", form: 4 },
  { id: 4, name: "Neema Kimaro", form: 4 },
];

describe("parseListQuery", () => {
  it("uses defaults", () => {
    assert.deepEqual(parseListQuery({}), { form: undefined, search: undefined, limit: 20, offset: 0 });
  });

  it("rejects bad numbers with a 400 HttpError", () => {
    assert.throws(() => parseListQuery({ limit: "500" }), { status: 400, message: /limit must be/ });
    assert.throws(() => parseListQuery({ form: "abc" }), { status: 400 });
    assert.throws(() => parseListQuery({ offset: ["1", "2"] }), { status: 400 });   // ?offset=1&offset=2
  });
});

describe("listStudents", () => {
  it("filters by form and search, then pages", () => {
    const q = parseListQuery({ form: "4", search: "am", limit: "1", offset: "1" });
    assert.deepEqual(listStudents(students, q), { total: 2, items: [{ id: 3, name: "Ali Mohamed", form: 4 }] });
  });
});
`,
      },
    ],
  },
  quiz: [
    {
      question: "Which status code should a successful `POST /students` return?",
      options: ["200 OK", "204 No Content", "201 Created", "302 Found"],
      answer: 2,
      explanation: "201 says a resource was created; add a `Location` header pointing to it.",
    },
    {
      question: "How does Express recognise error-handling middleware?",
      options: [
        "It is named `errorHandler`",
        "It has four parameters: (err, req, res, next)",
        "It is registered with `app.error()`",
        "It must be the first `app.use` call",
      ],
      answer: 1,
      explanation: "Express checks the function's arity; register it after all routes.",
    },
    {
      question: "Why does `createApp()` return the app instead of calling `listen` itself?",
      options: [
        "Tests can start it on a free port (or several copies) without side effects",
        "Express requires it",
        "It makes the app faster",
        "So it can use HTTPS",
      ],
      answer: 0,
      explanation: "Separating creation from listening makes the app easy to test and reuse.",
    },
    {
      question: "What type does `req.query.limit` have before you convert it?",
      options: ["number", "number | undefined", "boolean", "A string, an array of strings, or undefined (untrusted input)"],
      answer: 3,
      explanation: "Everything in the URL is text, and `?limit=1&limit=2` produces an array.",
    },
  ],
};

export const postgresWithPg: Practice = {
  solution: {
    notes: [
      "`count()` and `sum()` return `bigint`/`numeric`, which pg returns as strings, so the query casts them with `::int` to get numbers (safe here because the values are small). `LEFT JOIN` plus `coalesce` keeps students with no payments. `promoteForm` collects the ids it promoted with `RETURNING id` and charges exactly those, passing the JavaScript array as a PostgreSQL array (`= ANY($1)`); students already in the next form are untouched. Form 7 breaks the CHECK constraint, so the whole transaction rolls back.",
    ],
    code: [
      {
        filename: "src/reports.ts",
        lang: "ts",
        source: `
import { pool, withTransaction } from "./db";

export interface PaymentSummary {
  name: string;
  payments: number;
  totalPaid: number;
  balance: number;
}

// count() and sum() return bigint/numeric, which pg gives you as STRINGS
// (they can exceed JavaScript's safe integer range). Cast in SQL when the values are small.
export async function paymentSummary(form: number): Promise<PaymentSummary[]> {
  const { rows } = await pool.query<PaymentSummary>(
    \`SELECT s.name,
            count(p.id)::int                 AS payments,
            coalesce(sum(p.amount), 0)::int  AS "totalPaid",
            s.balance
       FROM students s
       LEFT JOIN payments p ON p.student_id = s.id
      WHERE s.form = $1
      GROUP BY s.id
      ORDER BY s.name\`,
    [form],
  );
  return rows;
}

// Move every student in a form up one form and add next year's fees: both changes or neither.
export async function promoteForm(form: number, nextYearFee: number): Promise<number> {
  return withTransaction(async (client) => {
    const { rows } = await client.query<{ id: number }>(
      "UPDATE students SET form = form + 1 WHERE form = $1 RETURNING id",
      [form],
    );
    const ids = rows.map((r) => r.id);
    // A JavaScript array becomes a PostgreSQL array parameter: = ANY($1)
    await client.query("UPDATE students SET balance = balance + $2 WHERE id = ANY($1)", [ids, nextYearFee]);
    return ids.length;
  });
}
`,
      },
      {
        filename: "src/main.ts",
        lang: "ts",
        source: `
import { pool } from "./db";
import { paymentSummary, promoteForm } from "./reports";
import { createStudent, findByForm, recordPayment } from "./students";

const neema = await createStudent("Neema Kimaro", 6, 90_000);
await recordPayment(neema.id, 30_000);
await recordPayment(neema.id, 20_000);
await createStudent("Ali Mohamed", 6, 120_000);
await createStudent("Rehema Mollel", 5, 10_000);       // already in form 5: must not be charged again
console.log(await paymentSummary(6));

try {
  await promoteForm(6, 150_000);                     // form 7 breaks the CHECK constraint
} catch (err) {
  console.log("Rolled back:", (err as Error).message);
}
console.log("Still in form 6:", (await findByForm(6)).length);

console.log("Promoted from form 4:", await promoteForm(4, 150_000));
console.log(await findByForm(5));
await pool.end();
`,
      },
    ],
  },
  quiz: [
    {
      question: "Why use `WHERE name = $1` with `[name]` instead of building the SQL with a template string?",
      options: [
        "It's shorter",
        "Values are sent separately from the SQL, so input can never change the query (no SQL injection)",
        "Template strings don't work with pg",
        "It returns typed rows",
      ],
      answer: 1,
      explanation: "Parameterised queries are the fix for SQL injection.",
    },
    {
      question: "What JavaScript type does pg return for `SELECT count(*) FROM students`?",
      options: ["number", "bigint", "boolean", "string"],
      answer: 3,
      explanation: "count() is a bigint, returned as a string to avoid losing precision; cast with `::int` or convert.",
    },
    {
      question: "Why must a transaction use one client from `pool.connect()` rather than `pool.query`?",
      options: [
        "BEGIN, the statements and COMMIT must run on the same connection",
        "pool.query can't run UPDATE",
        "It's faster",
        "pool.query is deprecated",
      ],
      answer: 0,
      explanation: "Each `pool.query` may use a different connection, which would not be in your transaction.",
    },
    {
      question: "What happens if you forget `client.release()`?",
      options: [
        "Nothing",
        "The transaction commits twice",
        "The connection is never returned, and the pool eventually runs out and hangs",
        "PostgreSQL restarts",
      ],
      answer: 2,
      explanation: "Always release in `finally` so errors can't leak connections.",
    },
  ],
};

export const authentication: Practice = {
  solution: {
    notes: [
      "The rule lives in one pure function, so every case is a one-line test, and the `switch` over the `Role` union means TypeScript will complain if a new role is added without a rule. The route calls it after `requireAuth`: the token proves who the user is, and `canViewStudent` decides whether that user may see this particular student.",
    ],
    code: [
      {
        filename: "src/access.ts",
        lang: "ts",
        source: `
import type { AuthUser } from "./tokens";

export interface Family {
  parentId: number;
  studentIds: number[];
}

// Object-level authorization: the role alone isn't enough, the user must be linked to THIS student.
export function canViewStudent(user: AuthUser, studentId: number, families: Family[]): boolean {
  switch (user.role) {
    case "teacher":
      return true;
    case "student":
      return user.id === studentId;
    case "parent":
      return families.some((f) => f.parentId === user.id && f.studentIds.includes(studentId));
  }
}

// In createApp (app.ts), with \`families: Family[]\` passed in next to \`users\`:
//
//   app.get("/students/:id/results", requireAuth, (req, res) => {
//     const studentId = Number(req.params.id);
//     if (!canViewStudent(req.user!, studentId, families)) {
//       return res.status(403).json({ error: "You can only see your own family's results" });
//     }
//     res.json(grades.filter((g) => g.studentId === studentId));
//   });
`,
      },
      {
        filename: "test/access.test.ts",
        lang: "ts",
        source: `
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canViewStudent, type Family } from "../src/access";

const families: Family[] = [{ parentId: 10, studentIds: [2, 3] }];

describe("canViewStudent", () => {
  it("lets teachers see everyone", () => {
    assert.equal(canViewStudent({ id: 1, role: "teacher" }, 99, families), true);
  });

  it("lets students see only themselves", () => {
    assert.equal(canViewStudent({ id: 2, role: "student" }, 2, families), true);
    assert.equal(canViewStudent({ id: 2, role: "student" }, 3, families), false);
  });

  it("lets parents see only their own children", () => {
    assert.equal(canViewStudent({ id: 10, role: "parent" }, 3, families), true);
    assert.equal(canViewStudent({ id: 10, role: "parent" }, 4, families), false);
    assert.equal(canViewStudent({ id: 11, role: "parent" }, 2, families), false);
  });
});
`,
      },
    ],
  },
  quiz: [
    {
      question: "How should passwords be stored?",
      options: [
        "Encrypted with a key in the code",
        "As a slow, salted hash such as scrypt",
        "In plain text in a protected table",
        "Base64-encoded",
      ],
      answer: 1,
      explanation: "A hash can't be reversed; salt and slowness defeat precomputed and brute-force attacks.",
    },
    {
      question: "Can a user read the contents of their JWT?",
      options: [
        "No, it is encrypted",
        "Only with the server secret",
        "Only in a browser",
        "Yes: the payload is just base64url-encoded; the signature only prevents changes",
      ],
      answer: 3,
      explanation: "Never put secrets in a JWT payload.",
    },
    {
      question: "A logged-in student calls a teacher-only route. Which status fits?",
      options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "500"],
      answer: 1,
      explanation: "401 means not authenticated; 403 means authenticated but not allowed.",
    },
    {
      question: "Why does the login route give the same error for a wrong email and a wrong password?",
      options: [
        "To avoid revealing which email addresses have accounts",
        "It's simpler to code",
        "HTTP requires it",
        "To make tokens shorter",
      ],
      answer: 0,
      explanation: "Different messages let attackers discover valid accounts.",
    },
  ],
};

export const cachingAndRateLimiting: Practice = {
  solution: {
    notes: [
      "Instead of storing a timer per bucket, each bucket remembers when it was last updated and adds `elapsed × refillPerSecond` tokens when it is next used, capped at the capacity. That makes the limiter cheap and lets a fake clock drive the tests. A burst of `capacity` requests is allowed after a quiet period, then requests are spaced by the refill rate, which avoids the fixed window's double burst at the window edge.",
    ],
    code: [
      {
        filename: "src/tokenBucket.ts",
        lang: "ts",
        source: `
import type { NextFunction, Request, Response } from "express";

interface Bucket {
  tokens: number;
  updatedAt: number;
}

// Each key gets a bucket of \`capacity\` tokens that refills steadily. A request spends one token.
// Unlike a fixed window, this allows short bursts but no "double burst" at a window boundary.
export class TokenBucket {
  private buckets = new Map<string, Bucket>();

  constructor(
    private capacity: number,
    private refillPerSecond: number,
    private now: () => number = Date.now,
  ) {}

  take(key: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const t = this.now();
    const b = this.buckets.get(key) ?? { tokens: this.capacity, updatedAt: t };
    const elapsed = (t - b.updatedAt) / 1000;
    b.tokens = Math.min(this.capacity, b.tokens + elapsed * this.refillPerSecond);
    b.updatedAt = t;
    this.buckets.set(key, b);

    if (b.tokens >= 1) {
      b.tokens -= 1;
      return { allowed: true, remaining: Math.floor(b.tokens), retryAfterMs: 0 };
    }
    const retryAfterMs = Math.ceil(((1 - b.tokens) / this.refillPerSecond) * 1000);
    return { allowed: false, remaining: 0, retryAfterMs };
  }
}

// Limit per logged-in user when there is one, otherwise per IP address.
export function tokenBucketLimit(bucket: TokenBucket) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as Request & { user?: { id: number } }).user?.id;
    const result = bucket.take(userId !== undefined ? \`user:\${userId}\` : \`ip:\${req.ip}\`);
    res.set("RateLimit-Remaining", String(result.remaining));
    if (result.allowed) return next();
    res.set("Retry-After", String(Math.ceil(result.retryAfterMs / 1000)));
    res.status(429).json({ error: "Too many requests, slow down" });
  };
}
`,
      },
      {
        filename: "test/tokenBucket.test.ts",
        lang: "ts",
        source: `
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TokenBucket } from "../src/tokenBucket";

describe("TokenBucket", () => {
  it("allows a burst up to capacity, then refuses", () => {
    const bucket = new TokenBucket(3, 1, () => 0);
    const results = [1, 2, 3, 4].map(() => bucket.take("amina").allowed);
    assert.deepEqual(results, [true, true, true, false]);
  });

  it("refills over time and says when to retry", () => {
    let now = 0;
    const bucket = new TokenBucket(2, 0.5, () => now);   // one token every 2 seconds
    bucket.take("juma");
    bucket.take("juma");
    assert.equal(bucket.take("juma").retryAfterMs, 2000);
    now = 2000;
    assert.equal(bucket.take("juma").allowed, true);
    assert.equal(bucket.take("juma").allowed, false);
  });

  it("never stores more than its capacity", () => {
    let now = 0;
    const bucket = new TokenBucket(2, 1, () => now);
    now = 60_000;                                         // a long quiet minute
    const results = [1, 2, 3].map(() => bucket.take("neema").allowed);
    assert.deepEqual(results, [true, true, false]);
  });

  it("keeps separate buckets per key", () => {
    const bucket = new TokenBucket(1, 1, () => 0);
    assert.equal(bucket.take("user:1").allowed, true);
    assert.equal(bucket.take("user:2").allowed, true);
    assert.equal(bucket.take("user:1").allowed, false);
  });
});
`,
      },
    ],
  },
  quiz: [
    {
      question: "After saving a new result, what should happen to the cached ranking for that form?",
      options: [
        "Nothing; it expires eventually",
        "Delete (invalidate) it so the next request reloads fresh data",
        "Restart the server",
        "Double its TTL",
      ],
      answer: 1,
      explanation: "Invalidating on write keeps users from seeing stale data for a whole TTL.",
    },
    {
      question: "Why does `getOrLoad` store the in-flight promise?",
      options: [
        "So 50 simultaneous misses trigger one database query, not 50",
        "Promises can't be cached otherwise",
        "To make the TTL longer",
        "To handle errors",
      ],
      answer: 0,
      explanation: "Sharing the pending load prevents a stampede on the database.",
    },
    {
      question: "What does a `304 Not Modified` response mean?",
      options: [
        "The resource was deleted",
        "The server is rate-limiting you",
        "Your cached copy (matching ETag) is still valid; no body is sent",
        "The request needs authentication",
      ],
      answer: 2,
      explanation: "The browser reuses its copy, saving bandwidth.",
    },
    {
      question: "Which response tells a client it has made too many requests?",
      options: ["400 with a message", "403 Forbidden", "503 with no headers", "429 with a Retry-After header"],
      answer: 3,
      explanation: "429 Too Many Requests, and Retry-After says when to try again.",
    },
  ],
};

export const projectResultsPortal: Practice = {
  solution: {
    notes: [
      "`buildReport` is pure: it receives the student, their results and the form ranking and does no I/O, so its unit tests need no database. The route reuses the same cached ranking as `/forms/:form/ranking` and the same `canView` rule as `/results`, so parents can only open their own child's report. Positions come straight from the SQL `rank()`, so a tie shows as \"2 of 4\" for both students.",
    ],
    code: [
      {
        filename: "src/report.ts",
        lang: "ts",
        source: `
import type { RankingRow, Result } from "./results";

export type Grade = "A" | "B" | "C" | "D" | "F";

export function grade(score: number): Grade {
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "F";
}

export interface TermReport {
  name: string;
  term: string;
  subjects: { subject: string; score: number; grade: Grade }[];
  average: number | null;
  position: string | null;          // e.g. "2 of 4"
}

// Pure function: easy to unit-test without a database or server.
export function buildReport(
  student: { id: number; name: string },
  term: string,
  results: Result[],
  ranking: RankingRow[],
): TermReport {
  const subjects = results
    .filter((r) => r.term === term)
    .map((r) => ({ subject: r.subject, score: r.score, grade: grade(r.score) }));
  const row = ranking.find((r) => r.studentId === student.id);
  return {
    name: student.name,
    term,
    subjects,
    average: row?.average ?? null,
    position: row ? \`\${row.position} of \${ranking.length}\` : null,
  };
}

// In app.ts:
//
//   app.get("/students/:id/report", requireAuth, async (req, res) => {
//     const id = z.coerce.number().int().positive().parse(req.params.id);
//     const { term } = RankingQuery.parse(req.query);
//     if (!(await canView(req.user!, id))) throw new HttpError(404, "Student not found");
//     const student = (await db.findStudent(id))!;
//     const ranking = await rankings.getOrLoad(\`\${student.form}:\${term}\`, () => db.formRanking(student.form, term));
//     res.json(buildReport(student, term, await db.resultsFor(id), ranking));
//   });
`,
      },
      {
        filename: "test/report.test.ts",
        lang: "ts",
        source: `
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildReport, grade } from "../src/report";

describe("grade", () => {
  it("follows the school scale at each boundary", () => {
    assert.deepEqual([75, 74, 65, 64, 45, 44, 30, 29].map(grade), ["A", "B", "B", "C", "C", "D", "D", "F"]);
  });
});

describe("buildReport", () => {
  const ranking = [
    { position: 1, studentId: 1, name: "Amina Hassan", average: 83.5 },
    { position: 2, studentId: 3, name: "Ali Mohamed", average: 77.5 },
    { position: 2, studentId: 4, name: "Neema Kimaro", average: 77.5 },
  ];

  it("keeps only the requested term and shows the position", () => {
    const report = buildReport({ id: 3, name: "Ali Mohamed" }, "2026-T1", [
      { subject: "Biology", term: "2026-T1", score: 60 },
      { subject: "Maths", term: "2026-T1", score: 95 },
      { subject: "Maths", term: "2025-T3", score: 40 },
    ], ranking);
    assert.deepEqual(report, {
      name: "Ali Mohamed",
      term: "2026-T1",
      subjects: [
        { subject: "Biology", score: 60, grade: "C" },
        { subject: "Maths", score: 95, grade: "A" },
      ],
      average: 77.5,
      position: "2 of 3",
    });
  });

  it("handles a student with no results that term", () => {
    const report = buildReport({ id: 9, name: "New Student" }, "2026-T1", [], ranking);
    assert.equal(report.average, null);
    assert.equal(report.position, null);
    assert.deepEqual(report.subjects, []);
  });
});
`,
      },
    ],
  },
  quiz: [
    {
      question: "Why validate environment variables with Zod in `config.ts`?",
      options: [
        "Zod makes the variables secret",
        "The app fails fast at startup with a clear message instead of failing later on a request",
        "Node can't read environment variables otherwise",
        "It encrypts DATABASE_URL",
      ],
      answer: 1,
      explanation: "A missing or short JWT_SECRET should stop the server before it accepts traffic.",
    },
    {
      question: "What does `ON CONFLICT (student_id, subject, term) DO UPDATE` give the API?",
      options: [
        "Faster inserts",
        "Duplicate rows for history",
        "Correcting a mark updates the existing row instead of failing or duplicating",
        "Automatic cache invalidation",
      ],
      answer: 2,
      explanation: "An upsert makes saving a result idempotent.",
    },
    {
      question: "With averages 83.5, 77.5, 77.5 and 38.5, what positions does `rank()` give?",
      options: ["1, 2, 2, 4", "1, 2, 3, 4", "1, 2, 2, 3", "1, 1, 2, 3"],
      answer: 0,
      explanation: "rank() shares a position on ties and skips the next one; dense_rank() would give 3.",
    },
    {
      question: "What do the integration tests prove that unit tests don't?",
      options: [
        "That the code is fast",
        "That TypeScript types are correct",
        "Nothing extra",
        "That the SQL, auth rules and HTTP routes work together against a real database",
      ],
      answer: 3,
      explanation: "They exercise the whole stack exactly as a client would.",
    },
  ],
};
