The web page from Chapter 3 works out averages for one class as a teacher types. A school needs more: at the end of every term, hundreds of marks arrive in spreadsheets, and someone must grade every subject, find each student's best seven, work out divisions, and produce lists for the head teacher and the noticeboard. Done by hand, that is days of work and a mistake on every page. In this chapter you write a Python program that does it in a second, checks the file for typing mistakes first, and saves everything into the database you built in Chapter 4.

By the end of this chapter you will be able to:

- install Python and run programs from a terminal;
- use variables, lists, dictionaries, loops and functions in Python;
- explain how divisions are worked out from the best seven subjects;
- read a spreadsheet saved as CSV, and write one;
- catch bad data with exceptions and clear error messages;
- test your own functions automatically;
- connect to PostgreSQL from Python safely, with no password in the code.

The files for this chapter go in the `python` folder of your `results-system` project.

## 5.1 Why Python

You already know one programming language, JavaScript, which runs in the browser. Python runs on the computer itself, where it can open files, read spreadsheets, talk to databases and run on a schedule with nobody watching. It is famous for being easy to read — many people say it looks like instructions written in English — and it is used everywhere from school offices to banks, scientific research and artificial intelligence.

Most of what you learned in Chapter 3 carries over. Here is the same grade rule in both languages:

| JavaScript (Chapter 3) | Python (this chapter) |
|---|---|
| `function gradeFor(mark) {` | `def grade_for(mark):` |
| `if (mark >= 75) {` | `if mark >= 75:` |
| `} else if (mark >= 65) {` | `elif mark >= 65:` |
| `return "A";` | `return "A"` |
| `const marks = [78, 85];` | `marks = [78, 85]` |
| `marks.length` | `len(marks)` |
| `// a comment` | `# a comment` |

Two differences matter more than the rest:

- **Python uses indentation instead of curly braces.** The lines inside an `if` or a function are the lines indented under it. The indentation is not decoration: get it wrong and the program means something else, or will not run.
- **Python names use underscores:** `grade_for`, `class_list`, `best_subjects`. This style is called *snake case*.

## 5.2 Installing Python

1. Open **python.org/downloads** and download the newest Python 3 for Windows.
2. Run the installer. On the first screen, **tick "Add python.exe to PATH"** before you click **Install Now**. Without it, typing `python` in a terminal will not find Python.
3. In VS Code, open the Extensions panel (`Ctrl + Shift + X`), search for **Python**, and install the one published by Microsoft. It colours your code and points out mistakes as you type.

### The terminal

Python programs are usually run from a *terminal*: a window where you type commands instead of clicking. VS Code has one built in. Open your `results-system` folder, then press ``Ctrl + ` `` (the backtick key, left of `1`). Check that Python is installed:

```text
python --version
```

```output
Python 3.14.7
```

Your version number may be newer. If you see "Python was not found", run the installer again and tick the PATH box.

A few terminal commands you will use all the time:

| Command | What it does |
|---|---|
| `cd python` | Move into the `python` folder (*change directory*) |
| `cd ..` | Move up one folder |
| `dir` | List the files in this folder (`ls` on Linux and macOS) |
| `python report.py` | Run the program in `report.py` |
| `↑` | Bring back the last command, to run it again |

### Your first program

Create `hello.py` in the `python` folder:

```python
name = "Mwl. Grace Mushi"
students = 10
print(f"Habari, {name}! You have {students} students in Form 4.")
```

Move into the folder and run it:

```text
cd python
python hello.py
```

```output
Habari, Mwl. Grace Mushi! You have 10 students in Form 4.
```

The `f` before the quotes makes an *f-string*: everything inside `{ }` is replaced by its value. It is the same idea as JavaScript's template strings in Chapter 3.

> **Tip:** Type `python` on its own to open the *interactive shell*, marked by `>>>`. Each line runs the moment you press `Enter` — ideal for trying things out, like the browser console. Type `exit()` to leave.

## 5.3 Values, lists and dictionaries

Python has the same basic values as JavaScript, with slightly different names:

| Type | Examples | Notes |
|---|---|---|
| `int` | `78`, `-5` | Whole numbers |
| `float` | `81.3` | Numbers with a decimal point |
| `str` | `"Amina Juma"` | Text, in double or single quotes |
| `bool` | `True`, `False` | Capital letters in Python |
| `None` | `None` | "No value" — like `null` |

A *list* holds values in order, counted from zero:

```python
marks = [82, 76, 79, 88, 85]
marks[0]       # 82
len(marks)     # 5
sum(marks)     # 410
sorted(marks)  # [76, 79, 82, 85, 88]
```

A *dictionary* holds values under names, called *keys* — like a JavaScript object:

```python
student = {"name": "Amina Juma", "sex": "F", "marks": {"Biology": 81, "English": 85}}
student["name"]               # "Amina Juma"
student["marks"]["Biology"]   # 81
```

### Loops

`for` takes each item in turn, exactly like `for...of` in JavaScript:

```python
for subject, mark in student["marks"].items():
    print(subject, mark)
```

`.items()` gives each key with its value, so each time round the loop `subject` is a subject's name and `mark` is its mark.

Python also has a compact way to build a new list from an old one, called a *list comprehension*:

```python
grades = [grade_for(mark) for mark in marks]
```

Read it as: "a list of `grade_for(mark)`, for each `mark` in `marks`". It does in one line what a loop and an empty list would do in four.

## 5.4 Grades and divisions

Create `grades.py`. The grade rule is the one from Chapters 3 and 4:

```python
def grade_for(mark):
    """The letter grade for a mark from 0 to 100."""
    if mark >= 75:
        return "A"
    elif mark >= 65:
        return "B"
    elif mark >= 45:
        return "C"
    elif mark >= 30:
        return "D"
    else:
        return "F"
```

`def` starts a function. The text in triple quotes just under it is a *docstring*: a description of what the function does, which editors show when you use the function.

### How divisions work

In Form 4, a student's overall result is a *division*. Each grade is worth *points* — the fewer the better:

| Grade | A | B | C | D | F |
|---|---|---|---|---|---|
| Points | 1 | 2 | 3 | 4 | 5 |

Only the student's **best seven** subjects count. Their points are added up, and the total decides the division:

| Total points | Division |
|---|---|
| 7 to 17 | I |
| 18 to 21 | II |
| 22 to 25 | III |
| 26 to 33 | IV |
| 34 to 35 | 0 |

Seven A grades give 7 points, the best possible result. Seven F grades give 35, the worst. A student who sat fewer than seven subjects has no division yet; we mark that `INC`, for *incomplete*.

> **Remember:** This is the rule schools commonly use for their own examinations. For national results, NECTA applies further conditions — about which subjects are required, for example. Always check the current NECTA regulations before using any program for official results.

In Python:

```python
GRADE_POINTS = {"A": 1, "B": 2, "C": 3, "D": 4, "F": 5}
BEST_SUBJECTS = 7


def division_for(grades):
    """The points of the best seven grades, and the division they earn.

    A student with fewer than seven grades has no division yet: (None, "INC").
    """
    if len(grades) < BEST_SUBJECTS:
        return None, "INC"
    best = sorted(GRADE_POINTS[grade] for grade in grades)[:BEST_SUBJECTS]
    points = sum(best)
    if points <= 17:
        division = "I"
    elif points <= 21:
        division = "II"
    elif points <= 25:
        division = "III"
    elif points <= 33:
        division = "IV"
    else:
        division = "0"
    return points, division
```

The key line is the one that finds the best seven:

- `GRADE_POINTS[grade] for grade in grades` turns each grade into its points;
- `sorted(...)` puts them in order, smallest — best — first;
- `[:BEST_SUBJECTS]` is a *slice*: the first seven items.

A function can give back two values at once, separated by a comma. The caller unpacks them the same way: `points, division = division_for(grades)`.

## 5.5 Reading a spreadsheet

Schools keep marks in Excel or Google Sheets. Python can read those files directly with extra libraries, but the simplest and most reliable route is *CSV* — "comma-separated values" — which every spreadsheet program can save. In Excel, choose **File → Save As**, and pick **CSV UTF-8 (Comma delimited)**. In Google Sheets, choose **File → Download → Comma-separated values**.

A CSV file is plain text: one line for each row, with commas between the cells. Here is the class list for this chapter, `class_list.csv`, as it looks in a text editor:

```text
admission_no,name,sex,Civics,History,Geography,Kiswahili,English,Biology,Mathematics,Chemistry,Physics
MSS/2023/001,Amina Juma,F,82,76,79,88,85,81,78,74,70
MSS/2023/002,Baraka Mushi,M,58,49,61,66,61,47,52,44,40
MSS/2023/003,Neema Kileo,F,90,85,88,92,88,94,91,86,89
MSS/2023/004,Juma Hassan,M,38,41,35,52,49,38,34,29,31
MSS/2023/005,Rehema Mollel,F,68,70,63,75,72,59,66,58,61
MSS/2023/006,Daudi Mrisho,M,25,31,28,40,33,22,18,15,20
MSS/2023/007,Zawadi Ngowi,F,20,18,25,28,22,19,12,10,15
MSS/2023/008,Elia Kimaro,M,55,62,,58,64,51,45,48,50
MSS/2023/009,Faraja Lyimo,M,50,46,35,55,48,41,38,30,44
MSS/2023/010,Halima Said,F,70,,65,80,,72,60,,
```

The first line holds the column headings. An empty cell — two commas in a row, as in Elia Kimaro's Geography — means the student did not sit that paper. Halima Said joined the school mid-term and sat only five subjects.

Python's built-in `csv` module reads it. `csv.DictReader` turns each row into a dictionary, using the headings as keys:

```python
import csv

with open("class_list.csv", newline="", encoding="utf-8-sig") as file:
    for row in csv.DictReader(file):
        print(row["name"], row["Biology"])
```

- `import csv` loads the module. Python comes with hundreds of modules like it, called the *standard library*.
- `with open(...) as file:` opens the file and closes it again when the indented block ends, even if something goes wrong.
- `encoding="utf-8-sig"` reads the text correctly whichever way Excel saved it. Excel's "CSV UTF-8" adds an invisible marker at the start of the file; `utf-8-sig` removes it, so the first heading is not read as `﻿admission_no`.

Every value read from a CSV file is a **string**, even the marks: `row["Biology"]` is `"81"`, not `81`. Turning it into a number is the next job — and the place where typing mistakes are caught.

## 5.6 Catching bad data

Real class lists contain mistakes: `7O` typed with a letter O, `147` with an extra digit, a mark in the wrong column. A program that quietly accepts them produces wrong results that look right. A good program refuses, and says exactly where the problem is.

```python
def parse_mark(text, where):
    """A mark from the file: a whole number from 0 to 100, or None if blank."""
    text = text.strip()
    if text == "":
        return None
    try:
        mark = int(text)
    except ValueError:
        raise ValueError(f"{where}: '{text}' is not a whole number")
    if mark < 0 or mark > 100:
        raise ValueError(f"{where}: {mark} is not between 0 and 100")
    return mark
```

- `int(text)` turns `"81"` into `81`. If the text is not a whole number, it *raises* an exception called `ValueError`.
- `try:` and `except ValueError:` catch that exception. Instead of Python's own message, we raise a new one that says *where* the problem is, such as `line 5, Civics`.
- `raise` stops the function and sends the error to whoever called it. Something further up must catch it, or the program stops.

The function that reads the whole file calls `parse_mark` for every cell, and counts lines so the message can name the right one:

```python
def read_class(path):
    """The subjects, and one dictionary for each student in the file."""
    with open(path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        subjects = [column for column in reader.fieldnames if column not in INFO_COLUMNS]
        students = []
        for line, row in enumerate(reader, start=2):
            marks = {}
            for subject in subjects:
                mark = parse_mark(row[subject], f"line {line}, {subject}")
                if mark is not None:
                    marks[subject] = mark
            students.append({
                "admission_no": row["admission_no"],
                "name": row["name"],
                "sex": row["sex"],
                "marks": marks,
            })
    return subjects, students
```

`enumerate` counts as it loops. It starts at 2 because line 1 of the file is the headings, so the first student is on line 2 — the same number a teacher sees in Excel's row numbers. The subjects are every column except `admission_no`, `name` and `sex`, so a school with eleven subjects, or different ones, needs no change to the code.

Here is what the finished program says when Juma Hassan's Civics mark was typed as `3B` instead of `38`:

```output
Could not read the class list: line 5, Civics: '3B' is not a whole number
```

and when a Biology mark was typed as `147`:

```output
Could not read the class list: line 3, Biology: 147 is not between 0 and 100
```

The teacher can go straight to the right cell and fix it. Nothing is calculated from a file with a mistake in it.

## 5.7 The report

Now put it together. For each student, `results_for` grades every mark, works out the division, and adds the average:

```python
def results_for(student):
    """The student, with their average, points and division added."""
    marks = student["marks"]
    grades = [grade_for(mark) for mark in marks.values()]
    points, division = division_for(grades)
    average = round(sum(marks.values()) / len(marks), 1) if marks else 0.0
    return {**student, "average": average, "points": points, "division": division}
```

`{**student, ...}` makes a new dictionary containing everything in `student`, plus the new keys. The original is left as it was.

> **Remember:** Python's `round` rounds a half to the nearest *even* number: `round(2.5)` is `2` and `round(3.5)` is `4`. This is deliberate — it avoids a small upward bias when many numbers are rounded — but it surprises people the first time.

To list the best results first, Python's `sorted` takes a `key`: a function that says what to sort by.

```python
def sort_key(result):
    """Best first: fewest points, then highest average. Incomplete results last."""
    if result["points"] is None:
        return (1, 0, -result["average"])
    return (0, result["points"], -result["average"])
```

Python compares these *tuples* — values in round brackets — item by item. Complete results (`0`) come before incomplete ones (`1`); then fewer points come first; then a minus sign turns the highest average into the smallest number, so it comes first.

`main` reads the file, prints the table and a summary, and saves the results. The `{name:<15}` and `{average:>8.1f}` inside the f-strings set the width of each column: `<` lines text up on the left, `>` lines numbers up on the right, and `.1f` shows one decimal place. The complete `report.py` is in section 5.11. Run it:

```text
python report.py
```

```output
10 students, 9 subjects

No. Name           Sex  Average  Points  Division
1   Neema Kileo    F       89.2       7  I
2   Amina Juma     F       79.2       7  I
3   Rehema Mollel  F       65.8      15  I
4   Baraka Mushi   M       53.1      20  II
5   Elia Kimaro    M       54.1      21  II
6   Faraja Lyimo   M       43.0      24  III
7   Juma Hassan    M       38.6      26  IV
8   Daudi Mrisho   M       25.8      32  IV
9   Zawadi Ngowi   F       18.8      35  0
10  Halima Said    F       69.4       -  INC

Divisions   I: 3   II: 2   III: 1   IV: 2   0: 1   INC: 1
Saved results.csv
```

Look at Elia Kimaro: his average is higher than Baraka Mushi's, but he is placed below him. Elia missed Geography, so all seven of his counted subjects are C grades — 21 points — while Baraka's best seven include a B, for 20 points. Divisions reward the best seven subjects, not the average. Halima Said has a good average, but with five subjects she has no division yet.

The program also wrote `results.csv`, which opens in Excel:

```text
admission_no,name,sex,subjects,average,points,division
MSS/2023/003,Neema Kileo,F,9,89.2,7,I
MSS/2023/001,Amina Juma,F,9,79.2,7,I
MSS/2023/005,Rehema Mollel,F,9,65.8,15,I
MSS/2023/002,Baraka Mushi,M,9,53.1,20,II
MSS/2023/008,Elia Kimaro,M,8,54.1,21,II
MSS/2023/009,Faraja Lyimo,M,9,43.0,24,III
MSS/2023/004,Juma Hassan,M,9,38.6,26,IV
MSS/2023/006,Daudi Mrisho,M,9,25.8,32,IV
MSS/2023/007,Zawadi Ngowi,F,9,18.8,35,0
MSS/2023/010,Halima Said,F,5,69.4,,INC
```

### Modules and `__main__`

`report.py` starts with `from grades import division_for, grade_for`. Any Python file is a *module* that other files can import, which is how `grades.py` is shared by the report, the tests and the database program. The last two lines of `report.py` are:

```python
if __name__ == "__main__":
    main()
```

When you run `python report.py`, Python sets `__name__` to `"__main__"`, so `main()` runs. When another file imports `report`, `__name__` is `"report"` instead, and nothing runs by itself — the other file can use `read_class` without printing a report.

## 5.8 Testing your functions

How do you know `division_for` is right — not just for these ten students, but at every boundary? Write code that checks it. Python's built-in `unittest` module runs checks for you. Create `test_grades.py`:

```python
"""Checks for grades.py. Run with: python -m unittest"""
import unittest

from grades import division_for, grade_for


class GradeTests(unittest.TestCase):
    def test_grade_boundaries(self):
        self.assertEqual(grade_for(75), "A")
        self.assertEqual(grade_for(74), "B")
        self.assertEqual(grade_for(65), "B")
        self.assertEqual(grade_for(45), "C")
        self.assertEqual(grade_for(44), "D")
        self.assertEqual(grade_for(30), "D")
        self.assertEqual(grade_for(29), "F")


class DivisionTests(unittest.TestCase):
    def test_only_the_best_seven_count(self):
        self.assertEqual(division_for(["A"] * 7 + ["F", "F"]), (7, "I"))

    def test_division_boundaries(self):
        self.assertEqual(division_for(["A"] + ["B"] * 2 + ["C"] * 4), (17, "I"))
        self.assertEqual(division_for(["B"] * 3 + ["C"] * 4), (18, "II"))
        self.assertEqual(division_for(["D"] * 2 + ["F"] * 5), (33, "IV"))
        self.assertEqual(division_for(["D"] + ["F"] * 6), (34, "0"))

    def test_fewer_than_seven_subjects(self):
        self.assertEqual(division_for(["A"] * 6), (None, "INC"))


if __name__ == "__main__":
    unittest.main()
```

Each method whose name starts with `test_` is one test, and each `assertEqual` checks that two things are equal. `["A"] * 7` is a list of seven `"A"`s. Run every test in the folder:

```text
python -m unittest
```

```output
....
----------------------------------------------------------------------
Ran 4 tests in 0.003s

OK
```

Each dot is a test that passed. If one fails, you see an `F` and a message showing what was expected and what came back. Run the tests every time you change `grades.py`: if someone "fixes" the boundary between Division I and II next year, the tests say at once whether they broke anything.

> **Tip:** The boundaries are where mistakes hide: 17 and 18 points, a mark of 74 and 75. Test those, not just the comfortable values in the middle.

## 5.9 Saving into the database

The report is useful, but the results still live in files on one computer. The database from Chapter 4 is where they belong. Python talks to PostgreSQL through a library called *psycopg*. Install it from the terminal:

```text
python -m pip install "psycopg[binary]"
```

`pip` is Python's tool for installing libraries from the Python Package Index. The `[binary]` part installs a ready-made version that needs nothing else on Windows.

### Keep the password out of the code

The program needs the database password, and it must **never** be written in the code. Code is copied, shared, emailed and — in Chapter 8 — published on GitHub, and a password written in it goes everywhere the code goes. Instead, the password is given to the program through an *environment variable*: a setting that belongs to the terminal window, not to the file. psycopg reads `PGUSER` and `PGPASSWORD` by itself.

In VS Code's terminal on Windows, which uses PowerShell, type these two lines, using your own password from Chapter 4:

```text
$env:PGUSER = "postgres"
$env:PGPASSWORD = "your-password-here"
```

They last until you close that terminal window, and they are never saved in your project. On Linux or macOS, the same is written `export PGUSER=postgres`.

### Values go separately from the SQL

Chapter 4 warned about SQL injection. In Python it looks like this. **Never** do this:

```python
# WRONG: the name becomes part of the SQL itself
cur.execute(f"INSERT INTO students (name) VALUES ('{name}')")
```

If a "name" in the file contains a quote and some SQL, the database runs it. The safe way is to write `%s` where each value goes, and pass the values separately:

```python
# RIGHT: psycopg sends the values separately from the SQL
cur.execute("INSERT INTO students (name) VALUES (%s)", (name,))
```

The values travel to the database apart from the SQL text, so nothing in them can ever be run as SQL — whatever it contains. The comma in `(name,)` matters: it makes a tuple with one item.

### The program

`save_to_db.py` saves the class list as a new exam, the "Mock examination". For each student, subject and mark it uses `INSERT ... ON CONFLICT ... DO UPDATE`, which adds the row if it is new and updates it if it already exists. That makes the program safe to run twice: the second run corrects marks rather than adding them again. Its main part is:

```python
    with psycopg.connect(host="localhost", dbname="mwangaza") as conn:
        exam_id = save(conn, subjects, students)
        top = conn.execute(
            """SELECT position, name, average, grade FROM student_results
               WHERE exam_id = %s ORDER BY position LIMIT 3""",
            (exam_id,),
        ).fetchall()
```

The `with` block is also a *transaction*, as in Chapter 4: if anything fails before the end — a mark that breaks a rule, a lost connection — nothing at all is saved. Only when the block finishes does psycopg commit every change at once. Run it:

```text
python save_to_db.py
```

```output
Saved 10 students and 9 subjects for the Mock examination, 2026.
Top three:
  1. Neema Kileo, average 89.2, grade A
  2. Amina Juma, average 79.2, grade A
  3. Halima Said, average 69.4, grade B
```

The marks are now in the shared database. Every teacher's screen, every report card and the web page can read them from `student_results` — the view you wrote in Chapter 4, which ranked this new exam separately from Term 1 because of its `PARTITION BY exam_id`.

Notice the third place. The view ranks by average and knows nothing about divisions, so Halima Said — five subjects, no division — comes third. The Python report placed her last. Neither is wrong; they answer different questions. A real system must decide which one it shows to parents, and say so on the page.

## 5.10 When something goes wrong

| Message | What it means |
|---|---|
| `IndentationError: expected an indented block after 'if' statement on line 2` | The line after an `if`, `for` or `def` is not indented, or spaces and tabs are mixed. VS Code's status bar shows which you are using |
| `NameError: name 'grade_for' is not defined` | A name is misspelt, or the `import` is missing |
| `ModuleNotFoundError: No module named 'psycopg'` | The library is not installed: run the `pip install` command in section 5.9 |
| `FileNotFoundError: [Errno 2] No such file or directory: 'class_list.csv'` | The terminal is in a different folder from the file. Use `cd` to move into the `python` folder |
| `TypeError: can only concatenate str (not "int") to str` | A string and a number were joined with `+`. Turn the number into text with `str()`, or use an f-string |
| `KeyError: 'Biology'` | A dictionary has no such key — check the spelling and capitals of the CSV heading |
| `connection failed: ... password authentication failed` | `PGPASSWORD` is not set in this terminal window, or is wrong |

Python's own error messages end with the most useful line: read from the **bottom** up. The lines above it, called the *traceback*, show which file and line the problem was found on.

## 5.11 The complete files

The `python` folder at the end of this chapter holds five files: the class list, the grade rules, the report, the tests and the database program. `report.py`, `test_grades.py` and `save_to_db.py` all import from `grades.py` or `report.py`, so keep them together in one folder.

### `python/class_list.csv`

```text
admission_no,name,sex,Civics,History,Geography,Kiswahili,English,Biology,Mathematics,Chemistry,Physics
MSS/2023/001,Amina Juma,F,82,76,79,88,85,81,78,74,70
MSS/2023/002,Baraka Mushi,M,58,49,61,66,61,47,52,44,40
MSS/2023/003,Neema Kileo,F,90,85,88,92,88,94,91,86,89
MSS/2023/004,Juma Hassan,M,38,41,35,52,49,38,34,29,31
MSS/2023/005,Rehema Mollel,F,68,70,63,75,72,59,66,58,61
MSS/2023/006,Daudi Mrisho,M,25,31,28,40,33,22,18,15,20
MSS/2023/007,Zawadi Ngowi,F,20,18,25,28,22,19,12,10,15
MSS/2023/008,Elia Kimaro,M,55,62,,58,64,51,45,48,50
MSS/2023/009,Faraja Lyimo,M,50,46,35,55,48,41,38,30,44
MSS/2023/010,Halima Said,F,70,,65,80,,72,60,,
```

### `python/grades.py`

```python
"""Grades, points and divisions for Form 4 results."""

GRADE_POINTS = {"A": 1, "B": 2, "C": 3, "D": 4, "F": 5}
BEST_SUBJECTS = 7


def grade_for(mark):
    """The letter grade for a mark from 0 to 100."""
    if mark >= 75:
        return "A"
    elif mark >= 65:
        return "B"
    elif mark >= 45:
        return "C"
    elif mark >= 30:
        return "D"
    else:
        return "F"


def division_for(grades):
    """The points of the best seven grades, and the division they earn.

    A student with fewer than seven grades has no division yet: (None, "INC").
    """
    if len(grades) < BEST_SUBJECTS:
        return None, "INC"
    best = sorted(GRADE_POINTS[grade] for grade in grades)[:BEST_SUBJECTS]
    points = sum(best)
    if points <= 17:
        division = "I"
    elif points <= 21:
        division = "II"
    elif points <= 25:
        division = "III"
    elif points <= 33:
        division = "IV"
    else:
        division = "0"
    return points, division
```

### `python/report.py`

```python
"""Read a class list, work out every student's results, and save them."""
import csv
import sys

from grades import division_for, grade_for

INFO_COLUMNS = ["admission_no", "name", "sex"]


def parse_mark(text, where):
    """A mark from the file: a whole number from 0 to 100, or None if blank."""
    text = text.strip()
    if text == "":
        return None
    try:
        mark = int(text)
    except ValueError:
        raise ValueError(f"{where}: '{text}' is not a whole number")
    if mark < 0 or mark > 100:
        raise ValueError(f"{where}: {mark} is not between 0 and 100")
    return mark


def read_class(path):
    """The subjects, and one dictionary for each student in the file."""
    with open(path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        subjects = [column for column in reader.fieldnames if column not in INFO_COLUMNS]
        students = []
        for line, row in enumerate(reader, start=2):
            marks = {}
            for subject in subjects:
                mark = parse_mark(row[subject], f"line {line}, {subject}")
                if mark is not None:
                    marks[subject] = mark
            students.append({
                "admission_no": row["admission_no"],
                "name": row["name"],
                "sex": row["sex"],
                "marks": marks,
            })
    return subjects, students


def results_for(student):
    """The student, with their average, points and division added."""
    marks = student["marks"]
    grades = [grade_for(mark) for mark in marks.values()]
    points, division = division_for(grades)
    average = round(sum(marks.values()) / len(marks), 1) if marks else 0.0
    return {**student, "average": average, "points": points, "division": division}


def sort_key(result):
    """Best first: fewest points, then highest average. Incomplete results last."""
    if result["points"] is None:
        return (1, 0, -result["average"])
    return (0, result["points"], -result["average"])


def save_results(path, results):
    with open(path, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["admission_no", "name", "sex", "subjects", "average", "points", "division"])
        for r in results:
            writer.writerow([r["admission_no"], r["name"], r["sex"], len(r["marks"]),
                             r["average"], r["points"] or "", r["division"]])


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "class_list.csv"
    try:
        subjects, students = read_class(path)
    except (OSError, ValueError) as error:
        print(f"Could not read the class list: {error}")
        sys.exit(1)

    results = sorted((results_for(s) for s in students), key=sort_key)

    print(f"{len(results)} students, {len(subjects)} subjects\n")
    print(f"{'No.':<4}{'Name':<15}{'Sex':<4}{'Average':>8}{'Points':>8}  Division")
    for number, r in enumerate(results, start=1):
        points = "-" if r["points"] is None else r["points"]
        print(f"{number:<4}{r['name']:<15}{r['sex']:<4}{r['average']:>8.1f}{points:>8}  {r['division']}")

    counts = {}
    for r in results:
        counts[r["division"]] = counts.get(r["division"], 0) + 1
    summary = "   ".join(f"{d}: {counts.get(d, 0)}" for d in ["I", "II", "III", "IV", "0", "INC"])
    print(f"\nDivisions   {summary}")

    save_results("results.csv", results)
    print("Saved results.csv")


if __name__ == "__main__":
    main()
```

`sys.argv` is the list of words typed after `python` on the command line. With `python report.py form3.csv`, `sys.argv[1]` is `"form3.csv"`, so the same program reads any class list; with no name, it reads `class_list.csv`. `sys.exit(1)` stops the program and tells the terminal it failed.

### `python/test_grades.py`

```python
"""Checks for grades.py. Run with: python -m unittest"""
import unittest

from grades import division_for, grade_for


class GradeTests(unittest.TestCase):
    def test_grade_boundaries(self):
        self.assertEqual(grade_for(75), "A")
        self.assertEqual(grade_for(74), "B")
        self.assertEqual(grade_for(65), "B")
        self.assertEqual(grade_for(45), "C")
        self.assertEqual(grade_for(44), "D")
        self.assertEqual(grade_for(30), "D")
        self.assertEqual(grade_for(29), "F")


class DivisionTests(unittest.TestCase):
    def test_only_the_best_seven_count(self):
        self.assertEqual(division_for(["A"] * 7 + ["F", "F"]), (7, "I"))

    def test_division_boundaries(self):
        self.assertEqual(division_for(["A"] + ["B"] * 2 + ["C"] * 4), (17, "I"))
        self.assertEqual(division_for(["B"] * 3 + ["C"] * 4), (18, "II"))
        self.assertEqual(division_for(["D"] * 2 + ["F"] * 5), (33, "IV"))
        self.assertEqual(division_for(["D"] + ["F"] * 6), (34, "0"))

    def test_fewer_than_seven_subjects(self):
        self.assertEqual(division_for(["A"] * 6), (None, "INC"))


if __name__ == "__main__":
    unittest.main()
```

### `python/save_to_db.py`

```python
"""Save a class list's marks into the results database from Chapter 4."""
import sys

import psycopg

from report import read_class

EXAM_NAME = "Mock examination"
EXAM_YEAR = 2026


def save(conn, subjects, students):
    """Add the exam, subjects, students and marks. Returns the exam's id."""
    with conn.cursor() as cur:
        cur.execute(
            """INSERT INTO exams (name, year) VALUES (%s, %s)
               ON CONFLICT (name, year) DO UPDATE SET name = EXCLUDED.name
               RETURNING id""",
            (EXAM_NAME, EXAM_YEAR),
        )
        exam_id = cur.fetchone()[0]

        subject_ids = {}
        for subject in subjects:
            cur.execute(
                """INSERT INTO subjects (name) VALUES (%s)
                   ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                   RETURNING id""",
                (subject,),
            )
            subject_ids[subject] = cur.fetchone()[0]

        for student in students:
            cur.execute(
                """INSERT INTO students (admission_no, name, sex) VALUES (%s, %s, %s)
                   ON CONFLICT (admission_no) DO UPDATE SET name = EXCLUDED.name, sex = EXCLUDED.sex
                   RETURNING id""",
                (student["admission_no"], student["name"], student["sex"]),
            )
            student_id = cur.fetchone()[0]
            for subject, mark in student["marks"].items():
                cur.execute(
                    """INSERT INTO marks (exam_id, student_id, subject_id, mark) VALUES (%s, %s, %s, %s)
                       ON CONFLICT (exam_id, student_id, subject_id) DO UPDATE SET mark = EXCLUDED.mark""",
                    (exam_id, student_id, subject_ids[subject], mark),
                )
    return exam_id


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "class_list.csv"
    subjects, students = read_class(path)

    # The user name and password come from the environment (PGUSER and
    # PGPASSWORD), never from the code.
    with psycopg.connect(host="localhost", dbname="mwangaza") as conn:
        exam_id = save(conn, subjects, students)
        top = conn.execute(
            """SELECT position, name, average, grade FROM student_results
               WHERE exam_id = %s ORDER BY position LIMIT 3""",
            (exam_id,),
        ).fetchall()

    print(f"Saved {len(students)} students and {len(subjects)} subjects for the {EXAM_NAME}, {EXAM_YEAR}.")
    print("Top three:")
    for position, name, average, grade in top:
        print(f"  {position}. {name}, average {average}, grade {grade}")


if __name__ == "__main__":
    main()
```

`ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name` looks as if it changes nothing — and it doesn't. It is there so that `RETURNING id` gives back the id of a subject or student that already existed, as well as of a new one.

### Try it yourself

1. Add an eleventh student to `class_list.csv` in Excel, save it as CSV UTF-8, and run the report again. Then type a mark of `105` and check the message names the right line.
2. Add a count of students in each division, separately for girls and boys — a table head teachers are often asked for.
3. Write a test for `parse_mark` that checks a blank cell gives `None` and `"7O"` raises a `ValueError`. (Hint: look up `assertRaises`.)
4. Change `report.py` so it also prints the average mark for each subject, highest first.
5. Add a `divisions` view to the database, or a column to `results.csv`, so the web page can show divisions instead of positions by average.

## Key terms

| English | Kiswahili | Meaning |
|---|---|---|
| Terminal | Kituo cha amri | A window where you type commands to the computer |
| Module | Moduli | A Python file whose functions other files can import |
| List | Orodha | Values kept in order |
| Dictionary | Kamusi | Values kept under names, called keys |
| Loop | Kitanzi | Code that repeats for each item |
| Exception | Hitilafu | An error raised while a program runs, which can be caught |
| Test | Jaribio | Code that checks other code gives the right answers |
| Library | Maktaba | Ready-made code you install and use, such as psycopg |
| Environment variable | Kigezo cha mazingira | A setting given to a program by the terminal, not written in the code |
| Division | Daraja | The overall Form 4 result, worked out from points |
| Points | Pointi | The value of a grade: A is 1, F is 5 |
| CSV file | Faili la CSV | A spreadsheet saved as plain text, with commas between cells |

## Check your understanding

1. Rewrite `if (mark >= 75) { return "A"; }` from JavaScript in Python.
2. A student's grades are A, A, B, B, C, C, C, D, F. What are their points from the best seven, and what is their division?
3. Why does Elia Kimaro, with an average of 54.1, come below Baraka Mushi, with 53.1?
4. Every value `csv.DictReader` reads is a string. Why does that matter for marks, and which line of `parse_mark` deals with it?
5. What does `raise` do in `parse_mark`, and where is that error finally caught?
6. Why does `report.py` end with `if __name__ == "__main__":`?
7. What is wrong with `cur.execute(f"SELECT * FROM students WHERE name = '{name}'")`, and how should it be written?
8. Why is the database password in `PGPASSWORD` and not written in `save_to_db.py`?
9. `save_to_db.py` is run twice by mistake. Why are the marks not doubled?
10. In the tests, why check 17 and 18 points rather than, say, 10 and 30?

### Answers

1. `if mark >= 75:` followed, on the next line and indented, by `return "A"`.
2. Points 1 + 1 + 2 + 2 + 3 + 3 + 3 = 15 — the D and F are not counted — so Division I.
3. Divisions count the best seven subjects, not the average. Elia missed Geography, so his best seven are all C grades: 21 points. Baraka's best seven include a B: 20 points.
4. Arithmetic on text goes wrong: `"81" + 5` is an error, and text compares differently from numbers. `int(text)` turns the text into a number — and refuses anything that is not a whole number.
5. It stops `parse_mark` and sends a `ValueError` back up through `read_class` to `main`, where `except (OSError, ValueError)` catches it and prints the message.
6. So that `main()` runs only when the file is run directly. When another file imports `report`, its functions can be used without a report being printed.
7. The name becomes part of the SQL, so a name containing SQL would be run: SQL injection. Write `cur.execute("SELECT * FROM students WHERE name = %s", (name,))`.
8. Code is copied, shared and published. A password in an environment variable stays on the computer where it was typed and is never saved in the project.
9. Every insert uses `ON CONFLICT ... DO UPDATE`: a row that already exists is updated, not added again.
10. Mistakes happen at boundaries — writing `<` instead of `<=`, for example. 17 and 18 are exactly where Division I ends and Division II begins; 10 and 30 would pass even with that mistake.
