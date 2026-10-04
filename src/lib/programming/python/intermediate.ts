import type { LevelTrack } from "../types";

export const intermediate: LevelTrack = {
  intro:
    "Write Python the way professionals do: handle errors cleanly, model data with classes and dataclasses, process files and JSON, use generators for large data, add type hints, call web APIs and test your code with pytest.",
  outcomes: [
    "Handle and raise exceptions, including custom ones",
    "Model data with classes and dataclasses",
    "Process files, CSV and JSON with pathlib, iterators and generators",
    "Type-check with mypy, call HTTP APIs and test with pytest",
  ],
  lessons: [
    {
      slug: "exceptions",
      title: "Errors & Exceptions",
      summary: "try / except / else / finally, raising errors and custom exception classes.",
      body: [
        "When something goes wrong, Python raises an exception: `ValueError` for bad values, `KeyError` for missing dictionary keys, `FileNotFoundError`, and so on. Unhandled, it stops the program with a traceback.",
        "Catch only the exceptions you can actually handle, as specifically as possible — never use a bare `except:` that hides every bug. `else` runs when no exception happened; `finally` always runs (for cleanup).",
        "Raise your own errors with `raise`. Custom exception classes (subclasses of `Exception`) let callers tell different failures apart. Use `raise ... from err` to keep the original cause.",
      ],
      code: [
        {
          filename: "errors.py",
          lang: "python",
          source: `
class StudentNotFoundError(Exception):
    def __init__(self, student_id: str) -> None:
        super().__init__(f"Student {student_id} not found")
        self.student_id = student_id


STUDENTS = {"s1": "Amina"}


def get_student(student_id: str) -> str:
    try:
        return STUDENTS[student_id]
    except KeyError as err:
        raise StudentNotFoundError(student_id) from err


def parse_score(text: str) -> int:
    score = int(text)                      # may raise ValueError
    if not 0 <= score <= 100:
        raise ValueError(f"score must be 0-100, got {score}")
    return score


for raw in ["88", "abc", "150"]:
    try:
        score = parse_score(raw)
    except ValueError as err:
        print(f"{raw!r}: invalid ({err})")
    else:
        print(f"{raw!r}: ok -> {score}")
    finally:
        print("  checked", raw)

try:
    get_student("s9")
except StudentNotFoundError as err:
    print("404:", err, "| cause:", repr(err.__cause__))
`,
        },
      ],
      keyPoints: [
        "Catch specific exceptions; never a bare `except:`.",
        "`else` = success path, `finally` = always-run cleanup.",
        "Custom exceptions + `raise ... from err` make failures clear and traceable.",
      ],
      exercise:
        "Write `parse_line(line)` that turns \"Amina,88\" into `(name, score)` and raises a custom `InvalidLineError` with a helpful message for a missing comma, empty name or bad score. Process a list of lines and print the valid rows plus an error count.",
    },
    {
      slug: "classes-and-dataclasses",
      title: "Classes & Dataclasses",
      summary: "Bundle data and behaviour with classes; remove boilerplate with @dataclass.",
      body: [
        "A class defines a new type: its data (attributes) and behaviour (methods). `__init__` sets up a new object; `self` refers to the object itself. A leading underscore (`_balance`) signals \"internal — don't touch from outside\".",
        "`@property` exposes a computed or read-only value like an attribute. Special methods such as `__repr__` and `__eq__` control how objects print and compare.",
        "For classes that are mostly data, `@dataclass` writes `__init__`, `__repr__` and `__eq__` for you. `frozen=True` makes instances immutable, and `field(default_factory=list)` gives each object its own list.",
      ],
      code: [
        {
          filename: "classes.py",
          lang: "python",
          source: `
from dataclasses import dataclass, field


class Account:
    def __init__(self, owner: str) -> None:
        self.owner = owner
        self._balance = 0

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    def withdraw(self, amount: int) -> None:
        if amount > self._balance:
            raise ValueError(f"insufficient funds: short by {amount - self._balance}")
        self._balance -= amount

    @property
    def balance(self) -> int:
        return self._balance

    def __repr__(self) -> str:
        return f"Account(owner={self.owner!r}, balance={self._balance})"


@dataclass
class Student:
    name: str
    form: int
    scores: list[int] = field(default_factory=list)

    @property
    def average(self) -> float:
        return sum(self.scores) / len(self.scores) if self.scores else 0.0


@dataclass(frozen=True)
class Subject:
    code: str
    name: str


acc = Account("Amina")
acc.deposit(50_000)
acc.withdraw(20_000)
print(acc, acc.balance)

s = Student("Neema", 4)
s.scores += [71, 84]
print(s, f"average={s.average:.1f}")
print(Subject("BIO", "Biology") == Subject("BIO", "Biology"))   # True
`,
        },
      ],
      keyPoints: [
        "Keep internal state behind methods and `@property`.",
        "Use `@dataclass` for data-holding classes — less code, fewer bugs.",
        "Mutable defaults need `field(default_factory=...)`.",
      ],
      exercise:
        "Build a `Library` class that manages `Book` dataclasses (isbn, title, author, available). Add `borrow(isbn)`, `give_back(isbn)` and `available_books()`, raising a custom error when a book is already borrowed.",
    },
    {
      slug: "files-json-csv",
      title: "Files, Paths, CSV & JSON",
      summary: "Navigate the file system with pathlib and convert between CSV and JSON.",
      body: [
        "`pathlib.Path` is the modern way to work with files: join paths with `/`, check `.exists()`, list files with `.glob(\"*.csv\")`, and read or write small files with `.read_text()` / `.write_text()`.",
        "The `csv` module handles quoting and commas inside values correctly — never split CSV lines by hand. `csv.DictReader` gives each row as a dictionary keyed by the header.",
        "The `json` module converts between Python objects and JSON text: `json.dumps`/`json.loads` for strings, `json.dump`/`json.load` for files. JSON is the standard format for APIs and config files.",
      ],
      code: [
        {
          filename: "convert.py",
          lang: "python",
          source: `
import csv
import json
from pathlib import Path

data_dir = Path("data")
data_dir.mkdir(exist_ok=True)

csv_path = data_dir / "results.csv"
csv_path.write_text(
    "name,subject,score\\n"
    "Amina,Maths,88\\n"
    "Amina,Biology,79\\n"
    'Juma,"Book-Keeping, Paper 1",42\\n',
    encoding="utf-8",
)

report: dict[str, dict[str, int]] = {}
with csv_path.open(encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        report.setdefault(row["name"], {})[row["subject"]] = int(row["score"])

json_path = data_dir / "results.json"
json_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

loaded = json.loads(json_path.read_text(encoding="utf-8"))
print(loaded["Juma"])                         # {'Book-Keeping, Paper 1': 42}
print([p.name for p in sorted(data_dir.glob("*"))])
`,
        },
      ],
      keyPoints: [
        "Use `pathlib.Path` instead of string paths.",
        "Use the `csv` module — values can contain commas and quotes.",
        "`json.dumps(obj, indent=2)` for readable output; `json.loads` to parse.",
      ],
      exercise:
        "Write a script that reads every `.csv` file in a folder, combines them, and writes a `summary.json` with each student's average and best subject.",
    },
    {
      slug: "iterators-and-generators",
      title: "Iterators, Generators & Comprehensions",
      summary: "Process large data lazily with generators, yield and itertools.",
      body: [
        "A list holds all its items in memory at once. A generator produces items one at a time, only when asked — so you can process a 10 GB file or an endless stream with tiny memory use.",
        "Write a generator function with `yield` instead of `return`, or a generator expression with round brackets: `(x * 2 for x in data)`. Chain generators into a pipeline where each step handles one item at a time.",
        "The `itertools` module has fast building blocks: `islice` (take the first n), `groupby`, `chain`, `count` and more. `collections.Counter` counts things in one line.",
      ],
      code: [
        {
          filename: "generators.py",
          lang: "python",
          source: `
from collections import Counter
from collections.abc import Iterable, Iterator
from itertools import islice


def read_scores(lines: Iterable[str]) -> Iterator[tuple[str, int]]:
    for line in lines:
        name, _, score = line.strip().partition(",")
        if score.isdigit():
            yield name, int(score)


def grades(rows: Iterable[tuple[str, int]]) -> Iterator[str]:
    for _, score in rows:
        yield "A" if score >= 75 else "B" if score >= 65 else "C" if score >= 45 else "D" if score >= 30 else "F"


def numbers_from(start: int) -> Iterator[int]:
    while True:              # infinite, but lazy
        yield start
        start += 1


lines = ["Amina,88", "Juma,42", "bad line", "Neema,71", "Ali,29"]
print(Counter(grades(read_scores(lines))))    # Counter({'A': 1, 'D': 1, 'B': 1, 'F': 1})

print(list(islice(numbers_from(10), 5)))      # [10, 11, 12, 13, 14]

total = sum(n * n for n in range(1_000_000))  # generator expression: no big list in memory
print(total)
`,
        },
      ],
      keyPoints: [
        "Generators (`yield`) produce items lazily — ideal for big or endless data.",
        "Use `(...)` generator expressions inside `sum`, `max`, `any` instead of building lists.",
        "`itertools` and `collections.Counter` solve many problems in one line.",
      ],
      exercise:
        "Write a generator `chunks(items, size)` that yields lists of `size` items. Use it to process a list of 1,000 student IDs in batches of 100 and print each batch's first and last ID.",
    },
    {
      slug: "type-hints",
      title: "Type Hints & mypy",
      summary: "Add types to functions and data, then let mypy find bugs before you run the code.",
      body: [
        "Type hints describe what a function accepts and returns. Python ignores them at runtime, but a type checker such as mypy (or your editor) reads them and reports mistakes like passing a `str` where an `int` is expected.",
        "Common hints: `list[int]`, `dict[str, float]`, `tuple[str, int]`, `X | None` for optional values, `Literal[\"pending\", \"paid\"]` for fixed options, and `TypedDict` for dictionaries with known keys.",
        "Add hints gradually — start with function signatures. Run `mypy` in your project (and in CI) the same way you run tests.",
      ],
      code: [
        {
          filename: "typed.py",
          lang: "python",
          source: `
from typing import Literal, TypedDict

Status = Literal["pending", "paid", "failed"]


class Payment(TypedDict):
    id: int
    amount: int
    status: Status
    phone: str | None


def total_paid(payments: list[Payment]) -> int:
    return sum(p["amount"] for p in payments if p["status"] == "paid")


def find(payments: list[Payment], payment_id: int) -> Payment | None:
    for p in payments:
        if p["id"] == payment_id:
            return p
    return None


payments: list[Payment] = [
    {"id": 1, "amount": 15_000, "status": "paid", "phone": "0712345678"},
    {"id": 2, "amount": 8_000, "status": "pending", "phone": None},
]

print(total_paid(payments))
found = find(payments, 2)
if found is not None:                  # mypy forces this check
    print(found["status"])
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pip install mypy
mypy --strict typed.py
`,
        },
      ],
      keyPoints: [
        "Hints are checked by tools, not by Python at runtime.",
        "`X | None` forces you to handle the missing case.",
        "Run mypy regularly — it catches bugs tests may miss.",
      ],
      exercise:
        "Add full type hints to your Library exercise from the Classes lesson and run `mypy --strict` on it until it reports no errors.",
    },
    {
      slug: "http-apis",
      title: "Calling Web APIs",
      summary: "Make HTTP requests, handle errors and timeouts, and work with JSON responses.",
      body: [
        "Most services expose data through HTTP APIs that return JSON. The popular `requests` library makes calls simple: `requests.get(url, params=..., timeout=...)`.",
        "Always set a `timeout` — without one, a slow server can hang your program forever. Call `response.raise_for_status()` to turn HTTP errors (404, 500) into exceptions, then `response.json()` to parse the body.",
        "Use a `requests.Session` when making many calls to the same server: it reuses connections and lets you set shared headers (such as an API key) once. Keep API keys in environment variables, never in code.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pip install requests
`,
        },
        {
          filename: "api.py",
          lang: "python",
          source: `
import os

import requests

BASE_URL = "https://jsonplaceholder.typicode.com"


def get_user(session: requests.Session, user_id: int) -> dict:
    response = session.get(f"{BASE_URL}/users/{user_id}", timeout=5)
    response.raise_for_status()
    return response.json()


def main() -> None:
    with requests.Session() as session:
        session.headers["Authorization"] = f"Bearer {os.environ.get('API_TOKEN', 'demo')}"
        for user_id in [1, 2, 999]:
            try:
                user = get_user(session, user_id)
                print(f"{user['name']} - {user['address']['city']}")
            except requests.HTTPError as err:
                print(f"user {user_id}: HTTP {err.response.status_code}")
            except requests.RequestException as err:
                print(f"user {user_id}: network problem: {err}")


if __name__ == "__main__":
    main()
`,
        },
      ],
      keyPoints: [
        "Always pass `timeout=` to network calls.",
        "`raise_for_status()` turns HTTP error codes into exceptions.",
        "Read secrets such as API keys from environment variables.",
      ],
      exercise:
        "Fetch the posts for user 1 from `/posts?userId=1` using `params={\"userId\": 1}`, and print the five longest post titles. Add a retry: if a request fails with a network error, wait one second and try again up to three times.",
    },
    {
      slug: "testing-pytest",
      title: "Testing with pytest",
      summary: "Write automated tests with plain assert statements, fixtures and parametrize.",
      body: [
        "pytest is the standard Python test tool. Tests are plain functions whose names start with `test_`, in files named `test_*.py`, using ordinary `assert` statements. Run them all with `pytest`.",
        "`pytest.raises` checks that code raises the right exception. `@pytest.mark.parametrize` runs one test with many inputs — perfect for boundaries.",
        "Fixtures provide ready-made test data or resources. pytest's built-in `tmp_path` fixture gives each test its own temporary folder.",
      ],
      code: [
        {
          filename: "grading.py",
          lang: "python",
          source: `
def grade_for(score: float) -> str:
    if not 0 <= score <= 100:
        raise ValueError("score must be between 0 and 100")
    if score >= 75:
        return "A"
    if score >= 65:
        return "B"
    if score >= 45:
        return "C"
    if score >= 30:
        return "D"
    return "F"
`,
        },
        {
          filename: "test_grading.py",
          lang: "python",
          source: `
import pytest

from grading import grade_for


@pytest.mark.parametrize(
    ("score", "expected"),
    [(100, "A"), (75, "A"), (74, "B"), (65, "B"), (45, "C"), (30, "D"), (29, "F"), (0, "F")],
)
def test_grade_boundaries(score: float, expected: str) -> None:
    assert grade_for(score) == expected


@pytest.mark.parametrize("bad", [-1, 101])
def test_rejects_out_of_range(bad: float) -> None:
    with pytest.raises(ValueError, match="between 0 and 100"):
        grade_for(bad)


def test_report_file(tmp_path) -> None:
    report = tmp_path / "report.txt"
    report.write_text(grade_for(88), encoding="utf-8")
    assert report.read_text(encoding="utf-8") == "A"
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pip install pytest
pytest -q
`,
        },
      ],
      keyPoints: [
        "Plain `assert` + functions named `test_*` — no boilerplate.",
        "Parametrize boundary values instead of copy-pasting tests.",
        "Use `tmp_path` for file tests so nothing touches real data.",
      ],
      exercise:
        "Write pytest tests for your `parse_line` function from the Exceptions lesson: valid lines, each kind of invalid line (using `pytest.raises`), and extra whitespace around values.",
    },
  ],
};
