import type { Practice } from "../../types";
import { regularExpressions as regularExpressionsPractice, pandasBasics as pandasBasicsPractice } from "./more";

export const intermediate: Record<string, Practice> = {
  exceptions: {
    solution: {
      notes: [
        "`parse_line` raises one custom exception type with a specific message for each problem. The loop catches only `InvalidLineError`, so a genuine bug elsewhere would still surface instead of being hidden.",
      ],
      code: [
        {
          filename: "parse_lines.py",
          lang: "python",
          source: `
class InvalidLineError(Exception):
    """Raised when a 'name,score' line cannot be parsed."""


def parse_line(line: str) -> tuple[str, int]:
    if "," not in line:
        raise InvalidLineError(f"missing comma in {line!r}")
    name, _, score_text = line.partition(",")
    name = name.strip()
    if not name:
        raise InvalidLineError(f"empty name in {line!r}")
    try:
        score = int(score_text)
    except ValueError as err:
        raise InvalidLineError(f"score is not a whole number in {line!r}") from err
    if not 0 <= score <= 100:
        raise InvalidLineError(f"score out of range in {line!r}")
    return name, score


lines = ["Amina,88", "Juma 42", ",70", "Neema,abc", "Ali,150", "Rehema, 71"]
valid, errors = [], 0
for line in lines:
    try:
        valid.append(parse_line(line))
    except InvalidLineError as err:
        errors += 1
        print("Skipped:", err)

print(valid)               # [('Amina', 88), ('Rehema', 71)]
print("Errors:", errors)   # Errors: 4
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why should you avoid a bare `except:`?",
        options: [
          "It is slower",
          "It catches everything, hiding real bugs (even Ctrl+C)",
          "It is a syntax error",
          "It only catches `ValueError`",
        ],
        answer: 1,
        explanation: "Catch only the specific exceptions you can actually handle.",
      },
      {
        question: "When does the `else` block of a `try` statement run?",
        options: [
          "Always",
          "Only when an exception happened",
          "Only when no exception happened",
          "Never — it's a syntax error",
        ],
        answer: 2,
        explanation: "`else` is the success path; `finally` is the always-run cleanup.",
      },
      {
        question: "What does `raise StudentNotFoundError(id) from err` add?",
        options: [
          "It keeps the original exception as the cause, visible in the traceback",
          "It suppresses the original error",
          "It retries the operation",
          "It logs to a file",
        ],
        answer: 0,
        explanation: "Chaining with `from` preserves the root cause for debugging.",
      },
      {
        question: "Which exception does `int(\"abc\")` raise?",
        options: ["`TypeError`", "`KeyError`", "`IndexError`", "`ValueError`"],
        answer: 3,
        explanation: "The type is right (a string) but the value can't be converted, so it's a `ValueError`.",
      },
    ],
  },

  "classes-and-dataclasses": {
    solution: {
      notes: [
        "`Book` is a dataclass because it is mostly data. `Library` keeps books in a dictionary keyed by ISBN and raises a custom error when a book is already out, so callers can respond to that case specifically.",
      ],
      code: [
        {
          filename: "library.py",
          lang: "python",
          source: `
from dataclasses import dataclass


class BookAlreadyBorrowedError(Exception):
    pass


@dataclass
class Book:
    isbn: str
    title: str
    author: str
    available: bool = True


class Library:
    def __init__(self) -> None:
        self._books: dict[str, Book] = {}

    def add(self, book: Book) -> None:
        self._books[book.isbn] = book

    def borrow(self, isbn: str) -> Book:
        book = self._books[isbn]               # KeyError for an unknown ISBN
        if not book.available:
            raise BookAlreadyBorrowedError(f"{book.title!r} is already borrowed")
        book.available = False
        return book

    def give_back(self, isbn: str) -> None:
        self._books[isbn].available = True

    def available_books(self) -> list[str]:
        return [b.title for b in self._books.values() if b.available]


library = Library()
library.add(Book("978-1", "Things Fall Apart", "Chinua Achebe"))
library.add(Book("978-2", "Kinjeketile", "Ebrahim Hussein"))

library.borrow("978-1")
print(library.available_books())    # ['Kinjeketile']
try:
    library.borrow("978-1")
except BookAlreadyBorrowedError as err:
    print("Sorry:", err)
library.give_back("978-1")
print(library.available_books())    # ['Things Fall Apart', 'Kinjeketile']
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `@dataclass` generate for you?",
        options: [
          "A database table",
          "`__init__`, `__repr__` and `__eq__` methods",
          "Getters and setters for private fields",
          "A JSON file",
        ],
        answer: 1,
        explanation: "Dataclasses remove the boilerplate of data-holding classes.",
      },
      {
        question: "Why write `scores: list[int] = field(default_factory=list)` instead of `= []`?",
        options: [
          "So each object gets its own new list instead of sharing one",
          "It is faster",
          "Lists aren't allowed as defaults in Python",
          "To make the list immutable",
        ],
        answer: 0,
        explanation: "A plain mutable default would be shared by every instance — a classic bug.",
      },
      {
        question: "What does `@property` let you do?",
        options: [
          "Make a method private",
          "Run code only once",
          "Access a computed value like an attribute, e.g. `student.average`",
          "Delete an attribute",
        ],
        answer: 2,
        explanation: "Properties look like attributes but run a method behind the scenes.",
      },
      {
        question: "What does a leading underscore, as in `self._balance`, signal?",
        options: [
          "Python makes it unreadable from outside",
          "It is a constant",
          "It is a class variable",
          "It's internal — other code shouldn't use it directly",
        ],
        answer: 3,
        explanation: "It's a convention, not enforcement: \"this is an implementation detail\".",
      },
    ],
  },

  "files-json-csv": {
    solution: {
      notes: [
        "`Path.glob(\"*.csv\")` finds every CSV file in the folder. Each row is added to a per-student dictionary of subject → score; then the summary computes each student's average and best subject and is written as JSON.",
      ],
      code: [
        {
          filename: "summarise.py",
          lang: "python",
          source: `
import csv
import json
from pathlib import Path

folder = Path("results")
folder.mkdir(exist_ok=True)
(folder / "term1.csv").write_text("name,subject,score\\nAmina,Maths,88\\nJuma,Maths,42\\n", encoding="utf-8")
(folder / "term2.csv").write_text("name,subject,score\\nAmina,Biology,79\\nJuma,Biology,61\\n", encoding="utf-8")

scores: dict[str, dict[str, int]] = {}
for path in sorted(folder.glob("*.csv")):
    with path.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            scores.setdefault(row["name"], {})[row["subject"]] = int(row["score"])

summary = {
    name: {
        "average": round(sum(subjects.values()) / len(subjects), 1),
        "best_subject": max(subjects, key=subjects.get),
    }
    for name, subjects in scores.items()
}

Path("summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(Path("summary.json").read_text(encoding="utf-8"))
`,
        },
      ],
    },
    quiz: [
      {
        question: "How do you join a folder and a file name with `pathlib`?",
        options: ["`folder + \"file.csv\"`", "`folder / \"file.csv\"`", "`folder.join(\"file.csv\")`", "`folder & \"file.csv\"`"],
        answer: 1,
        explanation: "`Path` overloads `/` to build paths that work on every operating system.",
      },
      {
        question: "Why use the `csv` module instead of `line.split(\",\")`?",
        options: [
          "It is the only way to read files",
          "`split` doesn't work on strings",
          "Values can contain quoted commas, which `split` would break apart",
          "It converts numbers automatically",
        ],
        answer: 2,
        explanation: "`\"Book-Keeping, Paper 1\"` is one value — the `csv` module understands the quotes.",
      },
      {
        question: "What is the difference between `json.dumps` and `json.dump`?",
        options: [
          "`dumps` returns a string; `dump` writes to a file object",
          "`dumps` is for lists only",
          "There is none",
          "`dump` is faster but less accurate",
        ],
        answer: 0,
        explanation: "The `s` stands for string. Likewise `loads` parses a string and `load` reads a file.",
      },
      {
        question: "What does `csv.DictReader` give you for each row?",
        options: [
          "A list of values",
          "A single string",
          "A tuple",
          "A dictionary keyed by the column headers",
        ],
        answer: 3,
        explanation: "Accessing `row[\"score\"]` by name is clearer than remembering column positions.",
      },
    ],
  },

  "iterators-and-generators": {
    solution: {
      notes: [
        "`chunks` is a generator: it slices the list `size` items at a time and `yield`s each batch, so only one batch is handled at once.",
      ],
      code: [
        {
          filename: "batches.py",
          lang: "python",
          source: `
from collections.abc import Iterator, Sequence
from typing import TypeVar

T = TypeVar("T")


def chunks(items: Sequence[T], size: int) -> Iterator[list[T]]:
    for start in range(0, len(items), size):
        yield list(items[start:start + size])


student_ids = [f"S{n:04d}" for n in range(1, 1001)]

for number, batch in enumerate(chunks(student_ids, 100), start=1):
    print(f"Batch {number:>2}: {batch[0]} .. {batch[-1]} ({len(batch)} ids)")
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is the main advantage of a generator over building a full list?",
        options: [
          "Generators are always faster",
          "It produces items one at a time, so memory use stays small",
          "Generators can be indexed like lists",
          "They sort data automatically",
        ],
        answer: 1,
        explanation: "Lazy evaluation lets you process huge or infinite sequences.",
      },
      {
        question: "Which keyword turns a function into a generator?",
        options: ["`return`", "`async`", "`yield`", "`lambda`"],
        answer: 2,
        explanation: "A function containing `yield` returns a generator when called.",
      },
      {
        question: "Which expression adds up squares without building a list in memory?",
        options: [
          "`sum(n * n for n in range(1_000_000))`",
          "`sum([n * n for n in range(1_000_000)])`",
          "`sum(list(range(1_000_000)))`",
          "`range(1_000_000).sum()`",
        ],
        answer: 0,
        explanation: "Round brackets make a generator expression; square brackets build the whole list first.",
      },
      {
        question: "What does `Counter([\"A\", \"B\", \"A\"])` produce?",
        options: ["`[\"A\", \"B\"]`", "`2`", "`{\"A\": \"B\"}`", "`Counter({'A': 2, 'B': 1})`"],
        answer: 3,
        explanation: "`collections.Counter` counts how many times each item appears.",
      },
    ],
  },

  "type-hints": {
    solution: {
      notes: [
        "With every attribute, parameter and return value annotated, `mypy --strict` checks the whole module. Note `Book | None` for the lookup — mypy then forces the `None` case to be handled before using the book.",
      ],
      code: [
        {
          filename: "typed_library.py",
          lang: "python",
          source: `
from dataclasses import dataclass


class BookAlreadyBorrowedError(Exception):
    pass


@dataclass
class Book:
    isbn: str
    title: str
    author: str
    available: bool = True


class Library:
    def __init__(self) -> None:
        self._books: dict[str, Book] = {}

    def add(self, book: Book) -> None:
        self._books[book.isbn] = book

    def find(self, isbn: str) -> Book | None:
        return self._books.get(isbn)

    def borrow(self, isbn: str) -> Book:
        book = self.find(isbn)
        if book is None:
            raise KeyError(f"no book with ISBN {isbn}")
        if not book.available:
            raise BookAlreadyBorrowedError(book.title)
        book.available = False
        return book

    def available_books(self) -> list[str]:
        return [b.title for b in self._books.values() if b.available]


library = Library()
library.add(Book("978-1", "Things Fall Apart", "Chinua Achebe"))
print(library.borrow("978-1").title, library.available_books())
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
mypy --strict typed_library.py
# Success: no issues found in 1 source file
`,
        },
      ],
    },
    quiz: [
      {
        question: "What happens at runtime if you pass a `str` to a function hinted `def f(x: int)`?",
        options: [
          "Python raises a TypeError immediately",
          "Nothing special — hints aren't enforced; a type checker reports it",
          "The value is converted to int",
          "The program won't start",
        ],
        answer: 1,
        explanation: "Hints are for tools (mypy, editors), not checked by the interpreter.",
      },
      {
        question: "How do you write \"a string or nothing\" in a modern type hint?",
        options: ["`str?`", "`Optional<str>`", "`str | None`", "`str or None`"],
        answer: 2,
        explanation: "`X | None` (or `Optional[X]`) marks a value that may be missing.",
      },
      {
        question: "Which type describes a dictionary with fixed, known keys like `id`, `amount` and `status`?",
        options: ["`TypedDict`", "`dict[str, Any]`", "`list[str]`", "`Literal`"],
        answer: 0,
        explanation: "`TypedDict` gives each key its own type, so typos and wrong values are caught.",
      },
      {
        question: "What does `Literal[\"pending\", \"paid\", \"failed\"]` restrict a value to?",
        options: [
          "Any string",
          "Strings starting with those words",
          "A list of those strings",
          "Exactly one of those three strings",
        ],
        answer: 3,
        explanation: "A `Literal` type allows only the listed values.",
      },
    ],
  },

  "http-apis": {
    solution: {
      notes: [
        "Pass query parameters with `params=` instead of building the URL by hand. The `get_with_retry` helper retries only network errors (not 404s), waiting a second between attempts, and re-raises after the third failure.",
      ],
      code: [
        {
          filename: "posts.py",
          lang: "python",
          source: `
import time

import requests

BASE_URL = "https://jsonplaceholder.typicode.com"


def get_with_retry(session: requests.Session, url: str, params: dict, attempts: int = 3) -> requests.Response:
    for attempt in range(1, attempts + 1):
        try:
            response = session.get(url, params=params, timeout=5)
            response.raise_for_status()
            return response
        except (requests.ConnectionError, requests.Timeout) as err:
            if attempt == attempts:
                raise
            print(f"attempt {attempt} failed ({type(err).__name__}), retrying in 1s")
            time.sleep(1)
    raise AssertionError("unreachable")


def main() -> None:
    with requests.Session() as session:
        posts = get_with_retry(session, f"{BASE_URL}/posts", params={"userId": 1}).json()
    longest = sorted(posts, key=lambda p: len(p["title"]), reverse=True)[:5]
    for post in longest:
        print(f"{len(post['title']):>3}  {post['title']}")


if __name__ == "__main__":
    main()
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why always pass `timeout=` to `requests.get`?",
        options: [
          "It makes requests faster",
          "It is required by HTTP",
          "Without it, a slow or stuck server can hang your program forever",
          "It enables HTTPS",
        ],
        answer: 2,
        explanation: "requests has no timeout by default.",
      },
      {
        question: "What does `response.raise_for_status()` do?",
        options: [
          "Raises an exception for HTTP error codes such as 404 or 500",
          "Prints the status code",
          "Retries the request",
          "Converts the body to JSON",
        ],
        answer: 0,
        explanation: "It turns failed HTTP responses into exceptions you can catch.",
      },
      {
        question: "Where should an API key come from?",
        options: [
          "Hard-coded in the source file",
          "A comment at the top of the file",
          "The URL",
          "An environment variable (or a secrets manager)",
        ],
        answer: 3,
        explanation: "Secrets in code end up in version control and get leaked.",
      },
      {
        question: "What is a benefit of `requests.Session`?",
        options: [
          "It caches every response forever",
          "It reuses connections and shares headers across requests",
          "It makes requests asynchronous",
          "It retries automatically",
        ],
        answer: 1,
        explanation: "Reusing connections is faster, and shared headers (like auth) are set once.",
      },
    ],
  },

  "testing-pytest": {
    solution: {
      notes: [
        "One parametrized test covers the valid lines (including extra spaces), and another uses `pytest.raises(..., match=...)` to check that each kind of invalid line fails with the right message.",
      ],
      code: [
        {
          filename: "parsing.py",
          lang: "python",
          source: `
class InvalidLineError(Exception):
    pass


def parse_line(line: str) -> tuple[str, int]:
    if "," not in line:
        raise InvalidLineError("missing comma")
    name, _, score_text = line.partition(",")
    name = name.strip()
    if not name:
        raise InvalidLineError("empty name")
    try:
        score = int(score_text)
    except ValueError as err:
        raise InvalidLineError("score is not a whole number") from err
    if not 0 <= score <= 100:
        raise InvalidLineError("score out of range")
    return name, score
`,
        },
        {
          filename: "test_parsing.py",
          lang: "python",
          source: `
import pytest

from parsing import InvalidLineError, parse_line


@pytest.mark.parametrize(
    ("line", "expected"),
    [
        ("Amina,88", ("Amina", 88)),
        ("  Juma ,  42 ", ("Juma", 42)),
        ("Neema,0", ("Neema", 0)),
        ("Ali,100", ("Ali", 100)),
    ],
)
def test_valid_lines(line: str, expected: tuple[str, int]) -> None:
    assert parse_line(line) == expected


@pytest.mark.parametrize(
    ("line", "message"),
    [
        ("Amina 88", "missing comma"),
        (" ,70", "empty name"),
        ("Neema,abc", "not a whole number"),
        ("Ali,101", "out of range"),
        ("Ali,-1", "out of range"),
    ],
)
def test_invalid_lines(line: str, message: str) -> None:
    with pytest.raises(InvalidLineError, match=message):
        parse_line(line)
`,
        },
      ],
    },
    quiz: [
      {
        question: "How does pytest find your tests?",
        options: [
          "You list them in a config file",
          "Functions named `test_*` in files named `test_*.py`",
          "Any function with an `assert`",
          "Classes that inherit from `Test`",
        ],
        answer: 1,
        explanation: "pytest discovers tests by naming convention.",
      },
      {
        question: "What does `@pytest.mark.parametrize` do?",
        options: [
          "Runs one test function with many sets of inputs",
          "Runs tests in parallel",
          "Skips a test",
          "Measures test speed",
        ],
        answer: 0,
        explanation: "Each parameter set becomes its own test case in the report.",
      },
      {
        question: "Which checks that code raises a `ValueError` whose message contains \"range\"?",
        options: [
          "`assert raises(ValueError)`",
          "`try: ... except: pass`",
          "`assert ValueError in code()`",
          "`with pytest.raises(ValueError, match=\"range\"):`",
        ],
        answer: 3,
        explanation: "`pytest.raises` as a context manager, with `match` checking the message.",
      },
      {
        question: "What does the built-in `tmp_path` fixture provide?",
        options: [
          "A list of test names",
          "The project's root folder",
          "A fresh temporary folder for each test",
          "The path to Python",
        ],
        answer: 2,
        explanation: "Tests that write files use `tmp_path` so they never touch real data.",
      },
    ],
  },
  "regular-expressions": regularExpressionsPractice,
  "pandas-basics": pandasBasicsPractice,
};
