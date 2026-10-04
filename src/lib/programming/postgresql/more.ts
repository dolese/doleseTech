import type { Lesson } from "../types";

// Lessons added after the first release. Each is inserted into its level in
// beginner.ts / intermediate.ts / advanced.ts. They use their own tables (or
// only read shared ones) so the results shown in later lessons don't change.

export const datesAndCase: Lesson = {
  slug: "dates-and-case",
  title: "Dates, Times & CASE",
  summary: "Date arithmetic, intervals, extracting parts of dates, formatting, and conditional values with CASE.",
  body: [
    "PostgreSQL has rich date and time support. `current_date` is today, `now()` is the current moment, and you can add or subtract `interval`s such as `interval '30 days'`. Subtracting two dates gives the number of days between them; `age()` gives years, months and days.",
    "`extract(year FROM d)` (or `date_part`) pulls out one part of a date; `date_trunc('month', ts)` rounds a timestamp down to the start of its month — perfect for grouping by month. `to_char` formats dates for display, e.g. `to_char(d, 'DD Mon YYYY')`.",
    "`CASE` adds if/else logic inside a query: `CASE WHEN condition THEN value ... ELSE value END`. Use it to label rows (age groups, fee status) or to count conditionally inside aggregates.",
  ],
  code: [
    {
      filename: "dates.sql",
      lang: "sql",
      source: `
-- Date arithmetic with fixed dates (so results are predictable)
SELECT date '2026-03-14' + 30               AS plus_30_days,
       date '2026-12-01' - date '2026-03-14' AS days_between,
       date '2026-03-14' + interval '2 months' AS plus_2_months,
       age(date '2026-03-14', date '2008-03-14') AS age_on_date;

-- Parts of a date, truncation and formatting
SELECT full_name,
       birth_date,
       extract(year FROM birth_date)::int        AS birth_year,
       date_trunc('month', birth_date)::date     AS birth_month,
       to_char(birth_date, 'DD Mon YYYY')         AS pretty
FROM students
WHERE birth_date IS NOT NULL
ORDER BY birth_date;

-- CASE: label each student
SELECT full_name,
       fee_balance,
       CASE
           WHEN fee_balance = 0        THEN 'cleared'
           WHEN fee_balance <= 100000  THEN 'small balance'
           ELSE 'large balance'
       END AS fee_status,
       CASE WHEN form >= 3 THEN 'senior' ELSE 'junior' END AS section
FROM students
ORDER BY fee_balance DESC;

-- CASE inside an aggregate: count per category in one row
SELECT count(*) FILTER (WHERE gender = 'F')                 AS girls,
       count(*) FILTER (WHERE gender = 'M')                 AS boys,
       sum(CASE WHEN fee_balance > 0 THEN 1 ELSE 0 END)     AS owing
FROM students;

-- A calendar of school days with generate_series
SELECT d::date AS day, to_char(d, 'Dy') AS weekday
FROM generate_series(date '2026-03-02', date '2026-03-08', interval '1 day') AS d
WHERE extract(isodow FROM d) < 6;
`,
    },
  ],
  keyPoints: [
    "Add or subtract `interval`s; subtracting dates gives days; `age()` gives a readable span.",
    "`extract` pulls out parts; `date_trunc` rounds down for grouping; `to_char` formats.",
    "`CASE WHEN ... THEN ... ELSE ... END` labels rows and powers conditional counts.",
  ],
  exercise:
    "Show each student's name and age in whole years on 1 January 2027 (`date_part('year', age(date '2027-01-01', birth_date))`). Then label every student 'Form 1-2' or 'Form 3-4' with CASE and count how many students are in each label.",
};

export const designAndNormalisation: Lesson = {
  slug: "design-and-normalisation",
  title: "Database Design & Normalisation",
  summary: "Turn a messy spreadsheet into well-structured tables: one fact in one place, linked by keys.",
  body: [
    "Data often arrives as one wide spreadsheet that repeats the same facts on many rows — the club name and the teacher's phone on every member's row. Repetition causes anomalies: change the teacher's phone in one row and the others are now wrong; delete the last member and you lose the club itself.",
    "Normalisation fixes this by giving each kind of thing its own table. First normal form: one value per cell, no lists in a column. Second and third normal form: every column depends on the whole key and nothing but the key — a teacher's phone belongs in `teachers`, not in the membership row.",
    "Many-to-many relationships (students ↔ clubs) need a junction table holding pairs of foreign keys. Normalise first; add carefully chosen shortcuts (denormalisation, materialized views) later, only when measurements show you need them.",
  ],
  code: [
    {
      filename: "design.sql",
      lang: "sql",
      source: `
-- The spreadsheet as it arrived: club and teacher details repeat on every row
CREATE TABLE club_signups_raw (
    student_name  text,
    club_name     text,
    club_teacher  text,
    teacher_phone text,
    joined_on     date
);
INSERT INTO club_signups_raw VALUES
    ('Amina Hassan',  'Debate',  'Mrs. Mrema',   '0688000003', '2026-01-20'),
    ('Neema Kimaro',  'Debate',  'Mrs. Mrema',   '0688000003', '2026-01-22'),
    ('Amina Hassan',  'Science', 'Ms. Lyimo',    '0754000002', '2026-02-01'),
    ('Ali Mohamed',   'Science', 'Ms. Lyimo',    '0754000002', '2026-02-03'),
    ('Zawadi Njau',   'Science', 'Ms. Lyimo',    '0754000002', '2026-02-03');

-- Normalised design: each fact stored once
ALTER TABLE teachers ADD COLUMN phone text;
UPDATE teachers t SET phone = r.teacher_phone
FROM (SELECT DISTINCT club_teacher, teacher_phone FROM club_signups_raw) r
WHERE t.full_name = r.club_teacher;

CREATE TABLE clubs (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       text   NOT NULL UNIQUE,
    teacher_id bigint REFERENCES teachers (id)
);

CREATE TABLE club_members (                        -- junction table: many-to-many
    student_id bigint NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    club_id    bigint NOT NULL REFERENCES clubs (id) ON DELETE CASCADE,
    joined_on  date   NOT NULL,
    PRIMARY KEY (student_id, club_id)
);

INSERT INTO clubs (name, teacher_id)
SELECT DISTINCT r.club_name, t.id
FROM club_signups_raw r
JOIN teachers t ON t.full_name = r.club_teacher;

INSERT INTO club_members (student_id, club_id, joined_on)
SELECT s.id, c.id, r.joined_on
FROM club_signups_raw r
JOIN students s ON s.full_name = r.student_name
JOIN clubs c    ON c.name = r.club_name;

-- The original view of the data, rebuilt with joins
SELECT c.name AS club, t.full_name AS teacher, t.phone, count(m.student_id) AS members
FROM clubs c
JOIN teachers t          ON t.id = c.teacher_id
LEFT JOIN club_members m ON m.club_id = c.id
GROUP BY c.name, t.full_name, t.phone
ORDER BY c.name;

-- Changing a phone number is now one update, not one per row
UPDATE teachers SET phone = '0755111222' WHERE full_name = 'Ms. Lyimo';
`,
    },
  ],
  keyPoints: [
    "Store each fact once; repetition leads to update, insert and delete anomalies.",
    "Columns must depend on the key of their own table — move the rest to the right table.",
    "Model many-to-many relationships with a junction table of foreign-key pairs.",
  ],
  exercise:
    "A messy `book_loans_raw` sheet has columns: student_name, student_form, book_title, book_author, borrowed_on, returned_on. Design normalised tables (`books`, `loans`) with keys and constraints, create them, and write the INSERT ... SELECT statements to fill them from a few sample rows.",
};

export const upserts: Lesson = {
  slug: "upserts",
  title: "Upserts with INSERT … ON CONFLICT",
  summary: "Insert new rows or update existing ones in one atomic statement, and import data safely.",
  body: [
    "An upsert means \"insert this row, or update it if it already exists\". Doing it with a SELECT followed by INSERT or UPDATE is racy — two sessions can both decide to insert. `INSERT ... ON CONFLICT` does it atomically, based on a unique constraint or primary key.",
    "`ON CONFLICT (columns) DO NOTHING` skips duplicates. `ON CONFLICT (columns) DO UPDATE SET col = EXCLUDED.col` updates the existing row; `EXCLUDED` is the row you tried to insert. Add a `WHERE` to update only when it makes sense, such as keeping the highest score.",
    "A common import pattern: load the spreadsheet into a staging table, then upsert from it into the real table in one statement. PostgreSQL 15+ also offers `MERGE` for more complex insert/update/delete logic.",
  ],
  code: [
    {
      filename: "upserts.sql",
      lang: "sql",
      source: `
CREATE TABLE mock_exam_scores (
    student_id   bigint   NOT NULL REFERENCES students (id),
    subject_code text     NOT NULL,
    score        smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, subject_code)
);

INSERT INTO mock_exam_scores (student_id, subject_code, score) VALUES
    (1, 'MATH', 80), (2, 'MATH', 45), (3, 'MATH', 70);

-- Re-sending the same rows would fail with a duplicate key... unless:
INSERT INTO mock_exam_scores (student_id, subject_code, score) VALUES (1, 'MATH', 80)
ON CONFLICT (student_id, subject_code) DO NOTHING;

-- Corrected marks arrive: update existing rows, insert new ones
INSERT INTO mock_exam_scores (student_id, subject_code, score) VALUES
    (1, 'MATH', 85),          -- exists: updated
    (4, 'MATH', 38)           -- new: inserted
ON CONFLICT (student_id, subject_code)
DO UPDATE SET score = EXCLUDED.score, updated_at = now()
RETURNING student_id, score, (xmax = 0) AS inserted;

-- Keep only the best attempt: update only when the new score is higher
INSERT INTO mock_exam_scores (student_id, subject_code, score) VALUES (2, 'MATH', 40), (3, 'MATH', 77)
ON CONFLICT (student_id, subject_code)
DO UPDATE SET score = EXCLUDED.score, updated_at = now()
WHERE EXCLUDED.score > mock_exam_scores.score;

SELECT student_id, subject_code, score FROM mock_exam_scores ORDER BY student_id;

-- Import pattern: staging table, then one upsert
CREATE TEMP TABLE scores_import (student_id bigint, subject_code text, score smallint);
INSERT INTO scores_import VALUES (5, 'MATH', 66), (1, 'MATH', 90), (6, 'MATH', 99);

INSERT INTO mock_exam_scores (student_id, subject_code, score)
SELECT student_id, subject_code, score FROM scores_import
ON CONFLICT (student_id, subject_code)
DO UPDATE SET score = EXCLUDED.score, updated_at = now();

SELECT count(*) AS rows_now FROM mock_exam_scores;   -- 6 (students 5 and 6 were new; 1 was updated)
`,
    },
  ],
  keyPoints: [
    "`ON CONFLICT` makes insert-or-update atomic — no race between check and insert.",
    "`EXCLUDED` refers to the row you tried to insert; add `WHERE` for conditional updates.",
    "Import via a staging table plus one upsert; `RETURNING (xmax = 0)` tells inserts from updates.",
  ],
  exercise:
    "Create a `daily_attendance_count (day date PRIMARY KEY, present int NOT NULL)` table. Write an upsert that adds 1 to today's count each time it runs (inserting 1 the first time), run it three times, and confirm the count is 3.",
};

export const arraysEnumsDomains: Lesson = {
  slug: "arrays-enums-domains",
  title: "Arrays, Enums & Domains",
  summary: "Richer column types: enumerated values, reusable validated types, and arrays.",
  body: [
    "An `ENUM` type is a fixed, ordered list of allowed values — `'draft' < 'published' < 'archived'`. It documents the options in the schema and rejects anything else. Adding values later is easy; removing them is not, so use enums for truly stable sets.",
    "A `DOMAIN` is a reusable type with built-in rules: define `tz_phone` once (text that must match a Tanzanian mobile number pattern) and use it in every table that stores phone numbers.",
    "Array columns (`text[]`, `smallint[]`) hold several values in one field. Query them with `ANY`, containment `@>`, overlap `&&`, `unnest` (one row per element) and `array_agg` (rows back into an array). Arrays suit small tag lists; if items need their own attributes or foreign keys, use a separate table instead.",
  ],
  code: [
    {
      filename: "types.sql",
      lang: "sql",
      source: `
CREATE TYPE notice_status AS ENUM ('draft', 'published', 'archived');
CREATE DOMAIN tz_phone AS text CHECK (VALUE ~ '^0[67][0-9]{8}$');

CREATE TABLE notices (
    id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title     text          NOT NULL,
    status    notice_status NOT NULL DEFAULT 'draft',
    forms     smallint[]    NOT NULL DEFAULT '{}',     -- which forms should see it
    tags      text[]        NOT NULL DEFAULT '{}',
    contact   tz_phone
);

INSERT INTO notices (title, status, forms, tags, contact) VALUES
    ('Mock exams timetable', 'published', '{3,4}',     '{exams,timetable}', '0712345678'),
    ('Sports day',           'published', '{1,2,3,4}', '{sports,events}',   '0754000002'),
    ('Fees reminder',        'draft',     '{1,2,3,4}', '{fees,exams}',      NULL),
    ('Old holiday notice',   'archived',  '{1,2}',     '{holidays,events}', NULL);

-- Rejected by the enum and the domain:
INSERT INTO notices (title, status) VALUES ('Bad status', 'deleted');
INSERT INTO notices (title, contact) VALUES ('Bad phone', '12345');

-- Enums are ordered
SELECT title, status FROM notices WHERE status < 'archived' ORDER BY status, title;

-- Arrays: notices for Form 4, with an exams or fees tag
SELECT title FROM notices
WHERE 4 = ANY (forms) AND tags && '{exams,fees}'
ORDER BY title;

-- unnest: one row per tag, then count tag usage
SELECT tag, count(*) AS notices
FROM notices, unnest(tags) AS tag
GROUP BY tag
ORDER BY notices DESC, tag;

-- array_agg: back to one array per status
SELECT status, array_agg(title ORDER BY title) AS titles
FROM notices
GROUP BY status
ORDER BY status;

CREATE INDEX idx_notices_tags ON notices USING gin (tags);
SELECT enum_range(NULL::notice_status) AS allowed_statuses;
`,
    },
  ],
  keyPoints: [
    "Enums fix a set of ordered values; domains bundle a type with reusable rules.",
    "Query arrays with `ANY`, `@>`, `&&`; turn them into rows with `unnest`, back with `array_agg`.",
    "Use arrays for small value lists; use a related table when items need their own data or keys.",
  ],
  exercise:
    "Create an enum `term_name` ('term1', 'term2', 'term3') and a domain `score` (smallint between 0 and 100). Create a `term_scores` table using both plus a `remarks text[]` column, insert a few rows, and find every row whose remarks contain 'improved'.",
};

export const writableCtesAndLateral: Lesson = {
  slug: "writable-ctes-and-lateral",
  title: "Writable CTEs & LATERAL Joins",
  summary: "Chain data changes in one statement and run a subquery once per row.",
  body: [
    "CTEs can contain `INSERT`, `UPDATE` and `DELETE` with `RETURNING`. The returned rows feed the next step, so \"move rows from one table to another\" becomes a single atomic statement: delete from the source, insert what was deleted into the archive.",
    "A `LATERAL` subquery can refer to columns of tables listed before it — it runs once per outer row. It's the cleanest way to answer \"top N per group\" (each student's two best scores) or to call a set-returning function per row.",
    "`LEFT JOIN LATERAL ... ON true` keeps outer rows that have no matches, just like a normal LEFT JOIN.",
  ],
  code: [
    {
      filename: "lateral.sql",
      lang: "sql",
      source: `
-- Each student's two best term-2 scores
SELECT s.full_name, best.subject, best.score
FROM students s
CROSS JOIN LATERAL (
    SELECT sub.name AS subject, r.score
    FROM results r
    JOIN subjects sub ON sub.id = r.subject_id
    WHERE r.student_id = s.id AND r.term = 2
    ORDER BY r.score DESC
    LIMIT 2
) AS best
ORDER BY s.full_name, best.score DESC;

-- LEFT JOIN LATERAL keeps students without payments
SELECT s.full_name, last_payment.paid_at::date AS last_paid, last_payment.amount
FROM students s
LEFT JOIN LATERAL (
    SELECT paid_at, amount FROM payments p
    WHERE p.student_id = s.id
    ORDER BY paid_at DESC
    LIMIT 1
) AS last_payment ON true
ORDER BY s.full_name;

-- Writable CTE: archive jobs that are being sent, in one atomic statement
CREATE TABLE sms_jobs_archive (LIKE sms_jobs INCLUDING DEFAULTS);

WITH moved AS (
    DELETE FROM sms_jobs
    WHERE status = 'sending'
    RETURNING *
)
INSERT INTO sms_jobs_archive
SELECT * FROM moved;

SELECT (SELECT count(*) FROM sms_jobs)         AS still_queued,
       (SELECT count(*) FROM sms_jobs_archive) AS archived;
`,
    },
  ],
  keyPoints: [
    "Data-modifying CTEs with `RETURNING` chain changes atomically in one statement.",
    "`LATERAL` lets a subquery use the current outer row — ideal for top-N per group.",
    "Use `LEFT JOIN LATERAL ... ON true` to keep outer rows with no matches.",
  ],
  exercise:
    "Using LATERAL, list each subject with its top scorer in term 1 (name and score). Then write a writable CTE that gives every student with a fee balance over 150,000 a 10% discount and inserts a note for each change into a new `fee_adjustments` table — in one statement.",
};

export const migrations: Lesson = {
  slug: "schema-migrations",
  title: "Schema Migrations Without Downtime",
  summary: "Change a live database safely: versioned migrations, lock timeouts and the expand-and-contract pattern.",
  body: [
    "In production, schema changes run against tables that are in use. Some operations take strong locks; if one waits behind a long query, every other query waits behind it, and the site stalls. Always set a `lock_timeout` in migrations so a blocked change fails fast and can be retried.",
    "Make big changes in small safe steps (expand and contract): add a new nullable column; backfill it in batches; add a constraint as `NOT VALID` (instant) and then `VALIDATE CONSTRAINT` (checks existing rows without blocking writes); only then make it `NOT NULL`. Create indexes `CONCURRENTLY`.",
    "Track which migrations have run in a table such as `schema_migrations`, give files increasing numbers, and never edit a migration that has already run in production — write a new one instead. Tools like Flyway, Alembic or Prisma do this bookkeeping for you.",
  ],
  code: [
    {
      filename: "003_payment_reference.sql",
      lang: "sql",
      source: `
CREATE TABLE IF NOT EXISTS schema_migrations (
    version    text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
);

-- Fail fast instead of queueing behind long transactions
SET lock_timeout = '5s';

-- Step 1 (expand): a nullable column is a quick metadata-only change
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference text;

-- Step 2: backfill in batches (repeat until 0 rows are updated)
UPDATE payments SET reference = 'LEGACY-' || id
WHERE id IN (SELECT id FROM payments WHERE reference IS NULL LIMIT 1000);

-- Step 3: add the rule without scanning, then validate without blocking writes
ALTER TABLE payments ADD CONSTRAINT payments_reference_not_null CHECK (reference IS NOT NULL) NOT VALID;
ALTER TABLE payments VALIDATE CONSTRAINT payments_reference_not_null;

-- Step 4 (contract): now SET NOT NULL can use the validated check, and the check can go
ALTER TABLE payments ALTER COLUMN reference SET NOT NULL;
ALTER TABLE payments DROP CONSTRAINT payments_reference_not_null;

INSERT INTO schema_migrations (version) VALUES ('003_payment_reference')
ON CONFLICT (version) DO NOTHING;

RESET lock_timeout;

SELECT version, applied_at::date FROM schema_migrations;
SELECT id, reference FROM payments ORDER BY id LIMIT 3;
`,
    },
  ],
  keyPoints: [
    "Set `lock_timeout` so blocked schema changes fail fast instead of stalling the site.",
    "Expand and contract: nullable column → backfill in batches → `NOT VALID` + `VALIDATE` → `NOT NULL`.",
    "Number migrations, record them in a table, and never edit one that already ran.",
  ],
  exercise:
    "Write migration `004_students_admission_number.sql` that adds a required, unique `admission_number` to `students` safely: add it nullable, give it a DEFAULT from a sequence so new students are numbered automatically, backfill existing rows with values like 'ADM-2026-0001' from the id, build a unique index concurrently, then make it NOT NULL. Record it in `schema_migrations`.",
};
