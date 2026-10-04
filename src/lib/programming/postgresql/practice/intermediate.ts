import type { Practice } from "../../types";
import { designAndNormalisation as designAndNormalisationPractice, upserts as upsertsPractice, arraysEnumsDomains as arraysEnumsDomainsPractice } from "./more";

export const intermediate: Record<string, Practice> = {
  joins: {
    solution: {
      notes: [
        "Start from `subjects` and LEFT JOIN the term-1 results, putting the term filter in the `ON` clause — in `WHERE` it would remove subjects with no results. `count(r.student_id)` counts only matched rows, so Chemistry shows 0. The second query is an anti-join with `NOT EXISTS`.",
      ],
      code: [
        {
          filename: "joins-solution.sql",
          lang: "sql",
          source: `
-- Students who sat each subject in term 1, including subjects nobody sat
SELECT sub.name, count(r.student_id) AS students
FROM subjects sub
LEFT JOIN results r ON r.subject_id = sub.id AND r.term = 1
GROUP BY sub.name
ORDER BY students DESC, sub.name;

-- Students with Maths results but no Biology results
SELECT DISTINCT s.full_name
FROM students s
JOIN results r    ON r.student_id = s.id
JOIN subjects sub ON sub.id = r.subject_id AND sub.code = 'MATH'
WHERE NOT EXISTS (
    SELECT 1
    FROM results r2
    JOIN subjects b ON b.id = r2.subject_id AND b.code = 'BIO'
    WHERE r2.student_id = s.id
);
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which join keeps every row from the left table, even without a match?",
        options: ["`INNER JOIN`", "`LEFT JOIN`", "`CROSS JOIN`", "`SELF JOIN`"],
        answer: 1,
        explanation: "Unmatched left rows get NULLs for the right table's columns.",
      },
      {
        question: "Why put `r.term = 1` in the `ON` clause of a LEFT JOIN rather than in `WHERE`?",
        options: [
          "It runs faster",
          "WHERE doesn't allow numbers",
          "In WHERE it would discard the unmatched rows (where `r.term` is NULL), turning it into an inner join",
          "There is no difference",
        ],
        answer: 2,
        explanation: "Filters on the right table belong in ON when you want to keep unmatched left rows.",
      },
      {
        question: "What does an anti-join find?",
        options: [
          "Rows in one table with no matching row in another",
          "Duplicate rows",
          "Rows that match in both tables",
          "The largest value",
        ],
        answer: 0,
        explanation: "E.g. students who never made a payment: `LEFT JOIN ... WHERE p.id IS NULL` or `NOT EXISTS`.",
      },
      {
        question: "With `LEFT JOIN payments` and `sum(p.amount)`, what does a student with no payments get?",
        options: ["0", "An error", "The average payment", "NULL — wrap it in `coalesce(sum(p.amount), 0)`"],
        answer: 3,
        explanation: "The sum of no rows is NULL; `coalesce` turns it into 0.",
      },
    ],
  },

  "subqueries-and-ctes": {
    solution: {
      notes: [
        "The first query ranks students' averages within each form in a CTE and keeps rank 1. The second builds 14 consecutive days with a recursive CTE, then LEFT JOINs payments so days without payments still appear with 0.",
      ],
      code: [
        {
          filename: "ctes-solution.sql",
          lang: "sql",
          source: `
-- The student with the highest overall average in each form
WITH averages AS (
    SELECT s.form, s.full_name, round(avg(r.score), 1) AS average
    FROM results r
    JOIN students s ON s.id = r.student_id
    GROUP BY s.form, s.full_name
),
ranked AS (
    SELECT a.*, rank() OVER (PARTITION BY form ORDER BY average DESC) AS position
    FROM averages a
)
SELECT form, full_name, average FROM ranked WHERE position = 1 ORDER BY form DESC;

-- Daily payment totals for 14 days, including days with no payments
WITH RECURSIVE days AS (
    SELECT date '2026-01-08' AS day
    UNION ALL
    SELECT day + 1 FROM days WHERE day < date '2026-01-21'
)
SELECT d.day, coalesce(sum(p.amount), 0) AS total
FROM days d
LEFT JOIN payments p ON p.paid_at::date = d.day
GROUP BY d.day
ORDER BY d.day;
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is the main benefit of a CTE (`WITH name AS (...)`)?",
        options: [
          "It always makes queries faster",
          "It stores data permanently",
          "It names intermediate steps, so complex queries read top to bottom",
          "It creates an index",
        ],
        answer: 2,
        explanation: "CTEs are about readability: each step gets a meaningful name.",
      },
      {
        question: "What does `EXISTS (subquery)` test?",
        options: [
          "Whether the subquery returns at least one row",
          "Whether a table exists",
          "Whether a column is NULL",
          "Whether two values are equal",
        ],
        answer: 0,
        explanation: "EXISTS stops at the first matching row — ideal for \"has at least one...\" checks.",
      },
      {
        question: "What are the two parts of a recursive CTE?",
        options: [
          "SELECT and INSERT",
          "A start query, then `UNION ALL` with a query that refers to the CTE itself",
          "Two separate tables",
          "BEGIN and COMMIT",
        ],
        answer: 1,
        explanation: "The anchor provides the first rows; the recursive part keeps adding rows until it returns none.",
      },
      {
        question: "Which is a good use for `WITH RECURSIVE`?",
        options: ["Counting rows", "Renaming a column", "Deleting duplicates", "Walking a hierarchy such as a staff reporting chain"],
        answer: 3,
        explanation: "Recursion follows parent → child links to any depth.",
      },
    ],
  },

  "window-functions": {
    solution: {
      notes: [
        "Average each Form 4 student's term-2 scores in a CTE. `dense_rank` gives class positions without gaps for ties, and `lag` (ordered the same way) fetches the average of the student just above, so the difference shows how far behind each student is.",
      ],
      code: [
        {
          filename: "class-report.sql",
          lang: "sql",
          source: `
WITH term2 AS (
    SELECT s.full_name, round(avg(r.score), 1) AS average
    FROM results r
    JOIN students s ON s.id = r.student_id
    WHERE s.form = 4 AND r.term = 2
    GROUP BY s.full_name
)
SELECT full_name,
       average,
       dense_rank() OVER (ORDER BY average DESC) AS position,
       lag(average) OVER (ORDER BY average DESC) - average AS behind_student_above
FROM term2
ORDER BY position;
`,
        },
      ],
    },
    quiz: [
      {
        question: "How do window functions differ from GROUP BY?",
        options: [
          "They are slower but identical",
          "They only work on numbers",
          "They need an index",
          "They add a computed value to each row without collapsing the rows",
        ],
        answer: 3,
        explanation: "Every row keeps its detail and gains, e.g., its rank or the group average.",
      },
      {
        question: "Scores 90, 90, 85 — what does `rank()` give the 85?",
        options: ["2", "3", "1", "4"],
        answer: 1,
        explanation: "`rank` leaves a gap after ties (1, 1, 3); `dense_rank` would give 2.",
      },
      {
        question: "What does `PARTITION BY subject_id` do inside `OVER (...)`?",
        options: [
          "Splits the rows into separate groups, one per subject, for the calculation",
          "Sorts the result",
          "Deletes duplicate subjects",
          "Creates a table partition",
        ],
        answer: 0,
        explanation: "Ranks and averages are computed separately within each partition.",
      },
      {
        question: "How do you keep only the top 2 per subject using a window function?",
        options: [
          "`WHERE row_number() <= 2`",
          "`HAVING rank() <= 2`",
          "Compute it in a CTE or subquery, then filter on it in the outer query",
          "`LIMIT 2 PER subject`",
        ],
        answer: 2,
        explanation: "Window functions run after WHERE, so you filter their result one level up.",
      },
    ],
  },

  "indexes-and-explain": {
    solution: {
      notes: [
        "Before the index, PostgreSQL scans the whole table. An index on `(year, score)` lets it jump to 2024 and read the highest scores first, so `ORDER BY score DESC LIMIT 10` stops after ten entries.",
        "The `(centre, year)` index is sorted by centre first. A filter on `year` alone can't jump to the right place — it's like looking up a first name in a phone book sorted by surname — so PostgreSQL ignores the index or would have to read all of it.",
      ],
      code: [
        {
          filename: "index-solution.sql",
          lang: "sql",
          source: `
EXPLAIN ANALYZE
SELECT candidate, score FROM exam_entries
WHERE year = 2024 AND score >= 90
ORDER BY score DESC LIMIT 10;
-- Before: (Parallel) Seq Scan on exam_entries ... reads every row

CREATE INDEX idx_exam_entries_year_score ON exam_entries (year, score);

EXPLAIN ANALYZE
SELECT candidate, score FROM exam_entries
WHERE year = 2024 AND score >= 90
ORDER BY score DESC LIMIT 10;
-- After: Index Scan Backward using idx_exam_entries_year_score ... a fraction of a millisecond

-- Does (centre, year) help a filter on year alone? Remove the new index to see.
DROP INDEX idx_exam_entries_year_score;
EXPLAIN SELECT count(*) FROM exam_entries WHERE year = 2024;
-- Seq Scan: the index's first column (centre) is not filtered
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `EXPLAIN ANALYZE` do?",
        options: [
          "Shows the plan without running the query",
          "Runs the query and shows the real plan with actual times and row counts",
          "Creates the best index automatically",
          "Checks the SQL syntax only",
        ],
        answer: 1,
        explanation: "Plain `EXPLAIN` estimates; `EXPLAIN ANALYZE` actually executes and measures.",
      },
      {
        question: "Which columns are indexed automatically?",
        options: [
          "Foreign key columns",
          "Every column",
          "Primary keys and UNIQUE constraints",
          "Columns used in WHERE",
        ],
        answer: 2,
        explanation: "Foreign keys are NOT indexed automatically — add those yourself.",
      },
      {
        question: "An index on `(centre, year)` best supports which filter?",
        options: [
          "`WHERE centre = 'P0420' AND year = 2025`",
          "`WHERE year = 2025` only",
          "`WHERE score > 90`",
          "`WHERE candidate = 'S1'`",
        ],
        answer: 0,
        explanation: "A multi-column index helps filters on its leading column(s).",
      },
      {
        question: "What is a cost of adding an index?",
        options: [
          "Queries become slower",
          "The table can no longer be updated",
          "Data becomes read-only",
          "Every insert and update must also update the index, and it uses disk space",
        ],
        answer: 3,
        explanation: "Add indexes for real query patterns, not \"just in case\".",
      },
    ],
  },

  transactions: {
    solution: {
      notes: [
        "Both changes — moving the student and logging it — sit in one transaction, so they happen together or not at all. In the failing version the log insert breaks a CHECK constraint; after `ROLLBACK`, the SELECT shows the student never moved.",
      ],
      code: [
        {
          filename: "transfers.sql",
          lang: "sql",
          source: `
CREATE TABLE transfers (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id  bigint  NOT NULL REFERENCES students (id),
    from_stream char(1) NOT NULL,
    to_stream   char(1) NOT NULL CHECK (to_stream IN ('A', 'B', 'C')),
    moved_at    timestamptz NOT NULL DEFAULT now()
);

-- Success: Rehema (Form 3, stream A) moves to stream B
BEGIN;
INSERT INTO transfers (student_id, from_stream, to_stream)
SELECT id, stream, 'B' FROM students WHERE full_name = 'Rehema Mollel';
UPDATE students SET stream = 'B' WHERE full_name = 'Rehema Mollel';
COMMIT;

-- Failure on purpose: stream 'Z' breaks the CHECK constraint
BEGIN;
UPDATE students SET stream = 'Z' WHERE full_name = 'Ali Mohamed';
INSERT INTO transfers (student_id, from_stream, to_stream)
SELECT id, 'A', 'Z' FROM students WHERE full_name = 'Ali Mohamed';
-- ERROR: new row for relation "transfers" violates check constraint "transfers_to_stream_check"
ROLLBACK;

SELECT full_name, stream FROM students WHERE full_name IN ('Rehema Mollel', 'Ali Mohamed') ORDER BY full_name;
-- Ali Mohamed | A   (unchanged)  /  Rehema Mollel | B
SELECT count(*) AS transfers_logged FROM transfers;   -- 1
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does a transaction guarantee?",
        options: [
          "Queries run faster",
          "The statements inside succeed together or none of their changes are kept",
          "Only one user can use the database",
          "Data is backed up",
        ],
        answer: 1,
        explanation: "That's atomicity — the A in ACID.",
      },
      {
        question: "After an error inside a transaction, what must you do before running more statements?",
        options: ["Nothing", "Run `COMMIT`", "Restart PostgreSQL", "`ROLLBACK` (or roll back to a savepoint)"],
        answer: 3,
        explanation: "PostgreSQL rejects further statements in a failed transaction until you roll back.",
      },
      {
        question: "What is a `SAVEPOINT` for?",
        options: [
          "Undoing part of a transaction while keeping earlier work",
          "Saving the database to disk",
          "Creating a backup",
          "Ending a transaction",
        ],
        answer: 0,
        explanation: "`ROLLBACK TO SAVEPOINT name` undoes only the changes made after that point.",
      },
      {
        question: "Can other sessions see a transaction's changes before it commits?",
        options: [
          "Yes, immediately",
          "Only administrators can",
          "No — uncommitted changes are invisible to other sessions",
          "Only after a timeout",
        ],
        answer: 2,
        explanation: "Others never see half-finished work.",
      },
    ],
  },

  "views-and-functions": {
    solution: {
      notes: [
        "The view joins each student to their total payments (with `coalesce` for students who paid nothing) and derives the status with `CASE`. The function wraps a parameterised average so any query can call it.",
      ],
      code: [
        {
          filename: "fee-status.sql",
          lang: "sql",
          source: `
CREATE OR REPLACE VIEW fee_status AS
SELECT s.full_name,
       s.form,
       s.fee_balance,
       coalesce(sum(p.amount), 0) AS total_paid,
       CASE
           WHEN s.fee_balance = 0 THEN 'cleared'
           WHEN coalesce(sum(p.amount), 0) > 0 THEN 'partial'
           ELSE 'unpaid'
       END AS status
FROM students s
LEFT JOIN payments p ON p.student_id = s.id
GROUP BY s.id;

SELECT * FROM fee_status ORDER BY status, full_name;

CREATE OR REPLACE FUNCTION student_average(p_student_id bigint, p_term int)
RETURNS numeric
LANGUAGE sql STABLE
AS $$
    SELECT round(avg(score), 1) FROM results WHERE student_id = p_student_id AND term = p_term;
$$;

SELECT full_name, student_average(id, 1) AS term1, student_average(id, 2) AS term2
FROM students
WHERE form = 4
ORDER BY term2 DESC NULLS LAST;
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is a view?",
        options: [
          "A copy of a table",
          "A saved query you can select from like a table",
          "A backup",
          "An index",
        ],
        answer: 1,
        explanation: "A view always runs its query, so it shows current data.",
      },
      {
        question: "How does a materialized view differ from a normal view?",
        options: [
          "It stores the result on disk and must be refreshed to update",
          "It is always up to date",
          "It can't be queried",
          "It only works with JSON",
        ],
        answer: 0,
        explanation: "Great for expensive reports — run `REFRESH MATERIALIZED VIEW` when data changes.",
      },
      {
        question: "Why mark `grade_for(score)` as `IMMUTABLE`?",
        options: [
          "It prevents anyone from changing the function",
          "It makes the function private",
          "The same input always gives the same output, so PostgreSQL can optimise calls",
          "It is required for PL/pgSQL",
        ],
        answer: 2,
        explanation: "Immutable functions can even be used in indexes.",
      },
      {
        question: "What does PL/pgSQL add compared with plain SQL functions?",
        options: ["Faster storage", "JSON support", "Joins", "Variables, IF/ELSE and loops"],
        answer: 3,
        explanation: "PL/pgSQL is PostgreSQL's procedural language.",
      },
    ],
  },

  jsonb: {
    solution: {
      notes: [
        "The settings column holds each teacher's preferences. The `@>` containment check finds teachers whose notifications include SMS (fast with a GIN index), and `jsonb_agg` + `jsonb_build_object` produce the whole JSON array in one query.",
      ],
      code: [
        {
          filename: "teacher-settings.sql",
          lang: "sql",
          source: `
ALTER TABLE teachers ADD COLUMN settings jsonb NOT NULL DEFAULT '{}';

UPDATE teachers SET settings = '{"language": "sw", "notify": ["sms", "email"]}' WHERE full_name = 'Mr. Mwakyusa';
UPDATE teachers SET settings = '{"language": "en", "notify": ["email"]}'        WHERE full_name = 'Ms. Lyimo';
UPDATE teachers SET settings = '{"language": "sw", "notify": ["sms"]}'          WHERE full_name = 'Mrs. Mrema';

CREATE INDEX idx_teachers_settings ON teachers USING gin (settings);

-- Teachers who want SMS notifications
SELECT full_name, settings ->> 'language' AS language
FROM teachers
WHERE settings @> '{"notify": ["sms"]}'
ORDER BY full_name;

-- One JSON array of all subjects with their teacher
SELECT jsonb_agg(
    jsonb_build_object(
        'subject', sub.name,
        'teacher', t.full_name,
        'settings', t.settings
    ) ORDER BY sub.name
) AS subjects
FROM subjects sub
LEFT JOIN teachers t ON t.id = sub.teacher_id;
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is the difference between `->` and `->>` on a jsonb column?",
        options: [
          "`->` returns JSON; `->>` returns text",
          "There is none",
          "`->>` is for arrays only",
          "`->` modifies the document",
        ],
        answer: 0,
        explanation: "Use `->>` when you want a plain value to compare or display.",
      },
      {
        question: "What does `profile @> '{\"clubs\": [\"science\"]}'` check?",
        options: [
          "That clubs equals exactly [\"science\"]",
          "That profile has no clubs",
          "That the profile contains that structure — its clubs include \"science\"",
          "That the column is not NULL",
        ],
        answer: 2,
        explanation: "`@>` is containment; extra keys or array items are allowed.",
      },
      {
        question: "Which index type speeds up `@>` queries on jsonb?",
        options: ["B-tree", "Hash", "BRIN", "GIN"],
        answer: 3,
        explanation: "GIN indexes the keys and values inside each document.",
      },
      {
        question: "When is jsonb a good choice?",
        options: [
          "For every column, to stay flexible",
          "For flexible attributes whose shape varies, alongside normal columns for core data",
          "For money values",
          "For primary keys",
        ],
        answer: 1,
        explanation: "Keep frequently-queried, structured data in real columns with constraints.",
      },
    ],
  },
  "design-and-normalisation": designAndNormalisationPractice,
  "upserts": upsertsPractice,
  "arrays-enums-domains": arraysEnumsDomainsPractice,
};
