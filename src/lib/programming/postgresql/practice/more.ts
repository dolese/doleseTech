import type { Practice } from "../../types";

export const datesAndCase: Practice = {
  solution: {
    notes: [
      "`age(date '2027-01-01', birth_date)` gives the span up to that day, and `date_part('year', ...)` keeps the whole years. The second query computes the label in a subquery, then groups by it.",
    ],
    code: [
      {
        filename: "dates-solution.sql",
        lang: "sql",
        source: `
SELECT full_name,
       date_part('year', age(date '2027-01-01', birth_date))::int AS age_on_1_jan_2027
FROM students
WHERE birth_date IS NOT NULL
ORDER BY birth_date;

SELECT band, count(*) AS students
FROM (
    SELECT CASE WHEN form <= 2 THEN 'Form 1-2' ELSE 'Form 3-4' END AS band
    FROM students
) AS labelled
GROUP BY band
ORDER BY band;
`,
      },
    ],
  },
  quiz: [
    {
      question: "What does `date '2026-12-01' - date '2026-03-14'` return?",
      options: ["An interval of months", "The number of days between the dates", "A timestamp", "An error"],
      answer: 1,
      explanation: "Subtracting two `date` values gives an integer number of days (262 here).",
    },
    {
      question: "Which function rounds a timestamp down to the first day of its month?",
      options: ["`date_trunc('month', ts)`", "`extract(month FROM ts)`", "`to_char(ts, 'MM')`", "`round(ts)`"],
      answer: 0,
      explanation: "`date_trunc` is ideal for grouping by month; `extract` returns just the month number.",
    },
    {
      question: "What does a `CASE` expression return when no `WHEN` matches and there is no `ELSE`?",
      options: ["0", "An error", "An empty string", "NULL"],
      answer: 3,
      explanation: "Without ELSE, unmatched rows get NULL — add an ELSE when you need a default.",
    },
    {
      question: "Which formats a date like '14 Mar 2026'?",
      options: ["`format(d)`", "`d::text`", "`to_char(d, 'DD Mon YYYY')`", "`date_part('day', d)`"],
      answer: 2,
      explanation: "`to_char` takes a pattern: DD day, Mon short month name, YYYY year.",
    },
  ],
};

export const designAndNormalisation: Practice = {
  solution: {
    notes: [
      "Books get their own table (title and author stored once), and each loan is a row linking a student to a book, with its own dates. A CHECK makes sure a book can't be returned before it was borrowed.",
    ],
    code: [
      {
        filename: "loans-solution.sql",
        lang: "sql",
        source: `
CREATE TABLE book_loans_raw (
    student_name text, student_form smallint, book_title text, book_author text,
    borrowed_on date, returned_on date
);
INSERT INTO book_loans_raw VALUES
    ('Amina Hassan', 4, 'Things Fall Apart', 'Chinua Achebe',   '2026-02-02', '2026-02-16'),
    ('Juma Said',    4, 'Things Fall Apart', 'Chinua Achebe',   '2026-02-20', NULL),
    ('Amina Hassan', 4, 'Kinjeketile',       'Ebrahim Hussein', '2026-03-01', NULL);

CREATE TABLE books (
    id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title  text NOT NULL,
    author text NOT NULL,
    UNIQUE (title, author)
);

CREATE TABLE loans (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id  bigint NOT NULL REFERENCES students (id),
    book_id     bigint NOT NULL REFERENCES books (id),
    borrowed_on date   NOT NULL,
    returned_on date,
    CHECK (returned_on IS NULL OR returned_on >= borrowed_on)
);

INSERT INTO books (title, author)
SELECT DISTINCT book_title, book_author FROM book_loans_raw;

INSERT INTO loans (student_id, book_id, borrowed_on, returned_on)
SELECT s.id, b.id, r.borrowed_on, r.returned_on
FROM book_loans_raw r
JOIN students s ON s.full_name = r.student_name
JOIN books b    ON b.title = r.book_title AND b.author = r.book_author;

-- Books currently out, and who has them
SELECT b.title, s.full_name, l.borrowed_on
FROM loans l
JOIN books b    ON b.id = l.book_id
JOIN students s ON s.id = l.student_id
WHERE l.returned_on IS NULL
ORDER BY l.borrowed_on;
`,
      },
    ],
  },
  quiz: [
    {
      question: "What problem does storing a teacher's phone on every club-member row cause?",
      options: [
        "Queries become impossible",
        "Update anomalies: changing the phone in one row leaves the other copies wrong",
        "PostgreSQL rejects repeated values",
        "None — it's best practice",
      ],
      answer: 1,
      explanation: "Each fact should live in one place so it can only have one value.",
    },
    {
      question: "How do you model \"students can join many clubs, and clubs have many students\"?",
      options: [
        "A comma-separated list of clubs in the students table",
        "A `club_ids` column in students",
        "A junction table with (student_id, club_id) foreign keys",
        "One table per club",
      ],
      answer: 2,
      explanation: "Many-to-many relationships need a junction table of key pairs.",
    },
    {
      question: "Which breaks first normal form?",
      options: [
        "A `subjects` column holding 'Maths, Biology, English'",
        "A `full_name text` column",
        "A primary key on `id`",
        "A foreign key to `students`",
      ],
      answer: 0,
      explanation: "First normal form means one value per cell, not lists packed into text.",
    },
    {
      question: "When is denormalising (deliberately repeating data) reasonable?",
      options: [
        "Always, it's simpler",
        "Before designing the schema",
        "Never",
        "After measuring a real performance need, ideally via a materialized view or cache",
      ],
      answer: 3,
      explanation: "Normalise first; add carefully maintained shortcuts only when measurements justify them.",
    },
  ],
};

export const upserts: Practice = {
  solution: {
    notes: [
      "The first run inserts the row with 1; every later run hits the primary-key conflict and adds 1 to the stored count. `daily_attendance_count.present` refers to the existing row's value inside `DO UPDATE`.",
    ],
    code: [
      {
        filename: "counter-upsert.sql",
        lang: "sql",
        source: `
CREATE TABLE daily_attendance_count (
    day     date PRIMARY KEY,
    present int  NOT NULL
);

INSERT INTO daily_attendance_count (day, present) VALUES (current_date, 1)
ON CONFLICT (day) DO UPDATE SET present = daily_attendance_count.present + 1;

INSERT INTO daily_attendance_count (day, present) VALUES (current_date, 1)
ON CONFLICT (day) DO UPDATE SET present = daily_attendance_count.present + 1;

INSERT INTO daily_attendance_count (day, present) VALUES (current_date, 1)
ON CONFLICT (day) DO UPDATE SET present = daily_attendance_count.present + 1;

SELECT present FROM daily_attendance_count WHERE day = current_date;   -- 3
`,
      },
    ],
  },
  quiz: [
    {
      question: "Why is \"SELECT, then INSERT if not found\" risky under concurrency?",
      options: [
        "SELECT is slow",
        "Two sessions can both see no row and both try to insert",
        "INSERT can't follow SELECT",
        "It isn't risky",
      ],
      answer: 1,
      explanation: "`ON CONFLICT` performs the check and the write atomically.",
    },
    {
      question: "Inside `ON CONFLICT ... DO UPDATE`, what does `EXCLUDED.score` refer to?",
      options: ["The score that was deleted", "The old score in the table", "The score you tried to insert", "NULL"],
      answer: 2,
      explanation: "The table's own name (e.g. `mock_exam_scores.score`) refers to the existing value.",
    },
    {
      question: "What does `ON CONFLICT (student_id, subject_code) DO NOTHING` do with a duplicate?",
      options: ["Skips it silently", "Raises an error", "Deletes the old row", "Inserts a second copy"],
      answer: 0,
      explanation: "Useful for idempotent imports where re-sending the same rows must be harmless.",
    },
    {
      question: "What must exist for `ON CONFLICT (a, b)` to work?",
      options: ["An index on any column", "A trigger", "A sequence", "A unique constraint or unique index on (a, b)"],
      answer: 3,
      explanation: "The conflict target must match a unique index or constraint.",
    },
  ],
};

export const arraysEnumsDomains: Practice = {
  solution: {
    notes: [
      "The enum fixes the term names, the domain carries the 0–100 rule to any table that uses it, and `'improved' = ANY (remarks)` searches inside the array.",
    ],
    code: [
      {
        filename: "term-scores.sql",
        lang: "sql",
        source: `
CREATE TYPE term_name AS ENUM ('term1', 'term2', 'term3');
CREATE DOMAIN score AS smallint CHECK (VALUE BETWEEN 0 AND 100);

CREATE TABLE term_scores (
    student_id bigint    NOT NULL REFERENCES students (id),
    term       term_name NOT NULL,
    value      score     NOT NULL,
    remarks    text[]    NOT NULL DEFAULT '{}',
    PRIMARY KEY (student_id, term)
);

INSERT INTO term_scores VALUES
    (1, 'term1', 86, '{consistent}'),
    (1, 'term2', 89, '{improved,consistent}'),
    (4, 'term1', 39, '{needs support}'),
    (4, 'term2', 47, '{improved}');

INSERT INTO term_scores VALUES (2, 'term1', 120, '{}');   -- rejected by the domain

SELECT s.full_name, t.term, t.value
FROM term_scores t
JOIN students s ON s.id = t.student_id
WHERE 'improved' = ANY (t.remarks)
ORDER BY s.full_name, t.term;
`,
      },
    ],
  },
  quiz: [
    {
      question: "What happens when you insert a value that isn't in an enum's list?",
      options: ["It's added to the enum", "It's stored as NULL", "The insert is rejected with an error", "It's converted to text"],
      answer: 2,
      explanation: "Enums only accept their declared values.",
    },
    {
      question: "What is a DOMAIN in PostgreSQL?",
      options: [
        "A website address",
        "A reusable data type with its own constraints",
        "A schema",
        "A kind of index",
      ],
      answer: 1,
      explanation: "Define the rule once (e.g. a phone pattern) and reuse it in many tables.",
    },
    {
      question: "Which condition finds rows whose `tags` array shares at least one value with `{exams,fees}`?",
      options: ["`tags && '{exams,fees}'`", "`tags = '{exams,fees}'`", "`tags LIKE 'exams'`", "`tags IN ('exams','fees')`"],
      answer: 0,
      explanation: "`&&` is the array overlap operator; `@>` would require all of them.",
    },
    {
      question: "When should you prefer a separate table over an array column?",
      options: [
        "Never — arrays are always better",
        "When the list is very short",
        "When values are just simple tags",
        "When the items need their own attributes, foreign keys or frequent updates",
      ],
      answer: 3,
      explanation: "Arrays suit small, simple lists; relationships belong in tables.",
    },
  ],
};

export const writableCtesAndLateral: Practice = {
  solution: {
    notes: [
      "The LATERAL subquery picks the single best term-1 result for each subject. In the second statement, `targets` captures the old balances, `discounted` applies the discount and returns old and new values, and the outer INSERT records them — all in one atomic statement.",
    ],
    code: [
      {
        filename: "lateral-solution.sql",
        lang: "sql",
        source: `
SELECT sub.name AS subject, top.full_name, top.score
FROM subjects sub
CROSS JOIN LATERAL (
    SELECT s.full_name, r.score
    FROM results r
    JOIN students s ON s.id = r.student_id
    WHERE r.subject_id = sub.id AND r.term = 1
    ORDER BY r.score DESC
    LIMIT 1
) AS top
ORDER BY sub.name;

CREATE TABLE fee_adjustments (
    student_id  bigint        NOT NULL REFERENCES students (id),
    old_balance numeric(12,2) NOT NULL,
    new_balance numeric(12,2) NOT NULL,
    reason      text          NOT NULL,
    made_at     timestamptz   NOT NULL DEFAULT now()
);

WITH targets AS (
    SELECT id, fee_balance AS old_balance FROM students WHERE fee_balance > 150000
),
discounted AS (
    UPDATE students s
    SET fee_balance = round(s.fee_balance * 0.9, 2)
    FROM targets t
    WHERE s.id = t.id
    RETURNING s.id, t.old_balance, s.fee_balance AS new_balance
)
INSERT INTO fee_adjustments (student_id, old_balance, new_balance, reason)
SELECT id, old_balance, new_balance, '10% discount' FROM discounted
RETURNING student_id, old_balance, new_balance;
`,
      },
    ],
  },
  quiz: [
    {
      question: "What can a LATERAL subquery do that a normal subquery in FROM cannot?",
      options: [
        "Return more than one column",
        "Refer to columns of tables listed before it in the FROM clause",
        "Use ORDER BY",
        "Run faster in every case",
      ],
      answer: 1,
      explanation: "It runs once per outer row, using that row's values.",
    },
    {
      question: "How do you keep outer rows when a LATERAL subquery returns nothing?",
      options: ["`CROSS JOIN LATERAL`", "`INNER JOIN LATERAL`", "`LEFT JOIN LATERAL (...) ON true`", "`UNION LATERAL`"],
      answer: 2,
      explanation: "Just like LEFT JOIN, unmatched outer rows get NULLs.",
    },
    {
      question: "What makes \"move rows to an archive\" safe in one writable CTE?",
      options: [
        "The DELETE ... RETURNING and the INSERT run in one atomic statement",
        "CTEs are always cached",
        "It locks the whole database",
        "Nothing — it can lose rows",
      ],
      answer: 0,
      explanation: "Either both changes happen or neither does.",
    },
    {
      question: "Inside a data-modifying CTE, what makes the changed rows available to the next step?",
      options: ["`SELECT *`", "`COMMIT`", "A temporary table", "The `RETURNING` clause"],
      answer: 3,
      explanation: "RETURNING turns the modified rows into the CTE's result.",
    },
  ],
};

export const migrations: Practice = {
  solution: {
    notes: [
      "The column starts nullable so adding it is instant, and its DEFAULT (from a sequence that starts after the existing ids) numbers new students automatically. The backfill uses `lpad` for zero-padded numbers, the unique index is built concurrently (outside a transaction block) so writes continue, and only then does the column become NOT NULL.",
    ],
    code: [
      {
        filename: "004_students_admission_number.sql",
        lang: "sql",
        source: `
SET lock_timeout = '5s';

-- New students get the next number automatically; start after the existing ids
CREATE SEQUENCE IF NOT EXISTS admission_number_seq;
SELECT setval('admission_number_seq', (SELECT max(id) FROM students));

ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_number text;
ALTER TABLE students ALTER COLUMN admission_number
    SET DEFAULT 'ADM-2026-' || lpad(nextval('admission_number_seq')::text, 4, '0');

-- Backfill existing students (in batches on a big table)
UPDATE students
SET admission_number = 'ADM-2026-' || lpad(id::text, 4, '0')
WHERE admission_number IS NULL;

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_students_admission_number
    ON students (admission_number);

ALTER TABLE students ALTER COLUMN admission_number SET NOT NULL;

INSERT INTO schema_migrations (version) VALUES ('004_students_admission_number')
ON CONFLICT (version) DO NOTHING;

RESET lock_timeout;

INSERT INTO students (full_name, form, stream, gender) VALUES ('New Student', 1, 'A', 'F')
RETURNING id, admission_number;        -- numbered automatically

SELECT id, full_name, admission_number FROM students ORDER BY id LIMIT 3;
`,
      },
    ],
  },
  quiz: [
    {
      question: "Why set `lock_timeout` in a migration?",
      options: [
        "To make the migration run faster",
        "So a schema change that's blocked fails quickly instead of making every other query queue behind it",
        "To prevent deadlocks forever",
        "It's required syntax",
      ],
      answer: 1,
      explanation: "A waiting ALTER TABLE blocks the queries queued after it — failing fast protects the site.",
    },
    {
      question: "What does adding a constraint with `NOT VALID` do?",
      options: [
        "Disables the constraint permanently",
        "Checks only new and changed rows now; existing rows are checked later with VALIDATE",
        "Deletes invalid rows",
        "Makes the constraint optional",
      ],
      answer: 1,
      explanation: "VALIDATE CONSTRAINT then scans existing rows without blocking writes.",
    },
    {
      question: "What should you do if a migration that already ran in production has a mistake?",
      options: [
        "Edit the old migration file",
        "Delete it from schema_migrations",
        "Write a new migration that fixes it",
        "Restore yesterday's backup",
      ],
      answer: 2,
      explanation: "Migrations are history; every environment must apply the same sequence.",
    },
    {
      question: "Which is the safe order for adding a required column to a busy table?",
      options: [
        "Add it as NOT NULL with a computed backfill in one step",
        "Add nullable → backfill in batches → validate a NOT NULL check → SET NOT NULL",
        "Drop and recreate the table",
        "Add it NOT NULL and let inserts fail until it's filled",
      ],
      answer: 1,
      explanation: "Expand and contract keeps each step short and safe.",
    },
  ],
};
