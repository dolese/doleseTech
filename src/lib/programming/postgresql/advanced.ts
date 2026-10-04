import type { LevelTrack } from "../types";
import { writableCtesAndLateral, migrations } from "./more";

export const advanced: LevelTrack = {
  intro:
    "Run PostgreSQL like a professional: tune queries with the right index types, handle concurrency and locking safely, automate with triggers, add full-text search, partition large tables, lock data down with roles and row-level security, and operate databases in production. Uses the school database from the Intermediate track.",
  outcomes: [
    "Diagnose slow queries and choose partial, expression, covering and BRIN indexes",
    "Prevent race conditions with row locks and build a SKIP LOCKED job queue",
    "Use triggers, full-text search and partitioning",
    "Secure data with roles and row-level security; back up, monitor and maintain a database",
  ],
  lessons: [
    {
      slug: "performance-tuning",
      title: "Query Tuning & Index Types",
      summary: "EXPLAIN (ANALYZE, BUFFERS), partial, expression, covering and BRIN indexes.",
      body: [
        "Tuning starts with measurement. `EXPLAIN (ANALYZE, BUFFERS)` shows each step's real time and how many pages were read. Large gaps between estimated and actual rows usually mean outdated statistics — run `ANALYZE`. In production, the `pg_stat_statements` extension shows which queries use the most total time.",
        "B-tree is the default index, but the right variant matters: a partial index covers only the rows you query (`WHERE fee_balance > 0`), an expression index matches a computed condition (`lower(email)`), and a covering index (`INCLUDE`) lets PostgreSQL answer from the index alone (an Index Only Scan).",
        "BRIN indexes are tiny and suit huge, append-only tables where values follow physical order — such as timestamps in logs. GIN indexes serve jsonb, arrays and full-text search.",
      ],
      code: [
        {
          filename: "tuning.sql",
          lang: "sql",
          source: `
-- Partial index: only students who owe fees
CREATE INDEX idx_students_owing ON students (fee_balance) WHERE fee_balance > 0;

-- Expression index: case-insensitive email lookups
CREATE UNIQUE INDEX idx_students_email_lower ON students (lower(email));
SELECT id, full_name FROM students WHERE lower(email) = lower('Amina@Example.com');

-- Covering index: answer from the index alone
CREATE INDEX idx_exam_entries_candidate_cov ON exam_entries (candidate) INCLUDE (score);
VACUUM ANALYZE exam_entries;
EXPLAIN (ANALYZE, BUFFERS)
SELECT candidate, score FROM exam_entries WHERE candidate BETWEEN 'S0100000' AND 'S0100100';
-- Index Only Scan using idx_exam_entries_candidate_cov ... Heap Fetches: 0

-- BRIN index for a large time-ordered table
CREATE TABLE gate_log (
    id        bigint GENERATED ALWAYS AS IDENTITY,
    card_no   int         NOT NULL,
    logged_at timestamptz NOT NULL
);
INSERT INTO gate_log (card_no, logged_at)
SELECT g % 900, timestamptz '2026-01-01' + g * interval '10 seconds'
FROM generate_series(1, 1000000) AS g;

CREATE INDEX idx_gate_log_brin ON gate_log USING brin (logged_at);
ANALYZE gate_log;

EXPLAIN ANALYZE
SELECT count(*) FROM gate_log
WHERE logged_at >= '2026-02-01' AND logged_at < '2026-02-02';

SELECT relname, pg_size_pretty(pg_relation_size(oid)) AS size
FROM pg_class
WHERE relname IN ('gate_log', 'idx_gate_log_brin');
`,
        },
      ],
      keyPoints: [
        "Measure with `EXPLAIN (ANALYZE, BUFFERS)` and `pg_stat_statements` before changing anything.",
        "Partial, expression and covering indexes fit specific query patterns precisely.",
        "BRIN = tiny indexes for huge, naturally ordered tables; GIN for jsonb/arrays/text search.",
      ],
      exercise:
        "Find a query on `exam_entries` that does a sequential scan, design the smallest index that fixes it (consider partial and covering options), and compare index sizes with `pg_relation_size`.",
    },
    {
      slug: "concurrency-and-locking",
      title: "Concurrency, MVCC & Locking",
      summary: "How PostgreSQL handles simultaneous users, lost updates, row locks and SKIP LOCKED queues.",
      body: [
        "PostgreSQL uses MVCC (multi-version concurrency control): writers create new row versions instead of overwriting, so readers never block writers and writers never block readers. Each transaction sees a consistent snapshot.",
        "The classic bug is the lost update: two sessions read a balance, both subtract a payment in application code, and one write overwrites the other. Fix it by updating atomically (`SET balance = balance - x`), or by locking the row first with `SELECT ... FOR UPDATE` when you need to read before writing.",
        "`FOR UPDATE SKIP LOCKED` lets many workers pull jobs from the same table without blocking each other — a reliable job queue with no extra infrastructure. Advisory locks coordinate application-level tasks, such as making sure only one server runs the nightly report.",
      ],
      code: [
        {
          filename: "locking.sql",
          lang: "sql",
          source: `
-- Safe read-then-write: lock the row until COMMIT
BEGIN;
SELECT fee_balance FROM students WHERE id = 5 FOR UPDATE;   -- other writers to row 5 now wait
UPDATE students SET fee_balance = fee_balance - 100000 WHERE id = 5;
INSERT INTO payments (student_id, amount, method) VALUES (5, 100000, 'bank');
COMMIT;

-- A job queue that many workers can share
CREATE TABLE sms_jobs (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phone      text        NOT NULL,
    message    text        NOT NULL,
    status     text        NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sms_jobs_pending ON sms_jobs (created_at) WHERE status = 'pending';

INSERT INTO sms_jobs (phone, message)
SELECT '07' || lpad(g::text, 8, '0'), 'Results for term 2 are out'
FROM generate_series(1, 10) AS g;

-- Each worker runs this; concurrent workers get different jobs, never the same one
BEGIN;
WITH next_jobs AS (
    SELECT id FROM sms_jobs
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT 3
    FOR UPDATE SKIP LOCKED
)
UPDATE sms_jobs j SET status = 'sending'
FROM next_jobs
WHERE j.id = next_jobs.id
RETURNING j.id, j.phone;
-- ... send the SMS messages, then:
COMMIT;

SELECT status, count(*) FROM sms_jobs GROUP BY status ORDER BY status;

-- Advisory lock: only one process runs the nightly job
SELECT pg_try_advisory_lock(42) AS got_lock;   -- true for the first caller, false for others
SELECT pg_advisory_unlock(42);

-- See who is waiting on whom
SELECT pid, state, wait_event_type, left(query, 60) AS query
FROM pg_stat_activity
WHERE datname = current_database();
`,
        },
      ],
      keyPoints: [
        "MVCC: readers and writers don't block each other.",
        "Prevent lost updates with atomic `SET x = x - n` or `SELECT ... FOR UPDATE`.",
        "`FOR UPDATE SKIP LOCKED` turns a table into a safe multi-worker job queue.",
      ],
      exercise:
        "Open two psql sessions. In both, `BEGIN` and `SELECT ... FOR UPDATE` the same student; observe the second one wait until the first commits. Then repeat with `SKIP LOCKED` on `sms_jobs` and confirm each session gets different jobs.",
    },
    writableCtesAndLateral,
    {
      slug: "triggers",
      title: "Triggers & Audit Logs",
      summary: "Run functions automatically on INSERT, UPDATE or DELETE — timestamps and audit trails.",
      body: [
        "A trigger runs a function automatically when rows change. `BEFORE` triggers can modify the row before it is saved (such as setting `updated_at`); `AFTER` triggers react to the saved change (such as writing an audit record).",
        "Inside a trigger function, `NEW` is the incoming row and `OLD` the previous one; `TG_OP` tells you whether it was an INSERT, UPDATE or DELETE. `to_jsonb(row)` captures a whole row for auditing.",
        "Use triggers for rules that must hold no matter which application changes the data. Keep them small and fast — heavy logic in triggers makes every write slower and harder to debug.",
      ],
      code: [
        {
          filename: "triggers.sql",
          lang: "sql",
          source: `
-- 1. Keep updated_at current automatically
ALTER TABLE students ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER students_set_updated_at
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. Audit every change to results
CREATE TABLE audit_log (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name text        NOT NULL,
    operation  text        NOT NULL,
    old_row    jsonb,
    new_row    jsonb,
    changed_by text        NOT NULL DEFAULT current_user,
    changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_changes() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_row, new_row)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
    );
    RETURN NULL;   -- return value is ignored for AFTER triggers
END;
$$;

CREATE TRIGGER results_audit
AFTER INSERT OR UPDATE OR DELETE ON results
FOR EACH ROW EXECUTE FUNCTION audit_changes();

UPDATE results SET score = 45 WHERE student_id = 4 AND subject_id = 1 AND term = 2;

SELECT operation,
       old_row ->> 'score' AS old_score,
       new_row ->> 'score' AS new_score,
       changed_by
FROM audit_log;
`,
        },
      ],
      keyPoints: [
        "BEFORE triggers adjust the row; AFTER triggers react to the saved change.",
        "`NEW`, `OLD` and `TG_OP` describe the change inside the trigger function.",
        "Audit triggers record every change regardless of which app made it.",
      ],
      exercise:
        "Add a trigger on `payments` that automatically reduces the student's `fee_balance` when a payment is inserted. Test it, and think about what should happen if a payment is deleted.",
    },
    {
      slug: "full-text-search",
      title: "Full-Text Search",
      summary: "Search documents by meaning with tsvector, tsquery, ranking, highlighting and GIN.",
      body: [
        "`ILIKE '%word%'` can't use normal indexes, doesn't understand word forms (\"teach\" vs \"teaching\") and can't rank results. PostgreSQL's full-text search can.",
        "A `tsvector` is a document reduced to normalised words (lexemes); a `tsquery` is a search. `websearch_to_tsquery` accepts Google-style input like `photosynthesis -plants \"cell structure\"`. Rank matches with `ts_rank` and highlight them with `ts_headline`.",
        "Store the tsvector in a generated column with a GIN index so searches stay fast as the table grows. `setweight` lets title matches rank above body matches.",
      ],
      code: [
        {
          filename: "search.sql",
          lang: "sql",
          source: `
CREATE TABLE lesson_notes (
    id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title  text NOT NULL,
    body   text NOT NULL,
    search tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', title), 'A') ||
        setweight(to_tsvector('english', body), 'B')
    ) STORED
);

CREATE INDEX idx_lesson_notes_search ON lesson_notes USING gin (search);

INSERT INTO lesson_notes (title, body) VALUES
    ('Photosynthesis', 'Green plants make food using sunlight, water and carbon dioxide in their chloroplasts.'),
    ('Cell Structure', 'Plant and animal cells have a nucleus, cytoplasm and a cell membrane. Plant cells also have chloroplasts.'),
    ('Respiration', 'Cells release energy from food. Aerobic respiration uses oxygen and produces carbon dioxide.'),
    ('Teaching Fractions', 'Teachers can use real objects such as oranges to explain fractions.');

SELECT title,
       round(ts_rank(search, q)::numeric, 3) AS rank,
       ts_headline('english', body, q, 'StartSel=[, StopSel=]') AS snippet
FROM lesson_notes, websearch_to_tsquery('english', 'chloroplasts plants') AS q
WHERE search @@ q
ORDER BY rank DESC;

-- Word forms match: "teach" finds "Teaching" and "Teachers"
SELECT title FROM lesson_notes WHERE search @@ websearch_to_tsquery('english', 'teach');

-- Exclusion and phrases
SELECT title FROM lesson_notes
WHERE search @@ websearch_to_tsquery('english', '"carbon dioxide" -plants');
`,
        },
      ],
      keyPoints: [
        "tsvector = normalised document, tsquery = search; `@@` matches them.",
        "Store the tsvector in a generated column and index it with GIN.",
        "`websearch_to_tsquery`, `ts_rank` and `ts_headline` give users a familiar search experience.",
      ],
      exercise:
        "Add full-text search over the `subjects` and a new `topics` table so a single query searches both, returning the type (subject/topic), the title and the rank, ordered by relevance.",
    },
    {
      slug: "partitioning",
      title: "Table Partitioning",
      summary: "Split huge tables by range so queries and maintenance touch only the data they need.",
      body: [
        "Partitioning splits one logical table into smaller physical tables (partitions) by a key — usually a date range. Queries that filter on the key skip irrelevant partitions entirely (partition pruning).",
        "The biggest win is maintenance: dropping last year's data becomes an instant `DROP TABLE` of one partition instead of a slow `DELETE` of millions of rows. Indexes created on the parent are created on every partition.",
        "Partition only when tables are genuinely large (tens of millions of rows) or have a clear retention policy. Always include a default partition, or create future partitions ahead of time, so inserts never fail.",
      ],
      code: [
        {
          filename: "partitioning.sql",
          lang: "sql",
          source: `
CREATE TABLE attendance (
    student_id bigint  NOT NULL,
    day        date    NOT NULL,
    present    boolean NOT NULL,
    PRIMARY KEY (student_id, day)
) PARTITION BY RANGE (day);

CREATE TABLE attendance_2025 PARTITION OF attendance
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE attendance_2026 PARTITION OF attendance
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE attendance_default PARTITION OF attendance DEFAULT;

INSERT INTO attendance (student_id, day, present)
SELECT s, d::date, (s + extract(doy FROM d)::int) % 9 <> 0
FROM generate_series(1, 300) AS s,
     generate_series(date '2025-01-06', date '2026-11-27', interval '1 day') AS d
WHERE extract(isodow FROM d) < 6;

ANALYZE attendance;

-- Only attendance_2026 is scanned
EXPLAIN SELECT count(*) FROM attendance WHERE day BETWEEN '2026-03-01' AND '2026-03-31';

SELECT tableoid::regclass AS partition, count(*)
FROM attendance
GROUP BY 1
ORDER BY 1;

-- Retire a whole year instantly
ALTER TABLE attendance DETACH PARTITION attendance_2025;
DROP TABLE attendance_2025;
`,
        },
      ],
      keyPoints: [
        "Partition large tables by the key you filter and expire data by — usually time.",
        "Partition pruning skips partitions that can't match the WHERE clause.",
        "Detach/drop a partition to delete old data instantly; keep a default partition.",
      ],
      exercise:
        "Partition a `payments_archive` table by month for 2026 using a loop in a `DO` block to create the 12 partitions. Insert a year of generated payments and use EXPLAIN to confirm a one-month query reads a single partition.",
    },
    {
      slug: "roles-and-row-level-security",
      title: "Roles, Privileges & Row-Level Security",
      summary: "Least-privilege access with roles and GRANT, and per-user row filtering with RLS.",
      body: [
        "Applications should never connect as a superuser. Create roles with only the privileges they need: a read-only role for reports, an app role that can read and write specific tables, and an owner role for migrations.",
        "Group roles (`NOLOGIN`) hold privileges; login roles inherit them by membership. `GRANT` and `REVOKE` control access per table, column or function.",
        "Row-level security (RLS) adds automatic `WHERE` filters per user: once enabled on a table, each role only sees rows its policies allow. A common pattern stores the current user's id in a session setting that policies read with `current_setting`.",
      ],
      code: [
        {
          filename: "security.sql",
          lang: "sql",
          source: `
-- Group roles hold privileges
CREATE ROLE readonly NOLOGIN;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON students, subjects, results TO readonly;

CREATE ROLE teacher_app NOLOGIN;
GRANT USAGE ON SCHEMA public TO teacher_app;
GRANT SELECT ON students, subjects TO teacher_app;
GRANT SELECT, INSERT, UPDATE ON results TO teacher_app;

-- A login role that inherits teacher_app
CREATE ROLE ms_lyimo LOGIN PASSWORD 'change-me' IN ROLE teacher_app;

-- Row-level security: teachers only see results for their own subjects
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

CREATE POLICY teacher_own_subjects ON results
    FOR ALL TO teacher_app
    USING (subject_id IN (
        SELECT id FROM subjects
        WHERE teacher_id = current_setting('app.teacher_id', true)::bigint
    ));

-- Try it: act as the teacher (Ms. Lyimo teaches Biology, teacher id 2)
SET ROLE ms_lyimo;
SET app.teacher_id = '2';
SELECT DISTINCT subject_id FROM results;          -- only 2 (Biology)
UPDATE results SET score = score WHERE subject_id = 1;   -- UPDATE 0: Maths rows are invisible
RESET ROLE;

SELECT count(DISTINCT subject_id) FROM results;   -- the owner still sees everything
`,
        },
      ],
      keyPoints: [
        "Apps connect as least-privilege roles, never as a superuser.",
        "Grant privileges to group roles; add login roles as members.",
        "RLS policies filter rows per role automatically — even for direct SQL access.",
      ],
      exercise:
        "Create a `parent_portal` role and an RLS policy on `students` and `results` so a parent session (with `app.student_id` set) can only read their own child's records. Test it with `SET ROLE`.",
    },
    {
      slug: "operations",
      title: "Backups, Maintenance & Monitoring",
      summary: "pg_dump and restore, migrations, VACUUM, connection pooling and health queries.",
      body: [
        "Back up regularly and test restores — an untested backup is not a backup. `pg_dump -Fc` creates a compressed, flexible dump of one database; `pg_restore` loads it. For large production systems, use continuous archiving / point-in-time recovery (built into most managed services).",
        "Change schemas through versioned migration files (with tools such as Flyway, Alembic, Prisma or plain numbered .sql files), applied the same way in every environment. Avoid long table locks in production: add indexes with `CREATE INDEX CONCURRENTLY`.",
        "Because of MVCC, updates and deletes leave dead row versions; autovacuum cleans them up and refreshes statistics — keep it on. Each connection uses server memory, so put a pooler such as PgBouncer in front of busy apps. Watch active and long-running queries, table bloat and cache hit ratio.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
# Back up one database (custom compressed format)
pg_dump -h localhost -U postgres -Fc -d school -f school_$(date +%F).dump

# Restore into a fresh database
createdb -h localhost -U postgres school_restore
pg_restore -h localhost -U postgres -d school_restore --no-owner school_2026-10-04.dump

# Plain SQL dump of the schema only (useful for code review)
pg_dump -h localhost -U postgres --schema-only -d school > schema.sql
`,
        },
        {
          filename: "monitoring.sql",
          lang: "sql",
          source: `
-- Build an index without blocking writes (cannot run inside a transaction block)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_paid_at ON payments (paid_at);

-- Currently running queries, longest first
SELECT pid, now() - query_start AS running_for, state, left(query, 80) AS query
FROM pg_stat_activity
WHERE state <> 'idle' AND pid <> pg_backend_pid()
ORDER BY running_for DESC NULLS LAST;

-- Cancel or terminate a runaway query (replace 12345 with a real pid)
-- SELECT pg_cancel_backend(12345);
-- SELECT pg_terminate_backend(12345);

-- Dead rows and last (auto)vacuum per table
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 5;

-- Largest tables including indexes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 5;

-- Cache hit ratio (aim for > 99% on a warmed-up OLTP database)
SELECT round(sum(blks_hit) * 100.0 / nullif(sum(blks_hit) + sum(blks_read), 0), 2) AS cache_hit_pct
FROM pg_stat_database;

-- Manual maintenance after a big data load
VACUUM (ANALYZE) exam_entries;
`,
        },
      ],
      keyPoints: [
        "Automate backups and regularly test restoring them.",
        "Apply schema changes through versioned migrations; use `CONCURRENTLY` for indexes in production.",
        "Keep autovacuum on, pool connections, and monitor pg_stat_activity and table statistics.",
      ],
      exercise:
        "Back up your `school` database with `pg_dump -Fc`, restore it into `school_restore`, and verify row counts match with a query on both. Then write a numbered migration (`002_add_guardians.sql`) that adds a guardians table safely.",
    },
    migrations,
  ],
};
