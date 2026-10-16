At the end of Chapter 3 the results page could calculate, check and remember — but only in one browser on one computer. A school needs more than that. Every teacher must enter marks into the same place, the head teacher must see them from the office, and nothing must be lost when a laptop is stolen or a browser is cleared. That place is a *database*. In this chapter you design the database for the results system, build it in PostgreSQL, fill it with the class from Chapter 3, and learn to ask it questions in SQL — the language every database understands.

By the end of this chapter you will be able to:

- explain what a database does that a spreadsheet or the browser cannot;
- design tables for students, subjects, exams and marks, and say why they are separate;
- install PostgreSQL and run SQL in pgAdmin;
- create tables with rules that stop bad data getting in;
- add, read, change and delete data;
- join tables, count, average, group, grade and rank in SQL;
- save a question as a view that other programs can use;
- make and restore a backup.

You will keep the files for this chapter in the `database` folder of your `results-system` project.

## 4.1 Why a database

Many schools keep marks in a spreadsheet, and for one teacher that works. Problems start when the work is shared:

| Problem | Spreadsheet | Database |
|---|---|---|
| Two teachers enter marks at the same time | Two copies of the file, and someone's work is lost | Both write to the same database, safely |
| A mark of `150` or `7O` (with a letter O) is typed | Accepted without complaint | Refused, because a rule says marks are whole numbers from 0 to 100 |
| The same student appears twice | Easy to do, hard to notice | Refused, because admission numbers must be unique |
| Questions such as "who is below 45 in two subjects?" | Filters and formulas, redone every time | One query, saved and run again in a second |
| Thousands of students over many years | The file becomes slow and fragile | Built for millions of rows |
| Who may see or change what | Whoever has the file has everything | Each user has only the permissions they need |

A database is a program that keeps data organised, checks it against your rules, and answers questions about it. The database you will use is *PostgreSQL* (often just "Postgres"): free, open-source, and trusted by banks, governments and some of the largest websites in the world. ResultsPortal, the results system behind the examples in this book, runs on PostgreSQL.

### Where the database lives

A database usually runs on a server, and other programs connect to it:

```text
 Teacher's browser  ──►  Web server program  ──►  PostgreSQL database
  (HTML, CSS, JS)        (checks who you are,       (students, subjects,
                          what you may do)            exams, marks)
```

The browser never talks to the database directly. If it could, anyone who opened the page could read or delete every mark. A program on the server sits in between and only allows what each person is permitted to do. You will meet that middle program in the coming chapters; in this chapter you talk to the database yourself, as its owner.

## 4.2 Tables, rows and columns

A database keeps data in *tables*, which look like the tables you built in Chapter 2:

| id | admission_no | name | sex |
|---|---|---|---|
| 1 | MSS/2023/001 | Amina Juma | F |
| 2 | MSS/2023/002 | Baraka Mushi | M |
| 3 | MSS/2023/003 | Neema Kileo | F |

- Each **column** holds one kind of information, and has a name and a *type*. Every value in the `name` column is text; every value in `id` is a whole number.
- Each **row** is one thing — here, one student. A row is also called a *record*.
- One column, here `id`, is the **primary key**: a value that is different for every row, so that each row can be found without any doubt. Two students may both be called Juma Hassan; they will never share an id.

## 4.3 Designing the results database

The obvious design copies the web page: one big table with a column for each subject.

| name | sex | mathematics | english | biology |
|---|---|---|---|---|
| Amina Juma | F | 78 | 85 | 81 |

It looks simple, but it breaks as soon as the school uses it. When the school adds Kiswahili, the table itself must change. There is nowhere to keep Term 2 except a second copy of every student. And a student's name is typed again in every table that mentions them, so a spelling correction must be made in many places — and will be missed in one.

The better design gives each *kind of thing* its own table, and connects them:

```text
 students                 exams               subjects
 ────────────             ─────────           ─────────
 id  ◄──────────┐         id  ◄──────┐        id  ◄──────┐
 admission_no   │         name       │        name       │
 name           │         year       │                   │
 sex            │                    │                   │
                │   marks            │                   │
                │   ─────────        │                   │
                └── student_id       │                   │
                    exam_id ─────────┘                   │
                    subject_id ──────────────────────────┘
                    mark
```

- `students`, `subjects` and `exams` each describe one kind of thing, once.
- `marks` connects them. Each row says: *in this exam, this student got this mark in this subject*. It stores ids, not names.
- A new subject is one new row in `subjects`. A new exam is one new row in `exams`. A corrected name is changed in one place, and every result shows the correction.

A column that holds the id of a row in another table is called a *foreign key*. `marks.student_id` is a foreign key pointing at `students.id`. The arrows in the diagram are these connections, called *relationships*.

> **Remember:** Store each fact once. If you find yourself typing the same information into two places, the design probably needs another table.

## 4.4 Installing PostgreSQL

1. Open **postgresql.org/download/windows** and follow the link to download the installer. Choose the newest version.
2. Run the installer and accept the defaults. It installs the database server, *pgAdmin* (a program for working with your databases) and the *SQL Shell*, also called *psql*.
3. When asked for a password for the `postgres` user, choose a new one and write it down somewhere safe. This user can do anything to every database on your computer. As Chapter 7 explained, never reuse a password from another account.
4. Keep the port number `5432`. At the end, you can untick **Stack Builder**; you do not need it.

The download is a few hundred megabytes, so use Wi-Fi if you can.

### Creating the database

Open **pgAdmin**. The first time, it asks you to set a *master password* that protects the passwords it remembers. Then:

1. In the panel on the left, open **Servers**, then **PostgreSQL**, and type the `postgres` password from the installer.
2. Right-click **Databases** and choose **Create → Database…**. Name it `mwangaza` and click **Save**.
3. Click the new `mwangaza` database, then choose **Tools → Query Tool**.

The Query Tool is where you type SQL. To run what you typed, press `F5` or click the ▶ button. If the editor contains several statements, pgAdmin runs them all and shows the result of the last one; to run just one, select it with the mouse first and then press `F5`.

This book shows results the way the SQL Shell prints them. pgAdmin shows the same rows in a grid.

## 4.5 Creating tables

SQL — usually said "sequel" or "S-Q-L" — is the language for working with databases. A *statement* is one instruction, and it ends with a semicolon. SQL does not care about capital letters or line breaks: by custom, SQL words are written in capitals and your own names in lowercase.

Create the first table:

```sql
CREATE TABLE students (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admission_no  TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  sex           TEXT NOT NULL CHECK (sex IN ('F', 'M'))
);
```

```output
CREATE TABLE
```

Each line inside the brackets is a column: its name, its type, and any rules.

| Type | Holds | Example |
|---|---|---|
| `INTEGER` | Whole numbers | `78`, `2026` |
| `NUMERIC` | Exact decimals | `81.3` |
| `TEXT` | Text of any length | `'Amina Juma'` |
| `DATE` | A date | `'2026-03-14'` |
| `BOOLEAN` | True or false | `true` |

The rules, called *constraints*, are what make a database trustworthy:

| Constraint | Means |
|---|---|
| `PRIMARY KEY` | This column identifies each row: every value is different, and none is empty |
| `GENERATED ALWAYS AS IDENTITY` | The database numbers the rows itself: 1, 2, 3… |
| `NOT NULL` | A value must be given. `NULL` means "no value" |
| `UNIQUE` | No two rows may have the same value |
| `CHECK (…)` | The value must pass this test |
| `REFERENCES table (column)` | The value must exist in that other table — a foreign key |

In SQL, text values go in **single** quotes: `'F'`. Double quotes mean something else, so do not use them for text.

Now the other three tables:

```sql
CREATE TABLE subjects (
  id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE exams (
  id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL,
  year  INTEGER NOT NULL,
  UNIQUE (name, year)
);

CREATE TABLE marks (
  exam_id     INTEGER NOT NULL REFERENCES exams (id),
  student_id  INTEGER NOT NULL REFERENCES students (id),
  subject_id  INTEGER NOT NULL REFERENCES subjects (id),
  mark        INTEGER NOT NULL CHECK (mark BETWEEN 0 AND 100),
  PRIMARY KEY (exam_id, student_id, subject_id)
);
```

```output
CREATE TABLE

CREATE TABLE

CREATE TABLE
```

Two details deserve a closer look:

- `UNIQUE (name, year)` in `exams` allows a "Term 1 examination" in 2026 *and* in 2027, but not two in the same year.
- The primary key of `marks` is made of three columns together. A student can have many marks, but only **one** mark for each subject in each exam. Entering the same mark twice is impossible.

In pgAdmin, open **mwangaza → Schemas → public → Tables** and refresh (right-click, **Refresh**) to see your four tables.

## 4.6 Adding data

`INSERT` adds rows. Name the columns, then give the values in the same order:

```sql
INSERT INTO students (admission_no, name, sex) VALUES
  ('MSS/2023/001', 'Amina Juma', 'F'),
  ('MSS/2023/002', 'Baraka Mushi', 'M'),
  ('MSS/2023/003', 'Neema Kileo', 'F'),
  ('MSS/2023/004', 'Juma Hassan', 'M'),
  ('MSS/2023/005', 'Rehema Mollel', 'F');
```

```output
INSERT 0 5
```

`INSERT 0 5` means five rows were added. (The `0` is left over from old versions of PostgreSQL; ignore it.) We did not give an `id`: the database chose it. Ask to see the table:

```sql
SELECT * FROM students;
```

```output
 id | admission_no |     name      | sex
----+--------------+---------------+-----
  1 | MSS/2023/001 | Amina Juma    | F
  2 | MSS/2023/002 | Baraka Mushi  | M
  3 | MSS/2023/003 | Neema Kileo   | F
  4 | MSS/2023/004 | Juma Hassan   | M
  5 | MSS/2023/005 | Rehema Mollel | F
(5 rows)
```

Now the subjects and the exam:

```sql
INSERT INTO subjects (name) VALUES
  ('Mathematics'),
  ('English'),
  ('Biology');

INSERT INTO exams (name, year) VALUES
  ('Term 1 examination', 2026);
```

```output
INSERT 0 3

INSERT 0 1
```

The subjects are numbered 1 to 3 in the order they were added, and the exam is number 1. The marks refer to everything by these numbers:

```sql
-- exam, student, subject, mark
INSERT INTO marks (exam_id, student_id, subject_id, mark) VALUES
  (1, 1, 1, 78), (1, 1, 2, 85), (1, 1, 3, 81),
  (1, 2, 1, 52), (1, 2, 2, 61), (1, 2, 3, 47),
  (1, 3, 1, 91), (1, 3, 2, 88), (1, 3, 3, 94),
  (1, 4, 1, 34), (1, 4, 2, 49), (1, 4, 3, 38),
  (1, 5, 1, 66), (1, 5, 2, 72), (1, 5, 3, 59);
```

```output
INSERT 0 15
```

The first row reads: in exam 1, student 1 (Amina Juma) got 78 in subject 1 (Mathematics). These are the same fifteen marks as in Chapters 2 and 3. A line starting with `--` is a comment, as `//` is in JavaScript.

## 4.7 Asking questions

`SELECT` asks a question. Its general shape is:

```text
SELECT  which columns
FROM    which table
WHERE   which rows
ORDER BY in what order;
```

Only `SELECT` and `FROM` are required. The girls in the class, in alphabetical order:

```sql
SELECT name, admission_no
FROM students
WHERE sex = 'F'
ORDER BY name;
```

```output
     name      | admission_no
---------------+--------------
 Amina Juma    | MSS/2023/001
 Neema Kileo   | MSS/2023/003
 Rehema Mollel | MSS/2023/005
(3 rows)
```

`*` means "every column", which is handy for a quick look but wasteful in real programs; name the columns you need. In `WHERE`, a single `=` compares — unlike JavaScript, SQL has no `==` or `===`. You can combine conditions with `AND`, `OR` and `NOT`, and compare with `<`, `>`, `<=`, `>=` and `<>` (not equal).

Every mark below 45, lowest first:

```sql
SELECT student_id, subject_id, mark
FROM marks
WHERE mark < 45
ORDER BY mark;
```

```output
 student_id | subject_id | mark
------------+------------+------
          4 |          1 |   34
          4 |          3 |   38
(2 rows)
```

The answer is right, but hard to read: who is student 4, and what is subject 3? Section 4.9 fixes that.

Some other useful pieces:

| You write | It means |
|---|---|
| `ORDER BY mark DESC` | Largest first (*descending*); `ASC`, smallest first, is the default |
| `LIMIT 3` | Only the first three rows of the answer |
| `WHERE mark BETWEEN 45 AND 64` | From 45 to 64, including both ends |
| `WHERE name LIKE 'J%'` | Names starting with J; `%` means "anything" |
| `WHERE sex IN ('F', 'M')` | Any of the listed values |

## 4.8 Rules that protect the data

The constraints you wrote in section 4.5 are not decoration. Try to break them. A mark of 150:

```sql
INSERT INTO marks (exam_id, student_id, subject_id, mark) VALUES (1, 4, 3, 150);
```

```output
ERROR:  new row for relation "marks" violates check constraint "marks_mark_check"
DETAIL:  Failing row contains (1, 4, 3, 150).
```

A second Mathematics mark for Amina in the same exam:

```sql
INSERT INTO marks (exam_id, student_id, subject_id, mark) VALUES (1, 1, 1, 80);
```

```output
ERROR:  duplicate key value violates unique constraint "marks_pkey"
DETAIL:  Key (exam_id, student_id, subject_id)=(1, 1, 1) already exists.
```

A mark for student 9, who does not exist:

```sql
INSERT INTO marks (exam_id, student_id, subject_id, mark) VALUES (1, 9, 1, 50);
```

```output
ERROR:  insert or update on table "marks" violates foreign key constraint "marks_student_id_fkey"
DETAIL:  Key (student_id)=(9) is not present in table "students".
```

A new student with an admission number that is already taken:

```sql
INSERT INTO students (admission_no, name, sex) VALUES ('MSS/2023/001', 'Rose Mwakalinga', 'F');
```

```output
ERROR:  duplicate key value violates unique constraint "students_admission_no_key"
DETAIL:  Key (admission_no)=(MSS/2023/001) already exists.
```

Each time, the database refused and said exactly why — and nothing was saved. Read error messages slowly: the first line says what rule was broken, and `DETAIL` shows the data that broke it.

These rules hold however the data arrives: from pgAdmin, from a web page, from a Python program, or from a mistake in someone's code years from now. That is why the most important checks belong in the database, even when the web page checks first.

## 4.9 Joining tables

A *join* combines rows from several tables, matching them by their keys:

```sql
SELECT s.name AS student, sub.name AS subject, m.mark
FROM marks AS m
JOIN students AS s ON s.id = m.student_id
JOIN subjects AS sub ON sub.id = m.subject_id
WHERE m.mark < 45
ORDER BY m.mark;
```

```output
   student   |   subject   | mark
-------------+-------------+------
 Juma Hassan | Mathematics |   34
 Juma Hassan | Biology     |   38
(2 rows)
```

Read it from the `FROM` line:

- Start with `marks`, and call it `m` for short (`AS m`).
- For each mark, find the student whose `id` equals the mark's `student_id`, and call that table `s`.
- In the same way, find the subject, and call it `sub`.
- Now every column of all three tables is available. `s.name` is the student's name, `sub.name` the subject's name; `AS student` and `AS subject` give the result columns clearer headings.

Both `students` and `subjects` have a column called `name`, which is why the short table names are needed: they say *which* `name`.

## 4.10 Counting and averages

*Aggregate functions* turn many rows into one answer:

```sql
SELECT COUNT(*) AS marks,
       MIN(mark) AS lowest,
       MAX(mark) AS highest,
       ROUND(AVG(mark), 1) AS average
FROM marks;
```

```output
 marks | lowest | highest | average
-------+--------+---------+---------
    15 |     34 |      94 |    66.3
(1 row)
```

`ROUND(…, 1)` rounds to one decimal place, like `roundTo1` in Chapter 3. The average of all fifteen marks is 66.3 — the class average on your web page.

### Groups

`GROUP BY` makes one answer for each group of rows instead of one for the whole table. The average of each student:

```sql
SELECT s.name, ROUND(AVG(m.mark), 1) AS average
FROM marks AS m
JOIN students AS s ON s.id = m.student_id
GROUP BY s.id
ORDER BY average DESC;
```

```output
     name      | average
---------------+---------
 Neema Kileo   |    91.0
 Amina Juma    |    81.3
 Rehema Mollel |    65.7
 Baraka Mushi  |    53.3
 Juma Hassan   |    40.3
(5 rows)
```

PostgreSQL knows that one `id` means one student, so grouping by `s.id` lets you show `s.name` too. Compare the averages with Chapter 3's page: they are the same.

The same idea for subjects:

```sql
SELECT sub.name AS subject,
       ROUND(AVG(m.mark), 1) AS average,
       MAX(m.mark) AS highest,
       MIN(m.mark) AS lowest
FROM marks AS m
JOIN subjects AS sub ON sub.id = m.subject_id
GROUP BY sub.id
ORDER BY average DESC;
```

```output
   subject   | average | highest | lowest
-------------+---------+---------+--------
 English     |    71.0 |      88 |     49
 Mathematics |    64.2 |      91 |     34
 Biology     |    63.8 |      94 |     38
(3 rows)
```

A head teacher can see at once that Biology has the lowest average this term.

### Choosing groups

`WHERE` chooses rows *before* they are grouped. To choose groups by their totals or averages, use `HAVING`, which comes after `GROUP BY`. Students whose average is below 45:

```sql
SELECT s.name, ROUND(AVG(m.mark), 1) AS average
FROM marks AS m
JOIN students AS s ON s.id = m.student_id
GROUP BY s.id
HAVING AVG(m.mark) < 45;
```

```output
    name     | average
-------------+---------
 Juma Hassan |    40.3
(1 row)
```

## 4.11 Grades and positions

`CASE` makes a decision inside a query, like `if` and `else` in JavaScript. It checks each `WHEN` from the top and uses the first one that is true:

```sql
SELECT s.name,
       ROUND(AVG(m.mark), 1) AS average,
       CASE
         WHEN ROUND(AVG(m.mark), 1) >= 75 THEN 'A'
         WHEN ROUND(AVG(m.mark), 1) >= 65 THEN 'B'
         WHEN ROUND(AVG(m.mark), 1) >= 45 THEN 'C'
         WHEN ROUND(AVG(m.mark), 1) >= 30 THEN 'D'
         ELSE 'F'
       END AS grade
FROM marks AS m
JOIN students AS s ON s.id = m.student_id
GROUP BY s.id
ORDER BY s.id;
```

```output
     name      | average | grade
---------------+---------+-------
 Amina Juma    |    81.3 | A
 Baraka Mushi  |    53.3 | C
 Neema Kileo   |    91.0 | A
 Juma Hassan   |    40.3 | D
 Rehema Mollel |    65.7 | B
(5 rows)
```

Positions use a *window function*. `RANK()` numbers the rows in the order you give it, and rows that tie share a rank, with the next rank skipped — 1, 2, 2, 4, exactly the rule you wrote in `positionOf` in Chapter 3:

```sql
SELECT s.name,
       ROUND(AVG(m.mark), 1) AS average,
       RANK() OVER (ORDER BY ROUND(AVG(m.mark), 1) DESC) AS position
FROM marks AS m
JOIN students AS s ON s.id = m.student_id
GROUP BY s.id
ORDER BY s.id;
```

```output
     name      | average | position
---------------+---------+----------
 Amina Juma    |    81.3 |        2
 Baraka Mushi  |    53.3 |        4
 Neema Kileo   |    91.0 |        1
 Juma Hassan   |    40.3 |        5
 Rehema Mollel |    65.7 |        3
(5 rows)
```

The word `OVER` is what makes it a window function: instead of squashing rows together like `AVG`, it looks across all of them and gives each row its own answer.

## 4.12 Functions and views

The grade rule is now written inside a query. Other queries will need it too, and Chapter 3 taught the cure for repeating a rule: put it in a function. SQL has functions as well:

```sql
-- The grade for a mark or an average: the same rule as gradeFor in Chapter 3.
CREATE OR REPLACE FUNCTION grade_for(mark NUMERIC) RETURNS TEXT
LANGUAGE SQL IMMUTABLE
RETURN CASE
  WHEN mark >= 75 THEN 'A'
  WHEN mark >= 65 THEN 'B'
  WHEN mark >= 45 THEN 'C'
  WHEN mark >= 30 THEN 'D'
  ELSE 'F'
END;
```

```output
CREATE FUNCTION
```

- `grade_for(mark NUMERIC)` is the name and the parameter, as in JavaScript.
- `RETURNS TEXT` says what kind of value comes back.
- `IMMUTABLE` promises that the same mark always gives the same grade, which lets PostgreSQL use the function efficiently.
- `CREATE OR REPLACE` means you can run it again after changing the rule.

Test the edges, just as you did in Chapter 3:

```sql
SELECT grade_for(75), grade_for(74.9), grade_for(30), grade_for(29);
```

```output
 grade_for | grade_for | grade_for | grade_for
-----------+-----------+-----------+-----------
 A         | B         | D         | F
(1 row)
```

Every column of the answer is called `grade_for`, because no heading was given; `AS` would name them.

### Views

The question "what is each student's average, grade and position?" will be asked by the web page, by report cards, and by the Python program in Chapter 5. Rather than copying the query into each of them, save it in the database as a *view*: a named query that you can use exactly like a table.

```sql
-- One row for each student in each exam: average, grade and position.
CREATE OR REPLACE VIEW student_results AS
SELECT
  m.exam_id,
  s.id AS student_id,
  s.name,
  s.sex,
  ROUND(AVG(m.mark), 1) AS average,
  grade_for(ROUND(AVG(m.mark), 1)) AS grade,
  RANK() OVER (PARTITION BY m.exam_id ORDER BY ROUND(AVG(m.mark), 1) DESC) AS position
FROM marks AS m
JOIN students AS s ON s.id = m.student_id
GROUP BY m.exam_id, s.id;
```

```output
CREATE VIEW
```

Two things are new. The view groups by exam as well as by student, so that when Term 2 is added, each student gets one row per exam. And `PARTITION BY m.exam_id` ranks each exam separately: positions in Term 2 are not mixed with positions in Term 1.

Now the whole results table is one short question:

```sql
SELECT name, average, grade, position
FROM student_results
WHERE exam_id = 1
ORDER BY position;
```

```output
     name      | average | grade | position
---------------+---------+-------+----------
 Neema Kileo   |    91.0 | A     |        1
 Amina Juma    |    81.3 | A     |        2
 Rehema Mollel |    65.7 | B     |        3
 Baraka Mushi  |    53.3 | C     |        4
 Juma Hassan   |    40.3 | D     |        5
(5 rows)
```

A view stores the *question*, not the answers. Change a mark, and the next time anyone reads `student_results`, the averages, grades and positions are already up to date. Views can be grouped and filtered like any table — how many students got each grade:

```sql
SELECT grade, COUNT(*) AS students
FROM student_results
WHERE exam_id = 1
GROUP BY grade
ORDER BY grade;
```

```output
 grade | students
-------+----------
 A     |        2
 B     |        1
 C     |        1
 D     |        1
(4 rows)
```

## 4.13 Changing data safely

`UPDATE` changes rows that already exist. Juma Hassan's Biology paper was re-marked, and his mark is 58, not 38:

```sql
UPDATE marks
SET mark = 58
WHERE exam_id = 1 AND student_id = 4 AND subject_id = 3;
```

```output
UPDATE 1
```

`UPDATE 1` means one row was changed. Check the result through the view:

```sql
SELECT name, average, grade, position
FROM student_results
WHERE exam_id = 1 AND name = 'Juma Hassan';
```

```output
    name     | average | grade | position
-------------+---------+-------+----------
 Juma Hassan |    47.0 | C     |        5
(1 row)
```

His average rose from 40.3 to 47.0 and his grade from D to C — the same change you made on the web page in Chapter 3, now in the database every teacher shares.

`DELETE` removes rows. It uses `WHERE` in the same way:

```text
DELETE FROM marks WHERE exam_id = 1 AND student_id = 4 AND subject_id = 3;
```

> **Warning:** An `UPDATE` or `DELETE` without `WHERE` changes or deletes **every row in the table**. `DELETE FROM marks;` deletes every mark in the school, and the database will not ask "are you sure?". Before running either, run a `SELECT` with the same `WHERE` and check that it finds exactly the rows you mean.

Do not run that `DELETE` yet. Instead, see how to make a change you can still take back.

### Transactions

A *transaction* groups statements so that they all happen, or none of them do. Start one with `BEGIN`. Until you finish it with `COMMIT`, you can cancel everything with `ROLLBACK`:

```sql
BEGIN;
DELETE FROM marks;
SELECT COUNT(*) FROM marks;
ROLLBACK;
```

```output
BEGIN

DELETE 15

 count
-------
     0
(1 row)

ROLLBACK
```

Inside the transaction every mark was deleted — the count is 0. `ROLLBACK` cancelled it all. Check:

```sql
SELECT COUNT(*) FROM marks;
```

```output
 count
-------
    15
(1 row)
```

All fifteen marks are still there. Real systems use transactions whenever several changes belong together. Moving a student from one class to another, for example, may change several tables; if the power fails halfway, the transaction makes sure the database is not left half-changed.

> **Tip:** When you must change real data by hand, type `BEGIN;` first. Run your `UPDATE` or `DELETE`, check the result with a `SELECT`, and only then type `COMMIT;` — or `ROLLBACK;` if anything looks wrong.

## 4.14 Backups

Chapter 7 explains the 3-2-1 rule for backups. A database needs it more than anything else on the computer: it is the school's only record of years of results.

In pgAdmin, right-click the `mwangaza` database and choose **Backup…**. Give the file a name with the date, such as `mwangaza-2026-03-14.sql`, set **Format** to **Plain**, and click **Backup**. A plain backup is an ordinary text file of SQL statements that rebuild the tables and put every row back. You can open it in VS Code and read it.

The same backup from the command line uses `pg_dump`, which is installed with PostgreSQL:

```text
pg_dump -U postgres -d mwangaza -f mwangaza-2026-03-14.sql
```

To restore a plain backup, create a new, empty database, open the backup file in its Query Tool, and run it.

> **Remember:** A backup you have never restored is only a hope. Every term, restore the latest backup into a new practice database and check that the results are all there.

A backup also contains personal information about children: names, sexes and marks. Keep backup files as carefully as the database itself — never on a shared computer or in an unprotected email.

## 4.15 How the web page will reach the database

Your database now holds the class, checks every mark, and answers questions in a moment. The web page from Chapter 3 cannot use it yet, because — as section 4.1 explained — a browser must never connect to a database directly. The missing piece is a program on a server that:

1. receives a request from the page, such as "save mark 58 for student 4 in Biology";
2. checks who is asking and whether they are allowed to do it;
3. runs the SQL, with the values passed separately from the SQL text;
4. sends the answer back to the page.

Step 3 matters for security. If a program builds SQL by gluing typed text into it, someone can type SQL instead of a mark, and the database will run it. This attack is called *SQL injection*, and it is one of the most common ways websites are broken into. Every database library has a safe way to pass values separately; Chapter 5 uses it from the first line of Python.

## 4.16 The complete files

Save these three files in your `database` folder. Together they rebuild the database from nothing: open each in the Query Tool and run them in this order.

### `database/schema.sql`

```sql
-- Mwangaza Secondary School - results database
-- Run on a practice database. The first line deletes these tables, so the
-- file can be run again to start over. Never run it on real school data.

DROP TABLE IF EXISTS marks, exams, subjects, students CASCADE;

CREATE TABLE students (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admission_no  TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  sex           TEXT NOT NULL CHECK (sex IN ('F', 'M'))
);

CREATE TABLE subjects (
  id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE exams (
  id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL,
  year  INTEGER NOT NULL,
  UNIQUE (name, year)
);

CREATE TABLE marks (
  exam_id     INTEGER NOT NULL REFERENCES exams (id),
  student_id  INTEGER NOT NULL REFERENCES students (id),
  subject_id  INTEGER NOT NULL REFERENCES subjects (id),
  mark        INTEGER NOT NULL CHECK (mark BETWEEN 0 AND 100),
  PRIMARY KEY (exam_id, student_id, subject_id)
);
```

`DROP TABLE` deletes tables and everything in them; `CASCADE` also deletes anything built on them, such as the view. That is what makes the file safe to run again on a practice database — and dangerous anywhere else.

### `database/data.sql`

```sql
-- Mwangaza Secondary School - Form 4, Term 1 examination, 2026
-- Run after schema.sql. The database numbers rows in the order they are
-- added, so the students are 1 to 5, the subjects 1 to 3 and the exam 1.

INSERT INTO students (admission_no, name, sex) VALUES
  ('MSS/2023/001', 'Amina Juma', 'F'),
  ('MSS/2023/002', 'Baraka Mushi', 'M'),
  ('MSS/2023/003', 'Neema Kileo', 'F'),
  ('MSS/2023/004', 'Juma Hassan', 'M'),
  ('MSS/2023/005', 'Rehema Mollel', 'F');

INSERT INTO subjects (name) VALUES
  ('Mathematics'),
  ('English'),
  ('Biology');

INSERT INTO exams (name, year) VALUES
  ('Term 1 examination', 2026);

-- exam, student, subject, mark
INSERT INTO marks (exam_id, student_id, subject_id, mark) VALUES
  (1, 1, 1, 78), (1, 1, 2, 85), (1, 1, 3, 81),
  (1, 2, 1, 52), (1, 2, 2, 61), (1, 2, 3, 47),
  (1, 3, 1, 91), (1, 3, 2, 88), (1, 3, 3, 94),
  (1, 4, 1, 34), (1, 4, 2, 49), (1, 4, 3, 38),
  (1, 5, 1, 66), (1, 5, 2, 72), (1, 5, 3, 59);
```

### `database/results.sql`

```sql
-- Mwangaza Secondary School - grades, and the results of every exam
-- Run after schema.sql. Chapter 5 reads student_results from Python.

-- The grade for a mark or an average: the same rule as gradeFor in Chapter 3.
CREATE OR REPLACE FUNCTION grade_for(mark NUMERIC) RETURNS TEXT
LANGUAGE SQL IMMUTABLE
RETURN CASE
  WHEN mark >= 75 THEN 'A'
  WHEN mark >= 65 THEN 'B'
  WHEN mark >= 45 THEN 'C'
  WHEN mark >= 30 THEN 'D'
  ELSE 'F'
END;

-- One row for each student in each exam: average, grade and position.
CREATE OR REPLACE VIEW student_results AS
SELECT
  m.exam_id,
  s.id AS student_id,
  s.name,
  s.sex,
  ROUND(AVG(m.mark), 1) AS average,
  grade_for(ROUND(AVG(m.mark), 1)) AS grade,
  RANK() OVER (PARTITION BY m.exam_id ORDER BY ROUND(AVG(m.mark), 1) DESC) AS position
FROM marks AS m
JOIN students AS s ON s.id = m.student_id
GROUP BY m.exam_id, s.id;
```

After running all three, this query gives the same table as the web page in Chapter 3:

```sql
SELECT name, average, grade, position
FROM student_results
WHERE exam_id = 1
ORDER BY position;
```

```output
     name      | average | grade | position
---------------+---------+-------+----------
 Neema Kileo   |    91.0 | A     |        1
 Amina Juma    |    81.3 | A     |        2
 Rehema Mollel |    65.7 | B     |        3
 Baraka Mushi  |    53.3 | C     |        4
 Juma Hassan   |    40.3 | D     |        5
(5 rows)
```

### Try it yourself

1. Add Kiswahili as a subject, and give every student a Kiswahili mark in exam 1. Which statements did you need — and did you have to change any table?
2. Add a "Term 2 examination" for 2026 with marks for every student, and show each student's Term 1 and Term 2 averages. Check that positions in `student_results` are worked out separately for each exam.
3. Write a query that lists every student with at least one mark below 30, with the subject. (Hint: a join and a `WHERE`.)
4. Count the students of each sex who got each grade in exam 1 — a table head teachers are often asked for.
5. Make a backup, create a new database called `mwangaza_restore`, restore the backup into it, and check that `student_results` gives the same answers.

## Key terms

| English | Kiswahili | Meaning |
|---|---|---|
| Database | Hifadhidata | An organised store of data that checks it and answers questions about it |
| Table | Jedwali | Data about one kind of thing, in rows and columns |
| Row (record) | Rekodi | One item in a table, such as one student |
| Column | Safu wima | One kind of information in a table, such as `name` |
| Primary key | Ufunguo mkuu | A column whose value is different for every row |
| Foreign key | Ufunguo wa nje | A column that holds the key of a row in another table |
| Relationship | Uhusiano | A connection between two tables through keys |
| Query | Hoja | A question asked of the database in SQL |
| Constraint | Kizuizi | A rule the data must obey, such as `CHECK` |
| View | Mwonekano | A saved query that can be used like a table |
| Transaction | Muamala | Several changes that all happen, or none do |
| Backup | Nakala rudufu | A copy of the database kept somewhere safe |

## Check your understanding

1. Give two problems with keeping a school's marks in one shared spreadsheet that a database solves.
2. Why does the `marks` table store `student_id` instead of the student's name?
3. What stops a teacher entering two Mathematics marks for Amina in the same exam?
4. What is the difference between `WHERE` and `HAVING`?
5. Write a query that lists the names of the boys, in alphabetical order.
6. Averages are 91.0, 81.3, 81.3 and 65.7. What positions does `RANK()` give them?
7. What is the difference between a table and a view? Why does a view never show an out-of-date average?
8. You meant to run `DELETE FROM marks WHERE student_id = 4;` but forgot the `WHERE`. What happens, and what habit would have protected you?
9. Why must a web page never connect directly to the database?
10. What is SQL injection, and how is it prevented?

### Answers

1. For example: two teachers editing copies of the file lose each other's work; impossible values such as 150 are accepted; the same student can be entered twice. A database stores one shared copy, refuses data that breaks its rules, and answers questions quickly.
2. A name stored in one place can be corrected in one place, and two students with the same name are never confused. The id connects each mark to exactly one student.
3. The primary key of `marks` is `(exam_id, student_id, subject_id)`, so there can be only one row for each student, subject and exam.
4. `WHERE` chooses rows before they are grouped. `HAVING` chooses groups after `GROUP BY`, using their totals or averages.
5. `SELECT name FROM students WHERE sex = 'M' ORDER BY name;`
6. 1, 2, 2 and 4. The two students with 81.3 share 2nd place, and the next position, 3rd, is skipped.
7. A table stores data. A view stores a query, which runs again each time the view is read, so it always uses the current marks.
8. Every mark in the table is deleted. Starting with `BEGIN;` — and checking with a `SELECT` before `COMMIT;` — would have let you `ROLLBACK;`. So would running a `SELECT` with the same `WHERE` first.
9. Anyone who opened the page could then read, change or delete everything. A server program in between checks who is asking and allows only what they are permitted to do.
10. An attack where someone types SQL into a form, and a program that glues typed text into its SQL runs it. It is prevented by passing values separately from the SQL text, as every database library allows.
