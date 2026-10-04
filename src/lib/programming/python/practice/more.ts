import type { Practice } from "../../types";

export const stringsAndText: Practice = {
  solution: {
    notes: [
      "`initials` takes the first letter of each word, upper-cased, with dots. `mask_phone` keeps the first four and last three digits and replaces the middle with asterisks — slicing makes both one-liners.",
    ],
    code: [
      {
        filename: "text_solution.py",
        lang: "python",
        source: `
def initials(full_name: str) -> str:
    return "".join(part[0].upper() + "." for part in full_name.split())


def mask_phone(phone: str) -> str:
    return phone[:4] + "*" * (len(phone) - 7) + phone[-3:]


students = [("amina hassan", "0712345678"), ("juma said", "0754000111"), ("neema kimaro", "0688000222")]

print(f"{'Name':<16}{'Initials':<10}{'Phone':>12}")
for name, phone in students:
    print(f"{name.title():<16}{initials(name):<10}{mask_phone(phone):>12}")
`,
      },
    ],
  },
  quiz: [
    {
      question: "What does `\"Amina\"[1:3]` return?",
      options: ["\"Am\"", "\"mi\"", "\"min\"", "\"ami\""],
      answer: 1,
      explanation: "Slices include the start index and exclude the end: positions 1 and 2.",
    },
    {
      question: "Why does `name.upper()` not change `name` itself?",
      options: [
        "It's a bug",
        "Strings are immutable — methods return a new string",
        "`upper` only works on lists",
        "You must call `name.save()`",
      ],
      answer: 1,
      explanation: "Assign the result: `name = name.upper()`.",
    },
    {
      question: "What does `f\"{1234567:,}\"` produce?",
      options: ["'1234567'", "'1,234,567'", "'1.234.567'", "'1 234 567'"],
      answer: 1,
      explanation: "The `,` format spec adds thousands separators.",
    },
    {
      question: "Which turns `[\"a\", \"b\", \"c\"]` into `\"a-b-c\"`?",
      options: ["`\"-\".join([\"a\", \"b\", \"c\"])`", "`[\"a\", \"b\", \"c\"].join(\"-\")`", "`\"a-b-c\".split()`", "`str([\"a\", \"b\", \"c\"])`"],
      answer: 0,
      explanation: "In Python, `join` is a method of the separator string.",
    },
  ],
};

export const datesAndTimes: Practice = {
  solution: {
    notes: [
      "`strptime` raises `ValueError` for anything that isn't a real date in the right format, so the `try/except` turns that into a friendly message, and a date after today gets its own message. The age calculation subtracts one year if this year's birthday hasn't happened yet.",
    ],
    code: [
      {
        filename: "birthday.py",
        lang: "python",
        source: `
from datetime import date, datetime


def age_on(born: date, today: date) -> int:
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


text = input("Date of birth (DD/MM/YYYY): ")
try:
    born = datetime.strptime(text.strip(), "%d/%m/%Y").date()
except ValueError:
    print(f"Sorry, '{text}' is not a valid date like 14/03/2008.")
else:
    today = date.today()
    if born > today:
        print("That date is in the future.")
    else:
        print(f"You are {age_on(born, today)} years old.")
        print(f"You were born on a {born.strftime('%A')}.")
`,
      },
    ],
  },
  quiz: [
    {
      question: "What type do you get from `date(2026, 11, 2) - date(2026, 3, 14)`?",
      options: ["`int`", "`date`", "`timedelta`", "`str`"],
      answer: 2,
      explanation: "Subtracting dates gives a duration; use `.days` for the number of days.",
    },
    {
      question: "Which converts the text \"14/03/2008\" into a datetime?",
      options: [
        "`datetime.strftime(\"14/03/2008\")`",
        "`datetime.strptime(\"14/03/2008\", \"%d/%m/%Y\")`",
        "`date(\"14/03/2008\")`",
        "`int(\"14/03/2008\")`",
      ],
      answer: 1,
      explanation: "strPtime = Parse; strFtime = Format.",
    },
    {
      question: "Why is `timezone(timedelta(hours=3))` accurate for Tanzania all year?",
      options: [
        "Python ignores time zones",
        "East Africa Time has no daylight saving — it is always UTC+3",
        "Tanzania uses UTC",
        "It's only approximate",
      ],
      answer: 1,
      explanation: "Zones with daylight saving need `zoneinfo` (and `tzdata` on Windows).",
    },
    {
      question: "What does `date(2026, 3, 14).weekday()` return for a Saturday?",
      options: ["0", "6", "5", "\"Saturday\""],
      answer: 2,
      explanation: "`weekday()` counts Monday as 0, so Saturday is 5 (use `isoweekday()` for 1-7).",
    },
  ],
};

export const regularExpressions: Practice = {
  solution: {
    notes: [
      "The email pattern requires non-space characters, an @, more non-space characters, a dot, and a final part. For the dates, three capture groups (day, month, year) are rearranged in the replacement with `\\\\3-\\\\2-\\\\1`.",
    ],
    code: [
      {
        filename: "regex_solution.py",
        lang: "python",
        source: `
import re

EMAIL = re.compile(r"[^@\\s]+@[^@\\s]+\\.[^@\\s]+")


def valid_email(text: str) -> bool:
    return EMAIL.fullmatch(text) is not None


for e in ["amina@example.com", "juma@school", "bad email@x.com", "neema.k@shule.ac.tz"]:
    print(f"{e:<22} {valid_email(e)}")

paragraph = "Registration closes on 14/03/2026, mocks start 02/11/2026 and results come 15/12/2026."
dates = re.findall(r"\\b\\d{2}/\\d{2}/\\d{4}\\b", paragraph)
iso = [re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", d) for d in dates]
print(iso)   # ['2026-03-14', '2026-11-02', '2026-12-15']
`,
      },
    ],
  },
  quiz: [
    {
      question: "What does `\\d{8}` match?",
      options: ["The letter d eight times", "Exactly eight digits", "Up to eight digits", "Eight characters of any kind"],
      answer: 1,
      explanation: "`\\d` is a digit and `{8}` means exactly eight repetitions.",
    },
    {
      question: "Which function checks that the WHOLE string matches a pattern?",
      options: ["`re.search`", "`re.findall`", "`re.fullmatch`", "`re.split`"],
      answer: 2,
      explanation: "`search` finds a match anywhere; `fullmatch` requires the entire string to match.",
    },
    {
      question: "Why write patterns as raw strings, e.g. `r\"\\d+\"`?",
      options: [
        "They run faster",
        "Backslashes are kept exactly as typed instead of being treated as Python escapes",
        "Raw strings are required by `re`",
        "They ignore case",
      ],
      answer: 1,
      explanation: "Without `r`, sequences such as `\\b` would become control characters before `re` sees them.",
    },
    {
      question: "In `re.sub(r\"(\\d{4})(\\d{3})\", r\"\\2-\\1\", s)`, what does `\\2` insert?",
      options: ["The second character", "Nothing", "The text matched by the second group", "A literal 2"],
      answer: 2,
      explanation: "Backreferences reuse captured groups in the replacement.",
    },
  ],
};

export const pandasBasics: Practice = {
  solution: {
    notes: [
      "`idxmax` on the pivot table gives each student's best subject. The pass rate is the mean of a True/False column, times 100. `crosstab` counts grades per form, and `to_csv` saves the report.",
    ],
    code: [
      {
        filename: "pandas_solution.py",
        lang: "python",
        source: `
from io import StringIO

import pandas as pd

results = pd.read_csv(StringIO("""name,form,subject,score
Amina,4,Maths,88
Amina,4,Biology,79
Juma,4,Maths,29
Juma,4,Biology,48
Neema,4,Maths,71
Neema,4,Biology,84
Ali,3,Maths,95
Ali,3,Biology,62
"""))
results["grade"] = pd.cut(results["score"], bins=[-1, 29, 44, 64, 74, 100], labels=list("FDCBA"))

scores = results.pivot_table(index="name", columns="subject", values="score")
best = scores.idxmax(axis=1)
print(best.to_dict())                     # {'Ali': 'Maths', 'Amina': 'Maths', 'Juma': 'Biology', 'Neema': 'Biology'}

pass_rate = (results["score"] >= 30).groupby(results["subject"]).mean().mul(100).round(1)
print(pass_rate.to_dict())                # {'Biology': 100.0, 'Maths': 75.0}

print(pd.crosstab(results["form"], results["grade"]))

report = scores.assign(average=scores.mean(axis=1).round(1), best_subject=best)
report.to_csv("report.csv")
print(open("report.csv", encoding="utf-8").read())
`,
      },
    ],
  },
  quiz: [
    {
      question: "How do you keep only rows where score is at least 30?",
      options: [
        "`df.filter(score >= 30)`",
        "`df[df[\"score\"] >= 30]`",
        "`for row in df: if row.score >= 30`",
        "`df.where(30)`",
      ],
      answer: 1,
      explanation: "A boolean Series inside `[]` selects the matching rows.",
    },
    {
      question: "What does `df.groupby(\"subject\")[\"score\"].mean()` give?",
      options: [
        "The overall mean",
        "A sorted DataFrame",
        "The number of subjects",
        "One average score per subject",
      ],
      answer: 3,
      explanation: "groupby splits rows into groups, then the aggregation runs per group.",
    },
    {
      question: "Why prefer `df[\"score\"] * 2` over a Python loop over rows?",
      options: [
        "Loops aren't allowed on DataFrames",
        "Whole-column (vectorised) operations are much faster and clearer",
        "It uses less disk space",
        "Loops change the data type",
      ],
      answer: 1,
      explanation: "pandas runs vectorised operations in optimised compiled code.",
    },
    {
      question: "Which joins two DataFrames on a shared column, like SQL JOIN?",
      options: ["`merge`", "`concat`", "`append`", "`pivot`"],
      answer: 0,
      explanation: "`merge(other, on=\"name\")` matches rows by key; `concat` just stacks tables.",
    },
  ],
};

export const commandLineTools: Practice = {
  solution: {
    notes: [
      "This is the whole `results.py` with a `cmd_stats` function and a `stats` subparser added. `stats` filters by `--subject` if given, returns exit code 2 when nothing matches, and prints the summary otherwise. The tests call `main([...])` with a temporary CSV and check the exit code and output with pytest's `capsys` fixture.",
    ],
    code: [
      {
        filename: "results.py",
        lang: "python",
        source: `
import argparse
import csv
import statistics
import sys
from pathlib import Path


def load(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def cmd_report(args: argparse.Namespace) -> int:
    rows = [r for r in load(args.path) if int(r["score"]) >= args.min_score]
    for r in rows:
        print(f"{r['name']:<8} {r['subject']:<8} {r['score']:>3}")
    print(f"{len(rows)} result(s) with score >= {args.min_score}")
    return 0


def cmd_top(args: argparse.Namespace) -> int:
    rows = sorted(load(args.path), key=lambda r: int(r["score"]), reverse=True)
    for r in rows[: args.count]:
        print(r["name"], r["score"])
    return 0


def cmd_stats(args: argparse.Namespace) -> int:
    rows = load(args.path)
    if args.subject:
        rows = [r for r in rows if r["subject"].lower() == args.subject.lower()]
    if not rows:
        print(f"error: no results for subject {args.subject!r}", file=sys.stderr)
        return 2
    scores = [int(r["score"]) for r in rows]
    print(f"average {statistics.mean(scores):.1f}, highest {max(scores)}, lowest {min(scores)}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="results", description="Work with exam results CSV files.")
    sub = parser.add_subparsers(dest="command", required=True)

    report = sub.add_parser("report", help="list results above a minimum score")
    report.add_argument("path", type=Path, help="CSV file with name,subject,score columns")
    report.add_argument("--min-score", type=int, default=0, help="only show scores at or above this")
    report.set_defaults(func=cmd_report)

    top = sub.add_parser("top", help="show the highest scores")
    top.add_argument("path", type=Path)
    top.add_argument("-n", "--count", type=int, default=3)
    top.set_defaults(func=cmd_top)

    stats = sub.add_parser("stats", help="average, highest and lowest score")
    stats.add_argument("path", type=Path)
    stats.add_argument("--subject", help="only include this subject")
    stats.set_defaults(func=cmd_stats)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if not args.path.exists():
        print(f"error: {args.path} not found", file=sys.stderr)
        return 1
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
`,
      },
      {
        filename: "test_results_cli.py",
        lang: "python",
        source: `
from pathlib import Path

import pytest

from results import main


@pytest.fixture
def csv_file(tmp_path: Path) -> Path:
    path = tmp_path / "results.csv"
    path.write_text("name,subject,score\\nAmina,Maths,88\\nJuma,Maths,30\\nNeema,Biology,84\\n", encoding="utf-8")
    return path


def test_stats_for_one_subject(csv_file: Path, capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["stats", str(csv_file), "--subject", "maths"]) == 0
    assert "average 59.0, highest 88, lowest 30" in capsys.readouterr().out


def test_unknown_subject_returns_2(csv_file: Path, capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["stats", str(csv_file), "--subject", "Chemistry"]) == 2
    assert "no results" in capsys.readouterr().err
`,
      },
    ],
  },
  quiz: [
    {
      question: "What does argparse give you for free?",
      options: [
        "A graphical interface",
        "Parsing, type conversion, error messages and `--help` text",
        "Database access",
        "Automatic tests",
      ],
      answer: 1,
      explanation: "Describe the arguments once; argparse handles the rest.",
    },
    {
      question: "What should a command return when it fails?",
      options: ["0", "A non-zero exit code", "None", "An empty string"],
      answer: 1,
      explanation: "0 means success; other values tell scripts and CI that something went wrong.",
    },
    {
      question: "Why write `main(argv=None)` instead of reading `sys.argv` directly?",
      options: [
        "It runs faster",
        "Tests can pass argument lists straight to `main`",
        "argparse requires it",
        "It hides errors",
      ],
      answer: 1,
      explanation: "`parse_args(None)` falls back to sys.argv, so the real command still works.",
    },
    {
      question: "Where should error messages go?",
      options: ["`sys.stdout`", "A log file only", "`sys.stderr`", "Nowhere"],
      answer: 2,
      explanation: "Keeping errors on stderr lets users pipe normal output elsewhere.",
    },
  ],
};

export const projectResultsAnalysis: Practice = {
  solution: {
    notes: [
      "`class_report` reuses `rank` per subject, so ties are handled the same way everywhere. The tests cover a three-way tie (positions 1, 1, 1, 4), a bad score and a missing column in the CSV, and the grade distribution.",
    ],
    code: [
      {
        filename: "report_card.py",
        lang: "python",
        source: `
from analysis import rank
from models import Result


def class_report(results: list[Result], student: str) -> list[tuple[str, int, str, int]]:
    """(subject, score, grade, position in that subject) for one student."""
    rows = []
    for subject in sorted({r.subject for r in results if r.student == student}):
        scores = {r.student: float(r.score) for r in results if r.subject == subject}
        position = next(pos for pos, name, _ in rank(scores) if name == student)
        mine = next(r for r in results if r.student == student and r.subject == subject)
        rows.append((subject, mine.score, mine.grade, position))
    return rows
`,
      },
      {
        filename: "test_project.py",
        lang: "python",
        source: `
from analysis import grade_distribution, rank
from loading import load_results
from models import Result
from report_card import class_report


def test_rank_three_way_tie() -> None:
    ranked = rank({"A": 80.0, "B": 80.0, "C": 80.0, "D": 70.0})
    assert [pos for pos, _, _ in ranked] == [1, 1, 1, 4]


def test_load_results_collects_errors() -> None:
    text = "student,form,subject,score\\nAmina,4,Maths,88\\nJuma,4,Maths,abc\\n"
    results, errors = load_results(text)
    assert len(results) == 1 and errors[0].startswith("line 3")

    results, errors = load_results("student,form,subject\\nAmina,4,Maths\\n")   # no score column
    assert results == [] and len(errors) == 1


def test_grade_distribution() -> None:
    rs = [Result("A", 4, "Maths", s) for s in (90, 70, 50, 35, 10, 80)]
    assert grade_distribution(rs) == {"A": 2, "B": 1, "C": 1, "D": 1, "F": 1}


def test_class_report_positions() -> None:
    rs = [Result("Amina", 4, "Maths", 88), Result("Ali", 4, "Maths", 95), Result("Amina", 4, "Biology", 79)]
    assert class_report(rs, "Amina") == [("Biology", 79, "A", 1), ("Maths", 88, "A", 2)]
`,
      },
    ],
  },
  quiz: [
    {
      question: "With competition ranking, what positions do averages 90, 85, 85, 70 get?",
      options: ["1, 2, 3, 4", "1, 2, 2, 3", "1, 2, 2, 4", "1, 1, 2, 3"],
      answer: 2,
      explanation: "Tied students share a position and the next position is skipped.",
    },
    {
      question: "Why does `load_results` return errors instead of raising on the first bad row?",
      options: [
        "Exceptions are slow",
        "So one bad line doesn't stop the whole import, and every problem can be reported at once",
        "Python can't raise in loops",
        "To hide problems",
      ],
      answer: 1,
      explanation: "Teachers can then fix all the bad rows in one go.",
    },
    {
      question: "What makes `rank` and `subject_stats` easy to test?",
      options: [
        "They print their results",
        "They read files",
        "They're pure functions: data in, data out, no side effects",
        "They use global variables",
      ],
      answer: 2,
      explanation: "No files, network or printing to set up — just call and compare.",
    },
    {
      question: "Why is `Result` a frozen dataclass?",
      options: [
        "Frozen objects are faster to create",
        "Results shouldn't change after loading, and frozen instances can be used in sets and as dict keys",
        "It's required for properties",
        "To save memory",
      ],
      answer: 1,
      explanation: "Immutability prevents accidental edits and makes instances hashable.",
    },
  ],
};
