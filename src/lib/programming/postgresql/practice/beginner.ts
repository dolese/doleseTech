import type { Practice } from "../../types";

export const beginner: Record<string, Practice> = {
  setup: {
    solution: {
      notes: [
        "SQL follows normal operator precedence (multiplication before addition). `upper` is a built-in text function, and adding a whole number to a `date` adds that many days.",
      ],
      code: [
        {
          filename: "psql",
          lang: "sql",
          source: `
SELECT 2 + 3 * 4;            -- 14
SELECT upper('dolese');      -- DOLESE
SELECT current_date + 30;    -- the date 30 days from today
SELECT current_date + 30 AS due_date, to_char(current_date + 30, 'Day DD Mon YYYY') AS readable;
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which symbol ends an SQL statement in psql?",
        options: ["A full stop `.`", "A semicolon `;`", "A new line", "A colon `:`"],
        answer: 1,
        explanation: "psql keeps waiting for more input until it sees `;`.",
      },
      {
        question: "What does the psql command `\\dt` do?",
        options: ["Deletes a table", "Describes the database", "Lists the tables in the current database", "Starts a transaction"],
        answer: 2,
        explanation: "Backslash commands are psql shortcuts; `\\dt` lists tables, `\\d name` describes one.",
      },
      {
        question: "How do you switch to the `school` database inside psql?",
        options: ["`\\c school`", "`USE school;`", "`OPEN school;`", "`cd school`"],
        answer: 0,
        explanation: "`\\c` (connect) changes the current database. `USE` is MySQL syntax.",
      },
      {
        question: "Which statement creates a new database?",
        options: ["`NEW DATABASE school;`", "`\\new school`", "`INSERT DATABASE school;`", "`CREATE DATABASE school;`"],
        answer: 3,
        explanation: "`CREATE DATABASE` makes a new, empty database.",
      },
    ],
  },

  "tables-and-types": {
    solution: {
      notes: [
        "Salary is money, so it uses `numeric(12,2)` (exact) rather than a floating-point type. The new column has a default, so existing rows are filled in automatically.",
      ],
      code: [
        {
          filename: "teachers.sql",
          lang: "sql",
          source: `
CREATE TABLE teachers (
    id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name text NOT NULL,
    subject   text,
    phone     text,
    hired_on  date,
    salary    numeric(12,2)
);

ALTER TABLE teachers ADD COLUMN is_active boolean NOT NULL DEFAULT true;

\\d teachers
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which type should you use for money values?",
        options: ["`float`", "`numeric(12,2)`", "`text`", "`integer` divided by 100 every time"],
        answer: 1,
        explanation: "`numeric` is exact; floating-point types can produce rounding errors like 0.30000000000000004.",
      },
      {
        question: "What does `bigint GENERATED ALWAYS AS IDENTITY` do?",
        options: [
          "Makes PostgreSQL number new rows automatically",
          "Stores very long text",
          "Encrypts the id",
          "Copies the id from another table",
        ],
        answer: 0,
        explanation: "Identity columns generate the next number for each inserted row.",
      },
      {
        question: "Which type best stores a moment in time, such as when a record was created?",
        options: ["`text`", "`date`", "`time`", "`timestamptz`"],
        answer: 3,
        explanation: "`timestamptz` stores an exact instant and handles time zones correctly.",
      },
      {
        question: "What does `NOT NULL` on a column mean?",
        options: [
          "The column must be unique",
          "The column can't be zero",
          "Every row must have a value in that column",
          "The column is hidden",
        ],
        answer: 2,
        explanation: "`NOT NULL` makes a column required.",
      },
    ],
  },

  "insert-update-delete": {
    solution: {
      notes: [
        "`RETURNING` shows exactly what each statement stored or changed. Every UPDATE and DELETE has a `WHERE` clause that targets one teacher — without it, every row would change.",
      ],
      code: [
        {
          filename: "teachers-data.sql",
          lang: "sql",
          source: `
INSERT INTO teachers (full_name, subject, phone, hired_on, salary) VALUES
    ('Mr. Mwakyusa', 'Mathematics', '0713000001', '2015-01-12', 1200000),
    ('Ms. Lyimo',    'Biology',     '0754000002', '2019-07-01', 1100000),
    ('Mrs. Mrema',   'English',     '0688000003', '2021-01-04', 1050000)
RETURNING id, full_name, salary;

UPDATE teachers SET salary = salary * 1.10
WHERE full_name = 'Ms. Lyimo'
RETURNING full_name, salary;          -- 1210000.00

UPDATE teachers SET is_active = false
WHERE full_name = 'Mrs. Mrema'
RETURNING full_name, is_active;

DELETE FROM teachers WHERE id = 1
RETURNING id, full_name;

SELECT id, full_name, salary, is_active FROM teachers ORDER BY id;
`,
        },
      ],
    },
    quiz: [
      {
        question: "What happens if you run `DELETE FROM students;` with no `WHERE` clause?",
        options: ["Nothing", "Only the first row is deleted", "PostgreSQL asks for confirmation", "Every row in the table is deleted"],
        answer: 3,
        explanation: "Without `WHERE`, UPDATE and DELETE affect every row. Always check your `WHERE` first.",
      },
      {
        question: "What does `RETURNING id, full_name` add to an INSERT?",
        options: [
          "It shows the rows that were stored, including generated ids",
          "It undoes the insert",
          "It returns the table's column list",
          "It copies the rows to another table",
        ],
        answer: 0,
        explanation: "RETURNING avoids a second query to find out what was inserted or changed.",
      },
      {
        question: "Which statement increases one student's balance by 10,000?",
        options: [
          "`INSERT INTO students (fee_balance) VALUES (10000);`",
          "`UPDATE students SET fee_balance = fee_balance + 10000 WHERE id = 5;`",
          "`UPDATE students fee_balance + 10000;`",
          "`ALTER TABLE students ADD 10000;`",
        ],
        answer: 1,
        explanation: "UPDATE changes existing rows; the `WHERE` limits it to student 5.",
      },
      {
        question: "What value does a column get if you leave it out of an INSERT?",
        options: ["Always `0`", "An error is raised", "Its `DEFAULT` value (or NULL if there is none)", "The value from the previous row"],
        answer: 2,
        explanation: "Omitted columns take their default; columns without a default become NULL (unless NOT NULL forbids it).",
      },
    ],
  },

  querying: {
    solution: {
      notes: [
        "Each question maps to one clause: `IN` for a list of forms, `LIKE 'R%'` for names starting with R, `ORDER BY birth_date DESC LIMIT 2` for the two youngest, and `coalesce` to replace a missing email.",
      ],
      code: [
        {
          filename: "queries.sql",
          lang: "sql",
          source: `
-- Form 3 or 4 students who still owe fees
SELECT full_name, form, fee_balance
FROM students
WHERE form IN (3, 4) AND fee_balance > 0
ORDER BY form, full_name;

-- Names starting with R
SELECT full_name FROM students WHERE full_name LIKE 'R%';

-- The two youngest students (latest birth dates)
SELECT full_name, birth_date
FROM students
WHERE birth_date IS NOT NULL
ORDER BY birth_date DESC
LIMIT 2;

-- Every name in capitals, with the email or 'missing'
SELECT upper(full_name) AS name, coalesce(email, 'missing') AS email
FROM students
ORDER BY full_name;
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which condition correctly finds students with no email?",
        options: ["`WHERE email = NULL`", "`WHERE email == ''`", "`WHERE email IS NULL`", "`WHERE NOT email`"],
        answer: 2,
        explanation: "NULL is never equal to anything; you must test it with `IS NULL`.",
      },
      {
        question: "What does `ILIKE '%ma%'` match?",
        options: [
          "Text containing \"ma\", ignoring upper/lower case",
          "Text exactly equal to \"ma\"",
          "Text starting with \"ma\" only",
          "Nothing — `%` is not allowed",
        ],
        answer: 0,
        explanation: "`%` matches any characters; `ILIKE` is the case-insensitive version of `LIKE`.",
      },
      {
        question: "In which order are these clauses written?",
        options: [
          "WHERE → SELECT → FROM → ORDER BY",
          "SELECT → FROM → WHERE → ORDER BY → LIMIT",
          "FROM → SELECT → LIMIT → WHERE",
          "SELECT → WHERE → LIMIT → FROM",
        ],
        answer: 1,
        explanation: "SELECT columns FROM table WHERE filter ORDER BY sort LIMIT n.",
      },
      {
        question: "What does `coalesce(email, 'no email')` return when `email` is NULL?",
        options: ["NULL", "An error", "An empty string", "`'no email'`"],
        answer: 3,
        explanation: "`coalesce` returns its first non-NULL argument.",
      },
    ],
  },

  "keys-and-relationships": {
    solution: {
      notes: [
        "The foreign key ties every attendance row to a real student, and `UNIQUE (student_id, day)` allows only one record per student per day. `generate_series` creates the five school days, and the duplicate insert is rejected.",
      ],
      code: [
        {
          filename: "attendance.sql",
          lang: "sql",
          source: `
CREATE TABLE attendance (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id bigint  NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    day        date    NOT NULL,
    present    boolean NOT NULL,
    UNIQUE (student_id, day)
);

-- One school week (Mon-Fri) for students 1 and 2
INSERT INTO attendance (student_id, day, present)
SELECT s, d::date, NOT (s = 2 AND extract(isodow FROM d) = 3)   -- student 2 absent on Wednesday
FROM generate_series(1, 2) AS s,
     generate_series(date '2026-03-02', date '2026-03-06', interval '1 day') AS d;

SELECT student_id, count(*) FILTER (WHERE present) AS days_present, count(*) AS school_days
FROM attendance
GROUP BY student_id
ORDER BY student_id;

-- Rejected: duplicate key value violates unique constraint "attendance_student_id_day_key"
INSERT INTO attendance (student_id, day, present) VALUES (1, '2026-03-02', true);
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does a foreign key (`REFERENCES students (id)`) guarantee?",
        options: [
          "The column is unique",
          "The column can't be NULL",
          "The column is indexed automatically",
          "Every value matches an existing row in the referenced table",
        ],
        answer: 3,
        explanation: "You can't insert a result for a student that doesn't exist.",
      },
      {
        question: "With `ON DELETE CASCADE`, what happens to a student's results when the student is deleted?",
        options: ["They are deleted too", "The delete is blocked", "They are kept with a NULL student", "They move to another student"],
        answer: 0,
        explanation: "CASCADE removes dependent rows; RESTRICT (or the default) blocks the delete instead.",
      },
      {
        question: "Which constraint stops two results for the same student, subject and term?",
        options: ["`CHECK`", "`NOT NULL`", "`UNIQUE (student_id, subject_id, term)`", "`DEFAULT`"],
        answer: 2,
        explanation: "A multi-column UNIQUE constraint rejects duplicate combinations.",
      },
      {
        question: "Why store `student_id` in results instead of copying the student's name?",
        options: [
          "Names are too long for PostgreSQL",
          "Each fact is stored once, so a name change happens in one place",
          "IDs are always faster to type",
          "PostgreSQL doesn't allow text in two tables",
        ],
        answer: 1,
        explanation: "Avoiding duplicated data keeps it consistent — that's normalisation.",
      },
    ],
  },

  aggregation: {
    solution: {
      notes: [
        "`GROUP BY` gives one row per form or gender. `HAVING` filters subjects after averaging. The best score per student needs a `JOIN` to get names, then `max(score)` per student.",
      ],
      code: [
        {
          filename: "aggregates.sql",
          lang: "sql",
          source: `
-- Average fee balance per form
SELECT form, round(avg(fee_balance), 2) AS avg_balance
FROM students
GROUP BY form
ORDER BY form;

-- Students per gender
SELECT gender, count(*) AS students
FROM students
GROUP BY gender;

-- Subjects whose average is below 65
SELECT sub.name, round(avg(r.score), 1) AS average
FROM results r
JOIN subjects sub ON sub.id = r.subject_id
GROUP BY sub.name
HAVING avg(r.score) < 65;

-- Each student's best score
SELECT s.full_name, max(r.score) AS best_score
FROM results r
JOIN students s ON s.id = r.student_id
GROUP BY s.full_name
ORDER BY best_score DESC;
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is the difference between `WHERE` and `HAVING`?",
        options: [
          "There is none",
          "`HAVING` is faster",
          "`WHERE` filters rows before grouping; `HAVING` filters groups after aggregating",
          "`WHERE` only works with numbers",
        ],
        answer: 2,
        explanation: "You can't use `avg(...)` in WHERE because the groups don't exist yet.",
      },
      {
        question: "With `GROUP BY form`, which column can you select without an aggregate?",
        options: ["`full_name`", "`form`", "`email`", "Any column"],
        answer: 1,
        explanation: "Selected columns must be grouped or aggregated; there are many names per form.",
      },
      {
        question: "What does `count(*) FILTER (WHERE score >= 30)` count?",
        options: [
          "Only the rows in the group with a score of 30 or more",
          "All rows",
          "The number of groups",
          "Rows with a NULL score",
        ],
        answer: 0,
        explanation: "FILTER lets you count several subsets in a single pass.",
      },
      {
        question: "Which function returns the highest value in a group?",
        options: ["`top()`", "`greatest()`", "`sum()`", "`max()`"],
        answer: 3,
        explanation: "`max` is the aggregate; `greatest` compares values within one row.",
      },
    ],
  },
};
