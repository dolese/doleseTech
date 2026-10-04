import type { LevelTrack } from "../types";
import { stringsAndText, datesAndTimes } from "./more";

export const beginner: LevelTrack = {
  intro:
    "Start from zero: install Python, run your first program, and learn the building blocks of every program — values, decisions, loops, functions, collections, files and modules.",
  outcomes: [
    "Install Python, create a virtual environment and run .py files",
    "Work with numbers, text, booleans and f-strings",
    "Write conditions, loops and functions to solve small problems",
    "Store data in lists, dictionaries, tuples and sets, and read and write files",
  ],
  lessons: [
    {
      slug: "setup",
      title: "Setting up Python",
      summary: "Install Python, use the interactive shell, create a virtual environment and run a script.",
      body: [
        "Python is a general-purpose language known for readable code. It is used for automation, data analysis, web back-ends, AI and teaching. Install the latest Python 3 from python.org (on Windows, tick \"Add python.exe to PATH\"). Check it with `python --version` (on macOS/Linux the command may be `python3`).",
        "Typing `python` alone opens the interactive shell (REPL), where each line runs immediately — perfect for experiments. Type `exit()` to leave.",
        "For real projects, create a virtual environment: a private folder of packages for that project, so different projects don't clash. Create it once with `python -m venv .venv`, activate it, then install packages with `pip`.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
python --version
mkdir hello-python && cd hello-python
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\\Scripts\\activate
`,
        },
        {
          filename: "hello.py",
          lang: "python",
          source: `
from datetime import date

name = "Dolese"
year = date.today().year

print(f"Hello, {name}! Welcome to Python in {year}.")
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
python hello.py
`,
        },
      ],
      keyPoints: [
        "Use Python 3 — Python 2 is long retired.",
        "The REPL is for quick experiments; `.py` files are for programs you keep.",
        "One virtual environment per project keeps dependencies isolated.",
      ],
      exercise:
        "Create `about.py` that stores your name, age and school in variables and prints one sentence about yourself using an f-string. Then open the REPL and use it as a calculator: what is `2 ** 10`, `17 // 5` and `17 % 5`?",
    },
    {
      slug: "variables-and-types",
      title: "Variables, Types & Strings",
      summary: "Numbers, text, booleans, None, f-strings and converting user input.",
      body: [
        "A variable is a name pointing to a value: `score = 78`. Python works out the type from the value — `int` (whole numbers), `float` (decimals), `str` (text), `bool` (`True`/`False`) and `None` (no value). Use `type(x)` to check.",
        "Strings have many useful methods: `.upper()`, `.strip()`, `.replace()`, `.split()`. f-strings (`f\"...\"`) insert values into text and can format them, e.g. `{average:.1f}` for one decimal place.",
        "`input()` always returns a string. Convert it with `int()` or `float()` before doing arithmetic.",
      ],
      code: [
        {
          filename: "basics.py",
          lang: "python",
          source: `
school = "Azania Secondary"   # str
students = 420                # int
fee = 150_000.50              # float (underscores make big numbers readable)
is_open = True                # bool
nickname = None               # no value yet

students += 15
print(type(students), students)

name = "  amina juma  "
clean = name.strip().title()
print(clean)                       # Amina Juma
print(clean.split())               # ['Amina', 'Juma']
print(len(clean), clean.lower())

scores = "78,64,91"
total = sum(int(s) for s in scores.split(","))
average = total / 3
print(f"{school}: total={total}, average={average:.1f}")

age_text = "17"            # imagine this came from input()
age = int(age_text)
print(f"Next year you will be {age + 1}")
`,
        },
      ],
      keyPoints: [
        "Python infers types; `type()` shows them.",
        "f-strings are the clearest way to build text: `f\"{value:.2f}\"`.",
        "`input()` returns `str` — convert before calculating.",
      ],
      exercise:
        "Write a program that asks for a student's name and three scores using `input()`, then prints the name in title case and the average to one decimal place.",
    },
    {
      slug: "control-flow",
      title: "Decisions & Loops",
      summary: "if / elif / else, comparison and logical operators, for loops with range, and while.",
      body: [
        "Python uses indentation (4 spaces) to group code — there are no braces. `if`, `elif` and `else` choose between branches; combine conditions with `and`, `or` and `not`.",
        "A `for` loop walks through any sequence: a list, a string, or `range(start, stop)`. `enumerate()` gives you the position and the item together.",
        "A `while` loop repeats until its condition becomes false. `break` leaves a loop early; `continue` skips to the next round.",
      ],
      code: [
        {
          filename: "grades.py",
          lang: "python",
          source: `
def grade_for(score):
    if score >= 75:
        return "A"
    elif score >= 65:
        return "B"
    elif score >= 45:
        return "C"
    elif score >= 30:
        return "D"
    else:
        return "F"


scores = [82, 67, 49, 31, 18]

for i, score in enumerate(scores, start=1):
    grade = grade_for(score)
    status = "pass" if grade != "F" else "fail"
    print(f"Student {i}: {score} -> {grade} ({status})")

for n in range(1, 16):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)

countdown = 3
while countdown > 0:
    print(f"Starting in {countdown}...")
    countdown -= 1
`,
        },
      ],
      keyPoints: [
        "Indentation is syntax in Python — keep it consistent (4 spaces).",
        "`for item in sequence` is the normal loop; `range()` makes number sequences.",
        "`x if condition else y` picks a value in one line.",
      ],
      exercise:
        "Print the multiplication table for a number from 1 to 12. Then write a guessing game: pick a secret number, keep asking the user with `while` until they guess it, and print \"higher\" or \"lower\" hints.",
    },
    {
      slug: "functions",
      title: "Functions",
      summary: "def, parameters, default values, return values, docstrings and type hints.",
      body: [
        "A function packages steps under a name so you can reuse and test them. Define it with `def`, give it parameters, and `return` a result. A function without `return` returns `None`.",
        "Parameters can have default values, and callers can pass arguments by name (keyword arguments), which makes calls easier to read.",
        "Add a docstring (a string on the first line) to explain what the function does, and type hints (`score: float -> str`) to document the expected types. Python doesn't enforce hints at runtime, but editors and tools like mypy use them to catch mistakes.",
      ],
      code: [
        {
          filename: "functions.py",
          lang: "python",
          source: `
def percentage(score: float, out_of: float = 100) -> int:
    """Return score as a whole-number percentage of out_of."""
    return round(score / out_of * 100)


def greet(name: str, title: str | None = None) -> str:
    if title:
        return f"Hello, {title} {name}"
    return f"Hello, {name}"


def stats(values: list[float]) -> tuple[float, float, float]:
    """Return (minimum, maximum, average)."""
    return min(values), max(values), sum(values) / len(values)


print(percentage(42, 50))               # 84
print(greet("Amina"))
print(greet("Juma", title="Mr."))       # keyword argument

low, high, avg = stats([78, 64, 91])     # unpack the returned tuple
print(f"low={low} high={high} avg={avg:.1f}")

square = lambda n: n * n                 # tiny anonymous function
print(sorted(["Neema", "Ali", "Baraka"], key=len), square(9))
`,
        },
      ],
      keyPoints: [
        "One function, one job — small functions are easier to test and reuse.",
        "Use default values and keyword arguments for readable calls.",
        "Docstrings and type hints document intent; tools use them to find bugs.",
      ],
      exercise:
        "Write `area_of_rectangle(width, height)` and `area_of_circle(radius)` with type hints and docstrings. Then write `describe_area(area, units=\"cm\")` that returns a string like \"Area: 12.00 cm²\".",
    },
    stringsAndText,
    {
      slug: "collections",
      title: "Lists, Tuples, Dictionaries & Sets",
      summary: "Store groups of values, loop over them and build new ones with comprehensions.",
      body: [
        "A `list` is an ordered, changeable sequence: `[78, 64, 91]`. A `tuple` is like a list but cannot change: `(\"Biology\", 85)`. A `dict` maps keys to values: `{\"name\": \"Amina\", \"score\": 88}`. A `set` holds unique values with fast membership checks.",
        "Comprehensions build a new collection from an existing one in one readable line: `[s for s in scores if s >= 30]`.",
        "A list of dictionaries is the most common way to hold simple records in Python — much like rows in a spreadsheet.",
      ],
      code: [
        {
          filename: "collections_demo.py",
          lang: "python",
          source: `
students = [
    {"name": "Amina", "form": 4, "score": 88},
    {"name": "Baraka", "form": 3, "score": 54},
    {"name": "Neema", "form": 4, "score": 71},
]

form_four = [s["name"] for s in students if s["form"] == 4]
print(form_four)                              # ['Amina', 'Neema']

average = sum(s["score"] for s in students) / len(students)
top = max(students, key=lambda s: s["score"])
print(f"Average {average:.1f}, top: {top['name']}")

by_name = {s["name"]: s["score"] for s in students}   # dict comprehension
by_name["Juma"] = 42                                  # add a key
print(by_name.get("Neema"), by_name.get("Ali", "not found"))

for name, score in by_name.items():
    print(f"{name:<8}{score:>4}")

subjects_a = {"Maths", "Physics", "Chemistry"}
subjects_b = {"Maths", "Biology"}
print(subjects_a & subjects_b, subjects_a | subjects_b)   # intersection, union

point = (3, 4)            # tuple: fixed pair
x, y = point
print((x ** 2 + y ** 2) ** 0.5)   # 5.0
`,
        },
      ],
      keyPoints: [
        "list = ordered & changeable, tuple = fixed, dict = key → value, set = unique items.",
        "Comprehensions replace most build-a-list loops.",
        "`dict.get(key, default)` avoids errors for missing keys.",
      ],
      exercise:
        "Given a list of product dictionaries (name, price, quantity), print: the names of products under 5,000 TSh, the total stock value, and a dictionary of category → number of products. Use comprehensions where possible.",
    },
    {
      slug: "files-and-modules",
      title: "Files, Modules & pip",
      summary: "Read and write files safely, split code into modules, and install packages.",
      body: [
        "Open files with `with open(...) as f:` — the `with` block closes the file automatically, even if an error happens. Use mode `\"w\"` to write, `\"a\"` to append and the default `\"r\"` to read, and always pass `encoding=\"utf-8\"`.",
        "Any `.py` file is a module. Put related functions in one file and `import` them elsewhere. The check `if __name__ == \"__main__\":` runs code only when the file is executed directly, not when it is imported.",
        "Python's standard library covers a lot (`csv`, `json`, `datetime`, `pathlib`, `random`...). For everything else, install packages from PyPI with `pip install` inside your virtual environment, and record them in `requirements.txt`.",
      ],
      code: [
        {
          filename: "grading.py",
          lang: "python",
          source: `
PASS_MARK = 30


def average(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def passed(values: list[float]) -> int:
    return sum(1 for v in values if v >= PASS_MARK)
`,
        },
        {
          filename: "main.py",
          lang: "python",
          source: `
import csv

from grading import average, passed


def main() -> None:
    with open("scores.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["name", "score"])
        writer.writerows([["Amina", 88], ["Juma", 25], ["Neema", 71]])

    with open("scores.csv", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    scores = [float(r["score"]) for r in rows]
    print(f"Average: {average(scores):.1f}")
    print(f"Passed: {passed(scores)} of {len(scores)}")


if __name__ == "__main__":
    main()
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
python main.py
pip install requests            # install a package from PyPI
pip freeze > requirements.txt   # record exact versions
pip install -r requirements.txt # recreate on another machine
`,
        },
      ],
      keyPoints: [
        "Always use `with open(...)` and `encoding=\"utf-8\"`.",
        "Use `if __name__ == \"__main__\":` for a module's entry point.",
        "Install packages inside a virtual environment and pin them in requirements.txt.",
      ],
      exercise:
        "Create `text_tools.py` with `word_count(text)` and `longest_word(text)`. In `main.py`, read a .txt file, print both results, and append a summary line to `report.txt`.",
    },
    datesAndTimes,
  ],
};
