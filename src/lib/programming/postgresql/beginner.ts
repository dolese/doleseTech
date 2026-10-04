import type { LevelTrack } from "../types";

export const beginner: LevelTrack = {
  intro:
    "Learn databases from scratch with PostgreSQL: install it, create tables, add and change data, ask questions with SELECT, connect tables with keys, and summarise data with aggregates. Lessons build one school database step by step — run them in order.",
  outcomes: [
    "Install PostgreSQL and work in psql",
    "Create tables with the right data types and constraints",
    "Insert, update, delete and query data with SQL",
    "Link tables with primary and foreign keys and summarise data with GROUP BY",
  ],
  lessons: [
    {
      slug: "setup",
      title: "Setting up PostgreSQL & psql",
      summary: "Install PostgreSQL, connect with psql and create your first database.",
      body: [
        "PostgreSQL (\"Postgres\") is a free, open-source relational database used by companies of every size. Data lives in tables of rows and columns, and you talk to it with SQL (Structured Query Language).",
        "Install it from postgresql.org (Windows/macOS installers), with your Linux package manager, or run it in Docker. Managed services such as Neon, Supabase, AWS RDS and Railway host it for you.",
        "`psql` is the command-line client. SQL statements end with a semicolon; commands starting with a backslash are psql helpers: `\\l` lists databases, `\\c` connects to one, `\\dt` lists tables, `\\d table` describes a table and `\\q` quits.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
# Option A: Docker (works on any OS)
docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# Option B: Ubuntu / Debian
sudo apt install postgresql

# Connect and create the course database
psql -h localhost -U postgres
`,
        },
        {
          filename: "psql",
          lang: "sql",
          source: `
CREATE DATABASE school;
\\c school
SELECT version();
SELECT now(), current_user, current_database();
\\l
\\q
`,
        },
      ],
      keyPoints: [
        "PostgreSQL stores data in tables; SQL is how you read and change it.",
        "SQL statements end with `;` — psql waits until it sees one.",
        "Backslash commands (`\\dt`, `\\d`, `\\c`, `\\q`) are psql shortcuts, not SQL.",
      ],
      exercise:
        "Install PostgreSQL, create the `school` database and connect to it. Use `SELECT 2 + 3 * 4;`, `SELECT upper('dolese');` and `SELECT current_date + 30;` to try SQL as a calculator.",
    },
    {
      slug: "tables-and-types",
      title: "Creating Tables & Data Types",
      summary: "CREATE TABLE, choosing data types, defaults, NOT NULL and ALTER TABLE.",
      body: [
        "A table is defined by its columns, and each column has a data type. The most useful: `text` for strings, `integer`/`bigint` for whole numbers, `numeric(12,2)` for money (exact — never use float for money), `boolean`, `date`, and `timestamptz` for moments in time.",
        "Every table should have a primary key — a column that uniquely identifies each row. `bigint GENERATED ALWAYS AS IDENTITY` makes PostgreSQL number rows automatically.",
        "`NOT NULL` makes a column required; `DEFAULT` fills in a value when none is given. Change a table later with `ALTER TABLE`, and remove it with `DROP TABLE`.",
      ],
      code: [
        {
          filename: "tables.sql",
          lang: "sql",
          source: `
CREATE TABLE students (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name   text        NOT NULL,
    form        smallint    NOT NULL,
    gender      char(1),
    birth_date  date,
    email       text,
    fee_balance numeric(12,2) NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE students ADD COLUMN phone text;
ALTER TABLE students ALTER COLUMN gender SET NOT NULL;

\\d students
`,
        },
      ],
      keyPoints: [
        "Pick precise types: `numeric` for money, `timestamptz` for times, `text` for strings.",
        "Every table needs a primary key; identity columns number rows for you.",
        "Use `NOT NULL` and `DEFAULT` to keep data complete.",
      ],
      exercise:
        "Create a `teachers` table with id, full_name (required), subject, phone, hired_on (date) and salary (numeric). Add an `is_active boolean NOT NULL DEFAULT true` column with ALTER TABLE, then inspect it with `\\d teachers`.",
    },
    {
      slug: "insert-update-delete",
      title: "Inserting, Updating & Deleting Data",
      summary: "INSERT rows, see results with RETURNING, change them with UPDATE and remove them with DELETE.",
      body: [
        "`INSERT INTO table (columns) VALUES (...)` adds rows — several at once if you separate them with commas. Columns you leave out get their default value. `RETURNING` shows the stored rows, including generated ids.",
        "`UPDATE ... SET ... WHERE ...` changes existing rows; `DELETE FROM ... WHERE ...` removes them. The `WHERE` clause decides which rows are affected.",
        "Forgetting `WHERE` updates or deletes every row in the table. Write the `WHERE` first, test it with a `SELECT`, and use transactions (covered in Intermediate) for important changes.",
      ],
      code: [
        {
          filename: "data.sql",
          lang: "sql",
          source: `
INSERT INTO students (full_name, form, gender, birth_date, email, fee_balance)
VALUES
    ('Amina Hassan',  4, 'F', '2008-03-14', 'amina@example.com',  0),
    ('Baraka Mushi',  3, 'M', '2009-07-02', NULL,                 150000),
    ('Neema Kimaro',  4, 'F', '2008-11-21', 'neema@example.com',  50000),
    ('Juma Said',     2, 'M', '2010-01-30', 'juma@example.com',   200000),
    ('Rehema Mollel', 1, 'F', '2011-05-09', NULL,                 300000)
RETURNING id, full_name, created_at;

UPDATE students
SET fee_balance = fee_balance - 50000
WHERE full_name = 'Neema Kimaro'
RETURNING full_name, fee_balance;

UPDATE students SET phone = '0712345678' WHERE id = 1;

INSERT INTO students (full_name, form, gender) VALUES ('Test Student', 1, 'M');
DELETE FROM students WHERE full_name = 'Test Student';

SELECT id, full_name, form, fee_balance, phone FROM students ORDER BY id;
`,
        },
      ],
      keyPoints: [
        "Insert many rows in one statement; `RETURNING` shows what was stored.",
        "UPDATE and DELETE affect every row that matches `WHERE` — or every row if it's missing.",
        "Check your `WHERE` with a SELECT before running UPDATE or DELETE.",
      ],
      exercise:
        "Insert three teachers into your `teachers` table. Give one of them a 10% salary increase with UPDATE (`salary = salary * 1.10`), mark another as inactive, and delete a teacher by id. Use RETURNING each time.",
    },
    {
      slug: "querying",
      title: "Querying with SELECT",
      summary: "Filter, sort, limit and compute with WHERE, ORDER BY, LIMIT, LIKE, IN and NULL checks.",
      body: [
        "`SELECT` reads data. List the columns you want (avoid `SELECT *` in application code), filter rows with `WHERE`, sort with `ORDER BY` and take the first rows with `LIMIT`.",
        "Useful filters: `=`, `<>`, `<`, `>=`, `BETWEEN a AND b`, `IN (...)`, `ILIKE 'a%'` (case-insensitive pattern), and combining with `AND`, `OR`, `NOT`.",
        "`NULL` means \"unknown\" — it is never equal to anything, not even another NULL. Test for it with `IS NULL` / `IS NOT NULL`, and replace it with `coalesce(value, fallback)`. You can also compute new columns and rename them with `AS`.",
      ],
      code: [
        {
          filename: "queries.sql",
          lang: "sql",
          source: `
SELECT full_name, form
FROM students
WHERE form = 4
ORDER BY full_name;

SELECT full_name, fee_balance
FROM students
WHERE fee_balance > 0 AND form IN (1, 2, 3)
ORDER BY fee_balance DESC
LIMIT 3;

SELECT full_name FROM students WHERE full_name ILIKE '%ma%';

SELECT full_name, coalesce(email, 'no email') AS email
FROM students
WHERE email IS NULL;

SELECT full_name,
       date_part('year', age(current_date, birth_date)) AS age_years,
       fee_balance / 1000 AS balance_thousands
FROM students
WHERE birth_date BETWEEN '2008-01-01' AND '2009-12-31'
ORDER BY birth_date;

SELECT DISTINCT form FROM students ORDER BY form;
`,
        },
      ],
      keyPoints: [
        "SELECT columns → FROM table → WHERE filter → ORDER BY → LIMIT.",
        "Use `IS NULL`, never `= NULL`; `coalesce` supplies defaults.",
        "Name computed columns with `AS` so results are readable.",
      ],
      exercise:
        "Write queries for: students in Form 3 or 4 with a fee balance; students whose name starts with 'R'; the two youngest students; and every student's name in upper case with their email or 'missing'.",
    },
    {
      slug: "keys-and-relationships",
      title: "Keys, Constraints & Relationships",
      summary: "Link tables with foreign keys and protect data with UNIQUE and CHECK constraints.",
      body: [
        "Relational databases split data into related tables instead of repeating it. A `results` row doesn't copy a student's name — it stores `student_id`, a foreign key that points to `students.id`.",
        "Foreign keys guarantee every result belongs to a real student and subject. `ON DELETE CASCADE` deletes a student's results with the student; `ON DELETE RESTRICT` (the default behaviour) blocks the delete instead.",
        "Constraints are rules the database enforces for every application that uses it: `UNIQUE` prevents duplicates, `CHECK` validates values. Bad data is rejected with an error before it is stored.",
      ],
      code: [
        {
          filename: "relationships.sql",
          lang: "sql",
          source: `
CREATE TABLE subjects (
    id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code text NOT NULL UNIQUE,
    name text NOT NULL
);

CREATE TABLE results (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id bigint   NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    subject_id bigint   NOT NULL REFERENCES subjects (id),
    term       smallint NOT NULL CHECK (term IN (1, 2)),
    score      smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
    UNIQUE (student_id, subject_id, term)
);

INSERT INTO subjects (code, name) VALUES
    ('MATH', 'Basic Mathematics'), ('BIO', 'Biology'), ('ENG', 'English Language');

INSERT INTO results (student_id, subject_id, term, score) VALUES
    (1, 1, 1, 88), (1, 2, 1, 79), (1, 3, 1, 91),
    (2, 1, 1, 42), (2, 2, 1, 55), (2, 3, 1, 61),
    (3, 1, 1, 71), (3, 2, 1, 84), (3, 3, 1, 66),
    (4, 1, 1, 29), (4, 3, 1, 48);

-- Each of these is rejected:
INSERT INTO results (student_id, subject_id, term, score) VALUES (1, 1, 1, 90);   -- duplicate (UNIQUE)
INSERT INTO results (student_id, subject_id, term, score) VALUES (99, 1, 1, 50);  -- no such student (FOREIGN KEY)
INSERT INTO results (student_id, subject_id, term, score) VALUES (2, 1, 2, 120);  -- out of range (CHECK)

SELECT count(*) FROM results;   -- still 11
`,
        },
      ],
      keyPoints: [
        "Store each fact once; connect tables with foreign keys.",
        "Constraints (`UNIQUE`, `CHECK`, `REFERENCES`) stop bad data at the door.",
        "Choose `ON DELETE` behaviour deliberately: CASCADE vs RESTRICT.",
      ],
      exercise:
        "Create an `attendance` table (student_id → students, day date, present boolean) with one row per student per day enforced by UNIQUE. Insert a week of attendance for two students and try inserting a duplicate.",
    },
    {
      slug: "aggregation",
      title: "Summarising Data: Aggregates & GROUP BY",
      summary: "count, sum, avg, min, max, GROUP BY and HAVING — plus a first look at JOIN.",
      body: [
        "Aggregate functions turn many rows into one value: `count(*)`, `sum`, `avg`, `min`, `max`. Use `round(avg(score), 1)` for readable averages.",
        "`GROUP BY` computes aggregates per group — per subject, per form, per term. Every selected column must either be in `GROUP BY` or inside an aggregate.",
        "`WHERE` filters rows before grouping; `HAVING` filters groups after aggregating. To show names instead of ids, `JOIN` the related table — joins are covered fully in the Intermediate track.",
      ],
      code: [
        {
          filename: "aggregates.sql",
          lang: "sql",
          source: `
SELECT count(*) AS students, sum(fee_balance) AS total_owed, max(fee_balance) AS largest
FROM students;

SELECT form, count(*) AS students
FROM students
GROUP BY form
ORDER BY form;

SELECT subject_id,
       count(*)              AS entries,
       round(avg(score), 1)  AS average,
       min(score)            AS lowest,
       max(score)            AS highest
FROM results
GROUP BY subject_id
ORDER BY subject_id;

-- Students averaging 60 or more, with names via JOIN
SELECT s.full_name, round(avg(r.score), 1) AS average
FROM results r
JOIN students s ON s.id = r.student_id
GROUP BY s.full_name
HAVING avg(r.score) >= 60
ORDER BY average DESC;

-- Count of passes (score >= 30) per subject using FILTER
SELECT sub.name,
       count(*) FILTER (WHERE r.score >= 30) AS passed,
       count(*)                              AS sat
FROM results r
JOIN subjects sub ON sub.id = r.subject_id
GROUP BY sub.name
ORDER BY sub.name;
`,
        },
      ],
      keyPoints: [
        "Aggregates collapse rows; `GROUP BY` does it per group.",
        "`WHERE` filters rows before grouping, `HAVING` filters groups after.",
        "`count(*) FILTER (WHERE ...)` counts subsets in one pass.",
      ],
      exercise:
        "Find: the average fee balance per form; the number of students per gender; subjects where the average score is below 65; and each student's best score (show their name using a JOIN).",
    },
  ],
};
