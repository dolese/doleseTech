import type { LevelTrack } from "../types";
import { designAndNormalisation, upserts, arraysEnumsDomains } from "./more";

export const intermediate: LevelTrack = {
  intro:
    "Answer real questions with SQL: combine tables with joins, structure queries with subqueries and CTEs, rank and compare rows with window functions, make queries fast with indexes, keep data correct with transactions, and use views, functions and JSONB.",
  outcomes: [
    "Combine tables with INNER, LEFT and anti-joins",
    "Write readable queries with CTEs and window functions",
    "Read EXPLAIN plans and add the right indexes",
    "Use transactions, views, PL/pgSQL functions and JSONB",
  ],
  lessons: [
    {
      slug: "joins",
      title: "Sample Database & Joins",
      summary: "Load the course database, then combine tables with INNER, LEFT and anti-joins.",
      body: [
        "Run the script below to create the school database used throughout the Intermediate and Advanced tracks (it drops and recreates the tables, so it is safe to re-run). Save it as `school.sql` and load it with `psql -d school -f school.sql`.",
        "A JOIN combines rows from two tables where a condition matches. `INNER JOIN` (or just `JOIN`) keeps only rows that match on both sides. `LEFT JOIN` keeps every row from the left table and fills the right side with NULL when there is no match.",
        "An anti-join finds rows with no match: `LEFT JOIN ... WHERE right.id IS NULL` (or `NOT EXISTS`). Give tables short aliases (`s`, `r`, `sub`) to keep queries readable.",
      ],
      code: [
        {
          filename: "school.sql",
          lang: "sql",
          source: `
DROP TABLE IF EXISTS results, payments, students, subjects, teachers CASCADE;

CREATE TABLE teachers (
    id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name text NOT NULL
);

CREATE TABLE subjects (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code       text NOT NULL UNIQUE,
    name       text NOT NULL,
    teacher_id bigint REFERENCES teachers (id)
);

CREATE TABLE students (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name   text          NOT NULL,
    form        smallint      NOT NULL CHECK (form BETWEEN 1 AND 6),
    stream      char(1)       NOT NULL,
    gender      char(1)       NOT NULL CHECK (gender IN ('F', 'M')),
    email       text UNIQUE,
    fee_balance numeric(12,2) NOT NULL DEFAULT 0 CHECK (fee_balance >= 0)
);

CREATE TABLE results (
    student_id bigint   NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    subject_id bigint   NOT NULL REFERENCES subjects (id),
    term       smallint NOT NULL CHECK (term IN (1, 2)),
    score      smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
    PRIMARY KEY (student_id, subject_id, term)
);

CREATE TABLE payments (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id bigint        NOT NULL REFERENCES students (id),
    amount     numeric(12,2) NOT NULL CHECK (amount > 0),
    method     text          NOT NULL CHECK (method IN ('mpesa', 'bank', 'cash')),
    paid_at    timestamptz   NOT NULL DEFAULT now()
);

INSERT INTO teachers (full_name) VALUES ('Mr. Mwakyusa'), ('Ms. Lyimo'), ('Mrs. Mrema');

INSERT INTO subjects (code, name, teacher_id) VALUES
    ('MATH', 'Basic Mathematics', 1), ('BIO', 'Biology', 2),
    ('ENG', 'English Language', 3),   ('CHEM', 'Chemistry', NULL);

INSERT INTO students (full_name, form, stream, gender, email, fee_balance) VALUES
    ('Amina Hassan',  4, 'A', 'F', 'amina@example.com',  0),
    ('Baraka Mushi',  4, 'B', 'M', NULL,                 150000),
    ('Neema Kimaro',  4, 'A', 'F', 'neema@example.com',  50000),
    ('Juma Said',     4, 'B', 'M', 'juma@example.com',   200000),
    ('Rehema Mollel', 3, 'A', 'F', NULL,                 300000),
    ('Ali Mohamed',   3, 'A', 'M', 'ali@example.com',    0),
    ('Zawadi Njau',   3, 'B', 'F', 'zawadi@example.com', 75000),
    ('Frank Temba',   2, 'A', 'M', NULL,                 120000);

INSERT INTO results (student_id, subject_id, term, score) VALUES
    (1,1,1,88),(1,2,1,79),(1,3,1,91),(1,1,2,92),(1,2,2,81),(1,3,2,89),
    (2,1,1,42),(2,2,1,55),(2,3,1,61),(2,1,2,48),(2,2,2,52),(2,3,2,66),
    (3,1,1,71),(3,2,1,84),(3,3,1,66),(3,1,2,69),(3,2,2,88),(3,3,2,72),
    (4,1,1,29),(4,3,1,48),(4,1,2,35),(4,3,2,51),
    (5,1,1,64),(5,2,1,70),(5,1,2,74),(5,2,2,77),
    (6,1,1,95),(6,2,1,62),(6,1,2,97),(6,2,2,58),
    (7,2,1,81),(7,3,1,77),(7,2,2,85),(7,3,2,80);

INSERT INTO payments (student_id, amount, method, paid_at) VALUES
    (1, 300000, 'mpesa', '2026-01-10'), (2, 150000, 'bank',  '2026-01-15'),
    (3, 250000, 'mpesa', '2026-01-12'), (3,  50000, 'cash',  '2026-03-02'),
    (6, 300000, 'bank',  '2026-01-20'), (7, 225000, 'mpesa', '2026-02-05');
`,
        },
        {
          filename: "joins.sql",
          lang: "sql",
          source: `
-- INNER JOIN: each result with student and subject names
SELECT s.full_name, sub.name AS subject, r.term, r.score
FROM results r
JOIN students s   ON s.id = r.student_id
JOIN subjects sub ON sub.id = r.subject_id
WHERE r.term = 2 AND sub.code = 'MATH'
ORDER BY r.score DESC;

-- LEFT JOIN: every subject, with its teacher if it has one
SELECT sub.name, coalesce(t.full_name, '(no teacher yet)') AS teacher
FROM subjects sub
LEFT JOIN teachers t ON t.id = sub.teacher_id
ORDER BY sub.name;

-- Anti-join: students who have never made a payment
SELECT s.full_name, s.fee_balance
FROM students s
LEFT JOIN payments p ON p.student_id = s.id
WHERE p.id IS NULL
ORDER BY s.full_name;

-- Total paid per student, including students who paid nothing
SELECT s.full_name, coalesce(sum(p.amount), 0) AS total_paid
FROM students s
LEFT JOIN payments p ON p.student_id = s.id
GROUP BY s.id, s.full_name
ORDER BY total_paid DESC, s.full_name;
`,
        },
      ],
      keyPoints: [
        "INNER JOIN keeps matches only; LEFT JOIN keeps every left-side row.",
        "Anti-join (`LEFT JOIN ... IS NULL` or `NOT EXISTS`) finds missing relationships.",
        "With LEFT JOIN + aggregates, wrap sums in `coalesce(..., 0)`.",
      ],
      exercise:
        "List every subject with the number of students who sat it in term 1 (including subjects nobody sat). Then find students who have results in Maths but not in Biology.",
    },
    designAndNormalisation,
    {
      slug: "subqueries-and-ctes",
      title: "Subqueries & CTEs",
      summary: "Queries inside queries, EXISTS, WITH clauses and recursive CTEs.",
      body: [
        "A subquery is a query inside another. It can return one value (compare each score with the overall average), a list (`IN (...)`), or test for existence (`EXISTS`).",
        "Common Table Expressions (`WITH name AS (...)`) name intermediate results so a complex query reads top-to-bottom like steps of a recipe. You can chain several CTEs.",
        "`WITH RECURSIVE` walks hierarchies — organisation charts, categories, prerequisite chains — by repeatedly joining a table to the previous step's rows.",
      ],
      code: [
        {
          filename: "ctes.sql",
          lang: "sql",
          source: `
-- Scalar subquery: term-2 Maths scores above the term-2 Maths average
SELECT s.full_name, r.score
FROM results r
JOIN students s ON s.id = r.student_id
WHERE r.term = 2 AND r.subject_id = 1
  AND r.score > (SELECT avg(score) FROM results WHERE term = 2 AND subject_id = 1)
ORDER BY r.score DESC;

-- EXISTS: students with at least one score below 40
SELECT full_name FROM students s
WHERE EXISTS (SELECT 1 FROM results r WHERE r.student_id = s.id AND r.score < 40);

-- CTEs: step-by-step report of term-2 averages and improvement
WITH term_avg AS (
    SELECT student_id, term, avg(score) AS avg_score
    FROM results
    GROUP BY student_id, term
),
improvement AS (
    SELECT t1.student_id,
           round(t1.avg_score, 1) AS term1,
           round(t2.avg_score, 1) AS term2,
           round(t2.avg_score - t1.avg_score, 1) AS change
    FROM term_avg t1
    JOIN term_avg t2 ON t2.student_id = t1.student_id AND t2.term = 2
    WHERE t1.term = 1
)
SELECT s.full_name, i.term1, i.term2, i.change
FROM improvement i
JOIN students s ON s.id = i.student_id
ORDER BY i.change DESC;

-- Recursive CTE: a staff reporting chain
CREATE TEMP TABLE staff (id int PRIMARY KEY, name text, manager_id int REFERENCES staff (id));
INSERT INTO staff VALUES
    (1, 'Head Teacher', NULL), (2, 'Academic Master', 1),
    (3, 'Head of Science', 2), (4, 'Biology Teacher', 3), (5, 'Bursar', 1);

WITH RECURSIVE chain AS (
    SELECT id, name, manager_id, 0 AS depth, name AS path
    FROM staff WHERE manager_id IS NULL
    UNION ALL
    SELECT st.id, st.name, st.manager_id, c.depth + 1, c.path || ' > ' || st.name
    FROM staff st
    JOIN chain c ON st.manager_id = c.id
)
SELECT repeat('  ', depth) || name AS org_chart, path
FROM chain
ORDER BY path;
`,
        },
      ],
      keyPoints: [
        "Subqueries can return a value, a list, or just test existence.",
        "CTEs make multi-step queries readable — name each step.",
        "`WITH RECURSIVE` handles trees and hierarchies.",
      ],
      exercise:
        "Using CTEs, find for each form the student with the highest overall average. Then write a recursive CTE that generates the dates of the next 14 days and LEFT JOIN it to payments to show daily totals (zero for days with none).",
    },
    {
      slug: "window-functions",
      title: "Window Functions",
      summary: "Rankings, running totals, per-group averages and comparisons with previous rows.",
      body: [
        "Window functions calculate across a set of related rows without collapsing them like GROUP BY does — every row keeps its detail and gains a computed value. The `OVER (...)` clause defines the window.",
        "`PARTITION BY` splits rows into groups (per subject, per student), and `ORDER BY` inside `OVER` sets the order for ranks and running totals.",
        "Key functions: `rank()` / `dense_rank()` / `row_number()` for positions, `avg()` / `sum()` over a window for group figures and running totals, and `lag()` / `lead()` to compare with the previous or next row.",
      ],
      code: [
        {
          filename: "windows.sql",
          lang: "sql",
          source: `
-- Position in each subject for term 2
SELECT sub.name AS subject, s.full_name, r.score,
       rank() OVER (PARTITION BY r.subject_id ORDER BY r.score DESC) AS position
FROM results r
JOIN students s   ON s.id = r.student_id
JOIN subjects sub ON sub.id = r.subject_id
WHERE r.term = 2
ORDER BY subject, position;

-- Each score next to the subject average and the difference
SELECT s.full_name, r.subject_id, r.score,
       round(avg(r.score) OVER (PARTITION BY r.subject_id, r.term), 1) AS subject_avg,
       r.score - round(avg(r.score) OVER (PARTITION BY r.subject_id, r.term), 1) AS vs_avg
FROM results r
JOIN students s ON s.id = r.student_id
WHERE r.term = 1
ORDER BY r.subject_id, r.score DESC;

-- Change since last term with lag()
SELECT s.full_name, r.subject_id, r.term, r.score,
       r.score - lag(r.score) OVER (PARTITION BY r.student_id, r.subject_id ORDER BY r.term) AS change
FROM results r
JOIN students s ON s.id = r.student_id
WHERE r.subject_id = 1
ORDER BY s.full_name, r.term;

-- Running total of fee payments over time
SELECT paid_at::date AS day, amount,
       sum(amount) OVER (ORDER BY paid_at) AS running_total
FROM payments
ORDER BY paid_at;

-- Top 2 per subject: rank in a CTE, then filter
WITH ranked AS (
    SELECT r.*, row_number() OVER (PARTITION BY subject_id ORDER BY score DESC) AS rn
    FROM results r WHERE term = 2
)
SELECT subject_id, student_id, score FROM ranked WHERE rn <= 2 ORDER BY subject_id, rn;
`,
        },
      ],
      keyPoints: [
        "Window functions add per-group values without collapsing rows.",
        "`PARTITION BY` = the groups; `ORDER BY` in OVER = order for ranks/running totals.",
        "Filter on a window result by wrapping it in a CTE or subquery.",
      ],
      exercise:
        "Produce a class report for Form 4: each student's overall term-2 average, their position in the class (`dense_rank`), and the difference from the student just above them (`lag`).",
    },
    {
      slug: "indexes-and-explain",
      title: "Indexes & EXPLAIN",
      summary: "Read query plans and add indexes that turn slow scans into fast lookups.",
      body: [
        "Without an index, PostgreSQL reads every row of a table to find matches (a sequential scan). An index is a sorted structure — like the index at the back of a book — that jumps straight to the matching rows.",
        "`EXPLAIN ANALYZE` runs a query and shows the plan PostgreSQL chose and the real time taken. Look for `Seq Scan` on large tables, and compare estimated rows with actual rows.",
        "Index the columns you filter, join and sort by. Primary keys and UNIQUE constraints are indexed automatically, but foreign keys are not — index them yourself. A multi-column index on `(a, b)` helps filters on `a` or on `a AND b`. Every index slows writes and uses disk, so add them for real queries, not \"just in case\".",
      ],
      code: [
        {
          filename: "indexes.sql",
          lang: "sql",
          source: `
CREATE TABLE exam_entries (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidate  text     NOT NULL,
    centre     text     NOT NULL,
    subject_id int      NOT NULL,
    year       smallint NOT NULL,
    score      smallint NOT NULL
);

INSERT INTO exam_entries (candidate, centre, subject_id, year, score)
SELECT 'S' || lpad(g::text, 7, '0'),
       'P' || lpad((g % 4000)::text, 4, '0'),
       1 + g % 12,
       2016 + (g / 4000) % 10,
       (g * 37) % 101
FROM generate_series(1, 500000) AS g;

ANALYZE exam_entries;

EXPLAIN ANALYZE
SELECT * FROM exam_entries WHERE candidate = 'S0123456';
-- (Parallel) Seq Scan on exam_entries ... every row is read to find one

CREATE INDEX idx_exam_entries_candidate ON exam_entries (candidate);

EXPLAIN ANALYZE
SELECT * FROM exam_entries WHERE candidate = 'S0123456';
-- Index Scan using idx_exam_entries_candidate ... (a fraction of a millisecond)

CREATE INDEX idx_exam_entries_centre_year ON exam_entries (centre, year);

EXPLAIN ANALYZE
SELECT subject_id, avg(score)
FROM exam_entries
WHERE centre = 'P0420' AND year = 2025
GROUP BY subject_id;

-- Foreign keys are not indexed automatically
CREATE INDEX idx_results_subject ON results (subject_id);
CREATE INDEX idx_payments_student ON payments (student_id);

SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'exam_entries';
`,
        },
      ],
      keyPoints: [
        "`EXPLAIN ANALYZE` shows what the database actually did and how long it took.",
        "Index columns used in WHERE, JOIN and ORDER BY — including foreign keys.",
        "Column order matters in multi-column indexes; each index costs write speed.",
      ],
      exercise:
        "On `exam_entries`, measure `WHERE year = 2024 AND score >= 90 ORDER BY score DESC LIMIT 10` before and after creating an index on `(year, score)`. Then check whether the `(centre, year)` index helps a query that filters on `year` only, and explain why.",
    },
    {
      slug: "transactions",
      title: "Transactions",
      summary: "BEGIN, COMMIT and ROLLBACK for all-or-nothing changes; savepoints and isolation.",
      body: [
        "A transaction groups statements so they succeed or fail together. Recording a fee payment means inserting a payment and reducing the balance — if one step fails, neither should happen.",
        "Start with `BEGIN`, finish with `COMMIT` to save or `ROLLBACK` to undo everything. If any statement errors, PostgreSQL refuses further statements until you roll back. Other sessions never see half-finished changes.",
        "`SAVEPOINT` lets you undo part of a transaction. The isolation level (`READ COMMITTED` by default; `REPEATABLE READ` and `SERIALIZABLE` are stricter) controls what a transaction sees of other transactions' concurrent changes.",
      ],
      code: [
        {
          filename: "transactions.sql",
          lang: "sql",
          source: `
-- Record a payment atomically
BEGIN;
INSERT INTO payments (student_id, amount, method) VALUES (2, 100000, 'mpesa');
UPDATE students SET fee_balance = fee_balance - 100000 WHERE id = 2;
COMMIT;

SELECT full_name, fee_balance FROM students WHERE id = 2;   -- 50000.00

-- A failing step undoes the whole transaction
BEGIN;
INSERT INTO payments (student_id, amount, method) VALUES (2, 80000, 'mpesa');
UPDATE students SET fee_balance = fee_balance - 80000 WHERE id = 2;
-- ERROR: new row violates check constraint "students_fee_balance_check"
ROLLBACK;

SELECT count(*) FROM payments WHERE student_id = 2;   -- the 80000 payment was not saved

-- Savepoints: keep the good part, undo the rest
BEGIN;
UPDATE students SET email = 'baraka@example.com' WHERE id = 2;
SAVEPOINT before_risky;
UPDATE students SET email = 'amina@example.com' WHERE id = 2;   -- ERROR: duplicate email
ROLLBACK TO SAVEPOINT before_risky;
COMMIT;

SELECT full_name, email FROM students WHERE id = 2;   -- baraka@example.com

-- A stricter isolation level for a consistent multi-query report
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT sum(fee_balance) FROM students;
SELECT sum(amount) FROM payments;
COMMIT;
`,
        },
      ],
      keyPoints: [
        "Wrap related changes in BEGIN … COMMIT so they happen together or not at all.",
        "After an error, ROLLBACK (or roll back to a savepoint) before continuing.",
        "Put CHECK constraints on invariants (like balance ≥ 0) so bad transactions fail.",
      ],
      exercise:
        "Write a transaction that transfers a student from Form 3 stream A to stream B and logs the change in a new `transfers` table. Then make it fail on purpose and confirm with SELECT that nothing changed.",
    },
    upserts,
    {
      slug: "views-and-functions",
      title: "Views, Materialized Views & Functions",
      summary: "Save queries as views, cache results, and write SQL and PL/pgSQL functions.",
      body: [
        "A view is a saved query you can select from like a table. It hides complex joins from users and applications — for example, a report-card view.",
        "A materialized view stores the query's result on disk, which makes expensive reports instant. Refresh it with `REFRESH MATERIALIZED VIEW` when the data changes.",
        "Functions put reusable logic inside the database. Simple ones can be pure SQL; PL/pgSQL adds variables, IF/ELSE and loops. Mark functions `IMMUTABLE` when the same input always gives the same output, so PostgreSQL can optimise them.",
      ],
      code: [
        {
          filename: "views.sql",
          lang: "sql",
          source: `
CREATE OR REPLACE FUNCTION grade_for(score numeric)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF score >= 75 THEN RETURN 'A';
    ELSIF score >= 65 THEN RETURN 'B';
    ELSIF score >= 45 THEN RETURN 'C';
    ELSIF score >= 30 THEN RETURN 'D';
    ELSE RETURN 'F';
    END IF;
END;
$$;

CREATE OR REPLACE VIEW report_card AS
SELECT s.id AS student_id, s.full_name, s.form, s.stream,
       sub.name AS subject, r.term, r.score, grade_for(r.score) AS grade
FROM results r
JOIN students s   ON s.id = r.student_id
JOIN subjects sub ON sub.id = r.subject_id;

SELECT subject, score, grade FROM report_card
WHERE full_name = 'Neema Kimaro' AND term = 2
ORDER BY subject;

CREATE MATERIALIZED VIEW class_summary AS
SELECT form, stream, term,
       count(DISTINCT student_id) AS students,
       round(avg(score), 1)       AS average
FROM report_card
GROUP BY form, stream, term;

SELECT * FROM class_summary ORDER BY form DESC, stream, term;
REFRESH MATERIALIZED VIEW class_summary;

-- A SQL function returning a table
CREATE OR REPLACE FUNCTION top_students(p_term int, p_limit int DEFAULT 3)
RETURNS TABLE (full_name text, average numeric)
LANGUAGE sql STABLE
AS $$
    SELECT s.full_name, round(avg(r.score), 1)
    FROM results r JOIN students s ON s.id = r.student_id
    WHERE r.term = p_term
    GROUP BY s.full_name
    ORDER BY 2 DESC
    LIMIT p_limit;
$$;

SELECT * FROM top_students(2);
`,
        },
      ],
      keyPoints: [
        "Views simplify access to complex queries; they always show current data.",
        "Materialized views cache results — remember to refresh them.",
        "Functions keep shared logic (like grading) in one place for every app.",
      ],
      exercise:
        "Create a view `fee_status` with each student's name, form, balance and total paid, plus a status column ('cleared' / 'partial' / 'unpaid'). Write a function `student_average(p_student_id, p_term)` and use it in a query.",
    },
    {
      slug: "jsonb",
      title: "JSON & JSONB",
      summary: "Store flexible data in JSONB, query inside it, index it and build JSON responses.",
      body: [
        "`jsonb` columns store JSON documents in an efficient binary format. They're useful for data whose shape varies — preferences, extra profile fields, data from external APIs — alongside normal columns for the core data.",
        "Read values with `->` (returns JSON) and `->>` (returns text). `@>` tests containment (\"does this document include these keys/values?\"), and a GIN index makes containment queries fast.",
        "PostgreSQL can also build JSON: `jsonb_build_object` and `jsonb_agg` turn query results into nested JSON ready to send from an API — often in a single query.",
      ],
      code: [
        {
          filename: "jsonb.sql",
          lang: "sql",
          source: `
ALTER TABLE students ADD COLUMN profile jsonb NOT NULL DEFAULT '{}';

UPDATE students SET profile = '{"guardian": {"name": "Mama Amina", "phone": "0754000111"}, "clubs": ["debate", "science"], "boarding": true}'
WHERE id = 1;
UPDATE students SET profile = '{"guardian": {"name": "Baba Neema", "phone": "0688000222"}, "clubs": ["science"], "boarding": false}'
WHERE id = 3;

SELECT full_name,
       profile -> 'guardian' ->> 'phone' AS guardian_phone,
       (profile ->> 'boarding')::boolean AS boarding
FROM students
WHERE profile ? 'guardian';

-- Containment: members of the science club
SELECT full_name FROM students WHERE profile @> '{"clubs": ["science"]}';

CREATE INDEX idx_students_profile ON students USING gin (profile);

-- Update one key without replacing the document
UPDATE students SET profile = jsonb_set(profile, '{boarding}', 'false') WHERE id = 1;

-- Build an API-ready JSON document with nested results
SELECT jsonb_build_object(
    'student', s.full_name,
    'form', s.form,
    'results', jsonb_agg(
        jsonb_build_object('subject', sub.code, 'score', r.score)
        ORDER BY sub.code
    )
) AS report
FROM students s
JOIN results r    ON r.student_id = s.id AND r.term = 2
JOIN subjects sub ON sub.id = r.subject_id
WHERE s.id = 1
GROUP BY s.id;
`,
        },
      ],
      keyPoints: [
        "Use jsonb for flexible attributes; keep core, frequently-queried data in columns.",
        "`->` returns JSON, `->>` returns text; `@>` checks containment.",
        "A GIN index speeds up `@>` and `?` queries on jsonb.",
      ],
      exercise:
        "Add a `settings jsonb` column to teachers (e.g. preferred language, notification options). Write queries that find teachers who want SMS notifications, and produce one JSON array of all subjects with their teacher's name and settings.",
    },
    arraysEnumsDomains,
  ],
};
