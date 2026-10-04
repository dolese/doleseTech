import type { Practice } from "../../types";
import { writableCtesAndLateral as writableCtesAndLateralPractice, migrations as migrationsPractice } from "./more";

export const advanced: Record<string, Practice> = {
  "performance-tuning": {
    solution: {
      notes: [
        "Take a report that only cares about top scores: \"how many candidates per centre scored 90+ in 2025?\". It scans the whole table. A partial index that stores only rows with `score >= 90` answers it from a small fraction of the table, and is much smaller than a full index on the same columns.",
      ],
      code: [
        {
          filename: "tuning-solution.sql",
          lang: "sql",
          source: `
EXPLAIN ANALYZE
SELECT centre, count(*) FROM exam_entries
WHERE year = 2025 AND score >= 90
GROUP BY centre;
-- (Parallel) Seq Scan on exam_entries ... every row is read

-- Smallest index for this query: only the high-scoring rows
CREATE INDEX idx_exam_entries_top ON exam_entries (year, centre) WHERE score >= 90;
-- For comparison: the same columns without the WHERE clause
CREATE INDEX idx_exam_entries_year_centre ON exam_entries (year, centre);
ANALYZE exam_entries;

EXPLAIN ANALYZE
SELECT centre, count(*) FROM exam_entries
WHERE year = 2025 AND score >= 90
GROUP BY centre;
-- Index Only Scan using idx_exam_entries_top ... much faster

SELECT indexrelid::regclass AS index_name, pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_index
WHERE indexrelid::regclass::text IN ('idx_exam_entries_top', 'idx_exam_entries_year_centre');

DROP INDEX idx_exam_entries_year_centre;   -- keep only the index the query needs
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is a partial index?",
        options: [
          "An index that covers only rows matching a WHERE condition",
          "An index on half the columns",
          "An index that is still being built",
          "An index used only by some users",
        ],
        answer: 0,
        explanation: "Smaller and faster when queries always target the same subset of rows.",
      },
      {
        question: "Which index lets `WHERE lower(email) = lower($1)` use an index?",
        options: [
          "An index on `email`",
          "A GIN index",
          "An expression index on `lower(email)`",
          "No index can help",
        ],
        answer: 2,
        explanation: "The index must match the expression used in the query.",
      },
      {
        question: "Which index type suits a huge, append-only log table filtered by time?",
        options: ["Hash", "BRIN", "GIN", "None"],
        answer: 1,
        explanation: "BRIN stores min/max per block range — tiny, and effective when values follow physical order.",
      },
      {
        question: "Estimated rows differ wildly from actual rows in EXPLAIN ANALYZE. What should you try first?",
        options: [
          "Drop all indexes",
          "Restart PostgreSQL",
          "Rewrite the query in a CTE",
          "Run `ANALYZE` on the table to refresh its statistics",
        ],
        answer: 3,
        explanation: "The planner relies on statistics; stale ones lead to bad plans.",
      },
    ],
  },

  "concurrency-and-locking": {
    solution: {
      notes: [
        "Open two psql windows and run the steps in the order shown. With `FOR UPDATE`, session B's identical lock waits until session A commits. With `FOR UPDATE SKIP LOCKED`, session B doesn't wait — it simply takes the next free jobs, so the two sessions never get the same job.",
      ],
      code: [
        {
          filename: "Session A",
          lang: "sql",
          source: `
-- A1: lock student 5
BEGIN;
SELECT full_name, fee_balance FROM students WHERE id = 5 FOR UPDATE;

-- A2 (after starting B1): finish — session B continues immediately
COMMIT;

-- A3: take three jobs and keep the transaction open
BEGIN;
SELECT id FROM sms_jobs WHERE status = 'pending'
ORDER BY created_at LIMIT 3
FOR UPDATE SKIP LOCKED;          -- e.g. ids 4, 5, 6
`,
        },
        {
          filename: "Session B",
          lang: "sql",
          source: `
-- B1: same lock — this waits (it looks frozen) until A runs COMMIT
BEGIN;
SELECT full_name, fee_balance FROM students WHERE id = 5 FOR UPDATE;
COMMIT;

-- B2 (while A3 is still open): different jobs, no waiting
BEGIN;
SELECT id FROM sms_jobs WHERE status = 'pending'
ORDER BY created_at LIMIT 3
FOR UPDATE SKIP LOCKED;          -- e.g. ids 7, 8, 9
COMMIT;
`,
        },
      ],
    },
    quiz: [
      {
        question: "Under MVCC, does a long-running SELECT block other sessions from updating rows?",
        options: [
          "Yes, always",
          "Only on Fridays",
          "No — readers and writers don't block each other",
          "Only if the table has an index",
        ],
        answer: 2,
        explanation: "Writers create new row versions; readers keep seeing their consistent snapshot.",
      },
      {
        question: "Which statement avoids the lost-update problem when subtracting a payment?",
        options: [
          "`UPDATE students SET fee_balance = fee_balance - 50000 WHERE id = 5;`",
          "Read the balance in the app, subtract, then `UPDATE ... SET fee_balance = <new value>`",
          "Run the update twice",
          "Use `SELECT` without a transaction",
        ],
        answer: 0,
        explanation: "The atomic `x = x - n` reads and writes in one step, so concurrent updates can't overwrite each other.",
      },
      {
        question: "What does `FOR UPDATE SKIP LOCKED` do?",
        options: [
          "Deletes locked rows",
          "Waits for locked rows",
          "Unlocks every row",
          "Locks the selected rows and skips any already locked by others",
        ],
        answer: 3,
        explanation: "That's what lets many workers share one job table safely.",
      },
      {
        question: "What is an advisory lock good for?",
        options: [
          "Coordinating application tasks, such as making sure only one server runs a nightly job",
          "Encrypting a table",
          "Preventing SELECTs",
          "Speeding up indexes",
        ],
        answer: 0,
        explanation: "Advisory locks lock an arbitrary number you choose, not rows.",
      },
    ],
  },

  triggers: {
    solution: {
      notes: [
        "One AFTER trigger handles both cases: a new payment reduces the student's balance, and deleting a payment (for example, one recorded by mistake) adds the amount back. Because it runs inside the same transaction, the payment and the balance can never get out of step.",
      ],
      code: [
        {
          filename: "payment-trigger.sql",
          lang: "sql",
          source: `
CREATE OR REPLACE FUNCTION apply_payment() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE students SET fee_balance = fee_balance - NEW.amount WHERE id = NEW.student_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE students SET fee_balance = fee_balance + OLD.amount WHERE id = OLD.student_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER payments_apply
AFTER INSERT OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION apply_payment();

SELECT fee_balance FROM students WHERE id = 8;                          -- 120000.00
INSERT INTO payments (student_id, amount, method) VALUES (8, 20000, 'cash') RETURNING id;
SELECT fee_balance FROM students WHERE id = 8;                          -- 100000.00

DELETE FROM payments WHERE student_id = 8 AND amount = 20000;
SELECT fee_balance FROM students WHERE id = 8;                          -- 120000.00 again

-- A payment larger than the balance is rejected by the CHECK constraint, and the INSERT is undone
INSERT INTO payments (student_id, amount, method) VALUES (8, 999999, 'cash');
`,
        },
      ],
    },
    quiz: [
      {
        question: "When does a `BEFORE UPDATE ... FOR EACH ROW` trigger run?",
        options: [
          "Once per statement, after it finishes",
          "Before each row is updated, and it can change the row being saved",
          "Only when the update fails",
          "At midnight",
        ],
        answer: 1,
        explanation: "BEFORE triggers can modify `NEW` — e.g. to set `updated_at`.",
      },
      {
        question: "Inside a trigger function, what is `OLD`?",
        options: [
          "The table's previous schema",
          "The previous transaction",
          "The row as it was before an UPDATE or DELETE",
          "The oldest row in the table",
        ],
        answer: 2,
        explanation: "`NEW` is the incoming row; `OLD` is the previous version.",
      },
      {
        question: "What does `TG_OP` tell a trigger function?",
        options: ["The table name", "The user", "The time", "Whether the change was an INSERT, UPDATE or DELETE"],
        answer: 3,
        explanation: "One function can handle several operations by checking `TG_OP`.",
      },
      {
        question: "Why put an audit log in a trigger rather than in application code?",
        options: [
          "It records changes no matter which application or script makes them",
          "Triggers are always faster",
          "Applications can't write to tables",
          "It encrypts the log",
        ],
        answer: 0,
        explanation: "Database-level rules can't be bypassed by forgetting to call the app's code.",
      },
    ],
  },

  "full-text-search": {
    solution: {
      notes: [
        "Each table gets a stored `tsvector` column with a GIN index. A `UNION ALL` combines both searches into one result set with a `type` column, and the outer query orders everything by rank.",
      ],
      code: [
        {
          filename: "search-solution.sql",
          lang: "sql",
          source: `
CREATE TABLE topics (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject_id  bigint NOT NULL REFERENCES subjects (id),
    title       text   NOT NULL,
    description text   NOT NULL,
    search      tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', description), 'B')
    ) STORED
);
CREATE INDEX idx_topics_search ON topics USING gin (search);

ALTER TABLE subjects ADD COLUMN search tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED;
CREATE INDEX idx_subjects_search ON subjects USING gin (search);

INSERT INTO topics (subject_id, title, description) VALUES
    (2, 'Cell Structure', 'Plant and animal cells, organelles and their functions'),
    (2, 'Ecology', 'Living things and their environment, food chains and food webs'),
    (1, 'Linear Programming', 'Maximising and minimising with linear inequalities'),
    (4, 'Organic Chemistry', 'Carbon compounds, hydrocarbons and their reactions');

WITH q AS (SELECT websearch_to_tsquery('english', 'biology or cells') AS query)
SELECT type, title, round(rank::numeric, 3) AS rank
FROM (
    SELECT 'subject' AS type, s.name AS title, ts_rank(s.search, q.query) AS rank
    FROM subjects s, q WHERE s.search @@ q.query
    UNION ALL
    SELECT 'topic', t.title, ts_rank(t.search, q.query)
    FROM topics t, q WHERE t.search @@ q.query
) results
ORDER BY rank DESC;
-- 'biology or cells' matches either word; plain 'biology cells' would require both in the same row
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why is `ILIKE '%teach%'` a poor search engine?",
        options: [
          "It's case-sensitive",
          "It can't use normal indexes, ignores word forms and can't rank results",
          "It only works on numbers",
          "It modifies the data",
        ],
        answer: 1,
        explanation: "Full-text search handles stemming, ranking and indexing.",
      },
      {
        question: "What is a `tsvector`?",
        options: [
          "A list of numbers",
          "A search query",
          "A document reduced to normalised words (lexemes) for searching",
          "A type of index",
        ],
        answer: 2,
        explanation: "The query side is a `tsquery`; `@@` tests whether they match.",
      },
      {
        question: "Which function accepts Google-style input like `photosynthesis -plants \"cell structure\"`?",
        options: ["`websearch_to_tsquery`", "`to_tsvector`", "`ts_headline`", "`plainto_tsvector`"],
        answer: 0,
        explanation: "It understands quotes for phrases, `-` for exclusion and `or`.",
      },
      {
        question: "Why store the tsvector in a generated column with a GIN index?",
        options: [
          "It's required by PostgreSQL",
          "It makes the table smaller",
          "Generated columns can't be searched otherwise",
          "So searches don't recompute vectors for every row and stay fast as the table grows",
        ],
        answer: 3,
        explanation: "The vector is computed once on write and indexed for quick matching.",
      },
    ],
  },

  partitioning: {
    solution: {
      notes: [
        "A `DO` block loops over the twelve months and creates each partition with `format` + `EXECUTE`. After loading a year of generated payments, EXPLAIN shows that a one-month query touches a single partition.",
      ],
      code: [
        {
          filename: "monthly-partitions.sql",
          lang: "sql",
          source: `
CREATE TABLE payments_archive (
    id         bigint      NOT NULL,
    student_id bigint      NOT NULL,
    amount     numeric(12,2) NOT NULL,
    paid_at    timestamptz NOT NULL
) PARTITION BY RANGE (paid_at);

DO $$
DECLARE
    month_start date;
BEGIN
    FOR m IN 1..12 LOOP
        month_start := make_date(2026, m, 1);
        EXECUTE format(
            'CREATE TABLE payments_archive_2026_%s PARTITION OF payments_archive FOR VALUES FROM (%L) TO (%L)',
            lpad(m::text, 2, '0'), month_start, month_start + interval '1 month'
        );
    END LOOP;
END;
$$;

INSERT INTO payments_archive (id, student_id, amount, paid_at)
SELECT g, 1 + g % 500, 10000 + (g % 30) * 5000,
       timestamptz '2026-01-01' + (g % 365) * interval '1 day'
FROM generate_series(1, 100000) AS g;

ANALYZE payments_archive;

EXPLAIN SELECT sum(amount) FROM payments_archive
WHERE paid_at >= '2026-06-01' AND paid_at < '2026-07-01';
-- Only payments_archive_2026_06 is scanned

SELECT count(*) AS partitions FROM pg_inherits WHERE inhparent = 'payments_archive'::regclass;   -- 12
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is partition pruning?",
        options: [
          "Deleting old partitions automatically",
          "Skipping partitions that can't contain rows matching the WHERE clause",
          "Compressing partitions",
          "Merging partitions",
        ],
        answer: 1,
        explanation: "A query for June only reads the June partition.",
      },
      {
        question: "What is the fastest way to remove a whole year of old data from a table partitioned by year?",
        options: [
          "`DELETE ... WHERE year = 2025`",
          "`TRUNCATE` the parent table",
          "`VACUUM FULL`",
          "Detach and drop that year's partition",
        ],
        answer: 3,
        explanation: "Dropping a partition is instant, unlike deleting millions of rows.",
      },
      {
        question: "Why create a DEFAULT partition (or future partitions in advance)?",
        options: [
          "So inserts with values outside every range don't fail",
          "It improves pruning",
          "It is required to create indexes",
          "It doubles performance",
        ],
        answer: 0,
        explanation: "A row that fits no partition is rejected otherwise.",
      },
      {
        question: "When is partitioning usually NOT worth it?",
        options: [
          "For tables with hundreds of millions of rows",
          "When old data is regularly expired",
          "For small tables of a few thousand rows",
          "For time-series logs",
        ],
        answer: 2,
        explanation: "Partitioning adds complexity; it pays off for large tables or clear retention needs.",
      },
    ],
  },

  "roles-and-row-level-security": {
    solution: {
      notes: [
        "The `parent_portal` role may only read the two tables, and the RLS policies add an automatic filter based on the `app.student_id` setting the application sets for each parent's session. `nullif(..., '')` makes an unset value mean \"no rows\" instead of an error.",
      ],
      code: [
        {
          filename: "parent-portal.sql",
          lang: "sql",
          source: `
CREATE ROLE parent_portal NOLOGIN;
GRANT USAGE ON SCHEMA public TO parent_portal;
GRANT SELECT ON students, results, subjects TO parent_portal;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;   -- results already has RLS enabled

CREATE POLICY parent_own_child ON students
    FOR SELECT TO parent_portal
    USING (id = nullif(current_setting('app.student_id', true), '')::bigint);

CREATE POLICY parent_own_results ON results
    FOR SELECT TO parent_portal
    USING (student_id = nullif(current_setting('app.student_id', true), '')::bigint);

-- Act as Neema's parent (student id 3)
SET ROLE parent_portal;
SET app.student_id = '3';
SELECT full_name, form FROM students;                    -- only Neema Kimaro
SELECT count(*) AS result_rows FROM results;             -- only Neema's 6 results
UPDATE students SET form = 1 WHERE id = 3;               -- ERROR: permission denied (read-only role)
RESET ROLE;
RESET app.student_id;
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why shouldn't an application connect as a superuser?",
        options: [
          "Superusers are slower",
          "If the app is compromised, an attacker gets unlimited control of the database",
          "Superusers can't run SELECT",
          "It's only a naming convention",
        ],
        answer: 1,
        explanation: "Least privilege limits the damage of bugs and attacks.",
      },
      {
        question: "What does row-level security (RLS) do?",
        options: [
          "Encrypts rows",
          "Locks rows during updates",
          "Automatically filters which rows each role can see or change, based on policies",
          "Compresses tables",
        ],
        answer: 2,
        explanation: "Policies act like an extra WHERE clause that the role can't bypass.",
      },
      {
        question: "What is a group role created with `NOLOGIN` used for?",
        options: [
          "Holding privileges that login roles inherit through membership",
          "Blocking all users",
          "Running backups",
          "Nothing — it's an error",
        ],
        answer: 0,
        explanation: "Grant privileges once to the group, then add or remove members.",
      },
      {
        question: "Does RLS apply to the table's owner by default?",
        options: [
          "Yes, always",
          "Only for DELETE",
          "Only in transactions",
          "No — owners bypass RLS unless `FORCE ROW LEVEL SECURITY` is set",
        ],
        answer: 3,
        explanation: "That's why the lesson's final query, run as the owner, still sees every subject.",
      },
    ],
  },

  operations: {
    solution: {
      notes: [
        "Back up with `pg_dump -Fc`, restore into a new database, then compare row counts table by table. The migration is a numbered, re-runnable file: it uses `IF NOT EXISTS`, runs in a transaction, and adds the index without blocking writes on a busy server.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pg_dump -h localhost -U postgres -Fc -d school -f school.dump
createdb -h localhost -U postgres school_restore
pg_restore -h localhost -U postgres -d school_restore --no-owner school.dump

for t in students subjects results payments; do
  a=$(psql -h localhost -U postgres -d school -Atc "SELECT count(*) FROM $t")
  b=$(psql -h localhost -U postgres -d school_restore -Atc "SELECT count(*) FROM $t")
  echo "$t: $a vs $b $([ "$a" = "$b" ] && echo OK || echo MISMATCH)"
done
`,
        },
        {
          filename: "002_add_guardians.sql",
          lang: "sql",
          source: `
BEGIN;

CREATE TABLE IF NOT EXISTS guardians (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id bigint NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    full_name  text   NOT NULL,
    phone      text   NOT NULL CHECK (phone ~ '^0[67][0-9]{8}$'),
    relation   text   NOT NULL DEFAULT 'parent'
);

COMMIT;

-- Outside the transaction: build the index without blocking writes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guardians_student ON guardians (student_id);
`,
        },
      ],
    },
    quiz: [
      {
        question: "What makes a backup strategy trustworthy?",
        options: [
          "Taking backups every hour",
          "Storing backups on the same server",
          "Using the largest disk",
          "Regularly testing that backups can actually be restored",
        ],
        answer: 3,
        explanation: "An untested backup is not a backup.",
      },
      {
        question: "Why use `CREATE INDEX CONCURRENTLY` in production?",
        options: [
          "It builds the index without blocking writes to the table",
          "It is faster in every case",
          "It works inside transactions",
          "It creates several indexes at once",
        ],
        answer: 0,
        explanation: "A normal CREATE INDEX blocks inserts and updates until it finishes.",
      },
      {
        question: "What does autovacuum do?",
        options: [
          "Deletes old rows you no longer need",
          "Cleans up dead row versions left by updates and deletes, and refreshes statistics",
          "Backs up the database",
          "Compresses indexes",
        ],
        answer: 1,
        explanation: "MVCC leaves old row versions behind; vacuum reclaims them. Keep it on.",
      },
      {
        question: "Why put PgBouncer in front of a busy application?",
        options: [
          "To encrypt queries",
          "To cache query results",
          "To pool connections, since each PostgreSQL connection uses server memory",
          "To replace backups",
        ],
        answer: 2,
        explanation: "Many app connections share a small pool of real database connections.",
      },
    ],
  },
  "writable-ctes-and-lateral": writableCtesAndLateralPractice,
  "schema-migrations": migrationsPractice,
};
