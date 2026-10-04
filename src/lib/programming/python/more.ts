import type { Lesson } from "../types";

// Lessons added after the first release; inserted into their levels in
// beginner.ts / intermediate.ts / advanced.ts.

export const stringsAndText: Lesson = {
  slug: "strings-and-text",
  title: "Strings & Text Processing",
  summary: "Indexing and slicing, string methods, f-string formatting, and cleaning messy text.",
  body: [
    "A string is a sequence of characters: `name[0]` is the first, `name[-1]` the last, and slices like `name[0:3]` take a range (the end is excluded). Strings are immutable — methods return new strings rather than changing the original.",
    "Everyday methods: `strip()` removes surrounding spaces, `lower()`/`upper()`/`title()` change case, `replace()` substitutes text, `split()` breaks text into a list and `\"-\".join(list)` glues a list back together. `startswith`, `endswith`, `in` and `count` answer questions about text.",
    "f-strings can format as they insert: `{score:>5}` right-aligns in 5 characters, `{name:<12}` left-aligns, `{fee:,}` adds thousands separators and `{ratio:.1%}` shows a percentage. These make neat tables and reports without extra libraries.",
  ],
  code: [
    {
      filename: "text.py",
      lang: "python",
      source: `
name = "Amina Hassan"
print(name[0], name[-1], name[0:5], name[6:], name[::-1])   # A n Amina Hassan nassaH animA

raw = "   juma   SAID ,  form 4  "
clean_name = " ".join(raw.split(",")[0].split()).title()     # collapse spaces, fix case
print(repr(clean_name))                                       # 'Juma Said'

sentence = "Photosynthesis happens in the chloroplasts of green plants."
print(sentence.count("s"), "green" in sentence, sentence.startswith("Photo"))
print(sentence.replace("green plants", "algae").upper())

words = sentence.rstrip(".").split()
print(len(words), max(words, key=len))
print("-".join(w.lower() for w in words[:3]))                 # photosynthesis-happens-in

# Neat columns with format specifications
rows = [("Amina Hassan", 88, 0), ("Juma Said", 42, 200000), ("Neema Kimaro", 71, 50000)]
print(f"{'Name':<14}{'Score':>6}{'Balance':>12}")
for student, score, balance in rows:
    print(f"{student:<14}{score:>6}{balance:>12,}")
print(f"Pass rate: {2 / 3:.1%}")                              # Pass rate: 66.7%
`,
    },
  ],
  keyPoints: [
    "Index and slice with `[start:end]`; negative indexes count from the end.",
    "Clean text with `strip`, `split`/`join`, case methods and `replace`.",
    "Format specs in f-strings (`:<14`, `:>6`, `:,`, `:.1%`) produce tidy reports.",
  ],
  exercise:
    "Write `initials(full_name)` that returns 'A.H.' for 'amina hassan', and `mask_phone(phone)` that turns '0712345678' into '0712***678'. Then print a three-column table (name, initials, masked phone) for three students using f-string alignment.",
};

export const datesAndTimes: Lesson = {
  slug: "dates-and-times",
  title: "Dates & Times",
  summary: "date, datetime and timedelta; parsing and formatting; time zones and East Africa Time.",
  body: [
    "The `datetime` module has `date` (a calendar day), `datetime` (a day and a time) and `timedelta` (a duration). Subtracting two dates gives a `timedelta`; adding a `timedelta` moves a date forward or back.",
    "Convert text to dates with `strptime` and dates to text with `strftime`, using codes such as `%d` (day), `%m` (month), `%Y` (year), `%A` (weekday name) and `%B` (month name). `date.fromisoformat(\"2026-03-14\")` parses the standard ISO format directly.",
    "Datetimes without a time zone are \"naive\". For timestamps that matter (payments, logs), attach a zone. Tanzania uses East Africa Time, UTC+3 all year, so `timezone(timedelta(hours=3))` describes it exactly. For zones with daylight saving, use `zoneinfo.ZoneInfo(\"Europe/London\")` — on Windows, run `pip install tzdata` first.",
  ],
  code: [
    {
      filename: "dates.py",
      lang: "python",
      source: `
from datetime import date, datetime, timedelta, timezone

exam_day = date(2026, 11, 2)
registered = date.fromisoformat("2026-03-14")
print((exam_day - registered).days, "days between registration and exams")   # 233

deadline = registered + timedelta(weeks=6)
print("Fee deadline:", deadline.strftime("%A %d %B %Y"))        # Saturday 25 April 2026

typed = "14/03/2008"                                           # how people write dates in Tanzania
born = datetime.strptime(typed, "%d/%m/%Y").date()
on = date(2026, 3, 14)
age = on.year - born.year - ((on.month, on.day) < (born.month, born.day))
print("Age on", on.isoformat(), "=", age)                        # 18

EAT = timezone(timedelta(hours=3), "EAT")                        # East Africa Time, no daylight saving
paid = datetime(2026, 3, 14, 9, 30, tzinfo=EAT)
print(paid.isoformat())                                          # 2026-03-14T09:30:00+03:00
print(paid.astimezone(timezone.utc).strftime("%H:%M %Z"))        # 06:30 UTC

school_days = [registered + timedelta(days=i) for i in range(7)]
print([d.strftime("%a %d") for d in school_days if d.weekday() < 5])
`,
    },
  ],
  keyPoints: [
    "`date`, `datetime` and `timedelta` cover days, moments and durations.",
    "`strptime` parses text; `strftime` formats; ISO dates parse with `fromisoformat`.",
    "Attach a time zone to important timestamps; EAT is a fixed UTC+3.",
  ],
  exercise:
    "Ask for a student's date of birth in DD/MM/YYYY format with `input()`, then print their age today in years and the weekday they were born on. Print a friendly message instead of crashing if the date is invalid.",
};

export const regularExpressions: Lesson = {
  slug: "regular-expressions",
  title: "Regular Expressions",
  summary: "Match, validate, extract and replace text patterns with the re module.",
  body: [
    "A regular expression (regex) describes a text pattern. `\\d` matches a digit, `\\w` a letter, digit or underscore, `\\s` whitespace, `.` any character; `+` means one or more, `*` zero or more, `{8}` exactly eight, and `[67]` either 6 or 7. Write patterns as raw strings (`r\"...\"`) so backslashes stay as typed.",
    "`re.fullmatch` checks that a whole string fits a pattern (validation); `re.search` finds the first match anywhere; `re.findall` returns all matches; `re.sub` replaces matches. Parentheses create groups you can read back — name them with `(?P<name>...)` for clarity.",
    "Compile patterns you reuse with `re.compile`. Keep regexes simple: for structured formats such as CSV or JSON, use the proper module instead.",
  ],
  code: [
    {
      filename: "patterns.py",
      lang: "python",
      source: `
import re

TZ_PHONE = re.compile(r"(?:\\+255|0)([67]\\d{8})")

for raw in ["0712345678", "+255754000111", "0812345678", "071234567"]:
    m = TZ_PHONE.fullmatch(raw)
    print(f"{raw:<15}", f"valid -> 0{m.group(1)}" if m else "invalid")

text = "Amina scored 88 in Maths, Juma 42 in Maths and Neema 71 in Biology."
print(re.findall(r"\\d+", text))                                  # ['88', '42', '71']

pattern = re.compile(r"(?P<name>[A-Z][a-z]+)(?: scored)? (?P<score>\\d+) in (?P<subject>\\w+)")
for m in pattern.finditer(text):
    print(m.group("name"), m.group("subject"), int(m.group("score")))

messy = "Juma   Said ,   Form   4"
print(re.sub(r"\\s+", " ", messy).replace(" ,", ","))              # Juma Said, Form 4

print(re.sub(r"(\\d{4})(\\d{3})(\\d{3})", r"\\1 \\2 \\3", "0712345678"))   # 0712 345 678
print(bool(re.search(r"\\bexam\\b", "Mock exams start Monday")))  # False: 'exams' is a different word
`,
    },
  ],
  keyPoints: [
    "Use raw strings for patterns; `\\d`, `\\w`, `\\s`, `+`, `*`, `{n}` and `[...]` are the core pieces.",
    "`fullmatch` validates, `search` finds, `findall`/`finditer` extract, `sub` replaces.",
    "Named groups `(?P<name>...)` make extraction readable; compile patterns you reuse.",
  ],
  exercise:
    "Write `valid_email(text)` using `re.fullmatch` (something@something.something, no spaces). Then extract every date written like 14/03/2026 from a paragraph with `re.findall` and convert each to ISO format (2026-03-14) with `re.sub` and groups.",
};

export const pandasBasics: Lesson = {
  slug: "pandas-basics",
  title: "Data Analysis with pandas",
  summary: "Load, filter, group, join and summarise tabular data with DataFrames.",
  body: [
    "pandas is Python's standard library for tabular data. A `DataFrame` is a table with named columns; each column is a `Series`. `pd.read_csv` loads a file (or text), `df.head()` shows the first rows and `df.describe()` summarises numeric columns.",
    "Select columns with `df[\"score\"]` or `df[[\"name\", \"score\"]]`, filter rows with a condition — `df[df[\"score\"] >= 30]` — and add columns with vectorised arithmetic, which is far faster than Python loops.",
    "`groupby` + `agg` summarises per group (average per subject), `merge` joins tables like SQL, and `pivot_table` reshapes data into report form. Install with `pip install pandas`. (pandas isn't available in the in-browser runner, so run these examples locally.)",
  ],
  code: [
    {
      filename: "Terminal",
      lang: "bash",
      source: `
pip install pandas
`,
    },
    {
      filename: "analysis.py",
      lang: "python",
      source: `
from io import StringIO

import pandas as pd

results_csv = StringIO("""name,form,subject,score
Amina,4,Maths,88
Amina,4,Biology,79
Juma,4,Maths,29
Juma,4,Biology,48
Neema,4,Maths,71
Neema,4,Biology,84
Ali,3,Maths,95
Ali,3,Biology,62
""")
results = pd.read_csv(results_csv)
fees = pd.DataFrame({"name": ["Amina", "Juma", "Neema", "Ali"], "balance": [0, 200000, 50000, 0]})

print(results.head(3))
print(results["score"].describe().round(1).to_dict())

passed = results[results["score"] >= 30]
print(f"Passed {len(passed)} of {len(results)} papers")

results["grade"] = pd.cut(results["score"], bins=[-1, 29, 44, 64, 74, 100], labels=list("FDCBA"))

per_subject = results.groupby("subject")["score"].agg(["mean", "min", "max"]).round(1)
print(per_subject)

report = results.pivot_table(index="name", columns="subject", values="score")
report["average"] = report.mean(axis=1).round(1)
report = report.merge(fees, left_index=True, right_on="name").set_index("name")
print(report.sort_values("average", ascending=False))
`,
    },
  ],
  keyPoints: [
    "A DataFrame is a table of named columns; `read_csv`, `head` and `describe` get you started.",
    "Filter with boolean conditions and compute with whole-column arithmetic, not loops.",
    "`groupby`/`agg`, `merge` and `pivot_table` cover most reporting needs.",
  ],
  exercise:
    "Using the results data above, find each student's best subject, the pass rate (score ≥ 30) per subject as a percentage, and the number of each grade per form. Save the per-student report to `report.csv` with `to_csv`.",
};

export const commandLineTools: Lesson = {
  slug: "command-line-tools",
  title: "Command-Line Tools with argparse",
  summary: "Turn scripts into proper commands with arguments, options, subcommands, help text and exit codes.",
  body: [
    "Scripts become far more useful as commands: `python results.py report results.csv --min-score 30`. The standard `argparse` module parses arguments, converts types, checks choices, and generates `--help` text automatically.",
    "Positional arguments are required (`path`); options start with dashes (`--min-score`) and can have defaults and types. Subcommands (`report`, `top`) group related actions, each with its own arguments, using `add_subparsers`.",
    "Write `main(argv=None)` that returns an exit code: 0 for success, non-zero for errors, and print errors to `sys.stderr`. Accepting `argv` makes the tool easy to test, because tests can call `main([\"report\", \"file.csv\"])` directly.",
  ],
  code: [
    {
      filename: "results.py",
      lang: "python",
      source: `
import argparse
import csv
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
      filename: "Terminal",
      lang: "bash",
      source: `
printf 'name,subject,score\\nAmina,Maths,88\\nJuma,Maths,29\\nNeema,Biology,84\\n' > results.csv
python results.py --help
python results.py report results.csv --min-score 30
python results.py top results.csv -n 2
python results.py report missing.csv; echo "exit code: $?"     # exit code: 1
`,
    },
  ],
  keyPoints: [
    "`argparse` handles parsing, type conversion, validation and `--help` for you.",
    "Use subcommands for related actions; give options sensible defaults.",
    "Write `main(argv=None)` returning an exit code — it keeps the tool testable.",
  ],
  exercise:
    "Add a `stats` subcommand that prints the average, highest and lowest score, with an optional `--subject` filter. Make it return exit code 2 with a clear message if the filter matches no rows, and write two pytest tests that call `main([...])` directly.",
};

export const projectResultsAnalysis: Lesson = {
  slug: "project-results-analysis",
  title: "Project: A Results Analysis Tool",
  summary: "Combine everything — dataclasses, validation, statistics, ranking and reports — into a small, tested package.",
  body: [
    "This project builds the core of a school results system as a small package of modules, each with one job: `models.py` defines the data, `loading.py` reads and validates CSV rows (collecting errors instead of crashing), `analysis.py` computes statistics and rankings, and `main.py` ties them together and prints the report.",
    "Rankings use competition ranking: equal scores share a position and the next position is skipped (1, 2, 2, 4) — the way schools usually rank. Statistics come from the standard `statistics` module.",
    "Because the logic lives in small pure functions, it's easy to test: the solution adds pytest tests for loading, grading, ranking and statistics. Grow it from here: a command-line interface (previous lesson), a FastAPI endpoint, or a PostgreSQL store.",
  ],
  code: [
    {
      filename: "models.py",
      lang: "python",
      source: `
from dataclasses import dataclass

GRADE_BANDS = ((75, "A"), (65, "B"), (45, "C"), (30, "D"), (0, "F"))


@dataclass(frozen=True)
class Result:
    student: str
    form: int
    subject: str
    score: int

    @property
    def grade(self) -> str:
        return next(letter for minimum, letter in GRADE_BANDS if self.score >= minimum)
`,
    },
    {
      filename: "loading.py",
      lang: "python",
      source: `
import csv
from io import StringIO

from models import Result


def load_results(text: str) -> tuple[list[Result], list[str]]:
    """Parse CSV text; return the valid results and a list of readable errors."""
    results: list[Result] = []
    errors: list[str] = []
    for line_no, row in enumerate(csv.DictReader(StringIO(text)), start=2):
        try:
            score = int(row["score"])
            form = int(row["form"])
            if not 0 <= score <= 100:
                raise ValueError(f"score {score} is outside 0-100")
            if not row["student"].strip():
                raise ValueError("student name is empty")
            results.append(Result(row["student"].strip(), form, row["subject"].strip(), score))
        except (ValueError, KeyError, TypeError) as err:
            errors.append(f"line {line_no}: {err}")
    return results, errors
`,
    },
    {
      filename: "analysis.py",
      lang: "python",
      source: `
import statistics
from collections import Counter, defaultdict

from models import Result


def subject_stats(results: list[Result]) -> dict[str, dict[str, float]]:
    by_subject: dict[str, list[int]] = defaultdict(list)
    for r in results:
        by_subject[r.subject].append(r.score)
    return {
        subject: {
            "mean": round(statistics.mean(scores), 1),
            "median": statistics.median(scores),
            "pass_rate": round(100 * sum(s >= 30 for s in scores) / len(scores), 1),
        }
        for subject, scores in sorted(by_subject.items())
    }


def student_averages(results: list[Result]) -> dict[str, float]:
    by_student: dict[str, list[int]] = defaultdict(list)
    for r in results:
        by_student[r.student].append(r.score)
    return {name: round(statistics.mean(s), 1) for name, s in by_student.items()}


def rank(averages: dict[str, float]) -> list[tuple[int, str, float]]:
    """Competition ranking: ties share a position, the next one is skipped (1, 2, 2, 4)."""
    ordered = sorted(averages.items(), key=lambda item: (-item[1], item[0]))
    ranked: list[tuple[int, str, float]] = []
    for i, (name, avg) in enumerate(ordered):
        position = ranked[-1][0] if ranked and ranked[-1][2] == avg else i + 1
        ranked.append((position, name, avg))
    return ranked


def grade_distribution(results: list[Result]) -> dict[str, int]:
    counts = Counter(r.grade for r in results)
    return {grade: counts.get(grade, 0) for grade in "ABCDF"}
`,
    },
    {
      filename: "main.py",
      lang: "python",
      source: `
from analysis import grade_distribution, rank, student_averages, subject_stats
from loading import load_results

DATA = """student,form,subject,score
Amina Hassan,4,Maths,88
Amina Hassan,4,Biology,79
Juma Said,4,Maths,29
Juma Said,4,Biology,48
Neema Kimaro,4,Maths,71
Neema Kimaro,4,Biology,84
Ali Mohamed,4,Maths,95
Ali Mohamed,4,Biology,60
Rehema Mollel,4,Maths,abc
Zawadi Njau,4,Biology,120
"""


def main() -> None:
    results, errors = load_results(DATA)
    print(f"Loaded {len(results)} results, skipped {len(errors)}:")
    for e in errors:
        print("  -", e)

    print("\\nSubject   Mean  Median  Pass%")
    for subject, s in subject_stats(results).items():
        print(f"{subject:<9}{s['mean']:>5}{s['median']:>8}{s['pass_rate']:>7}")

    print("\\nPos  Student          Average")
    for position, name, avg in rank(student_averages(results)):
        print(f"{position:>3}  {name:<16}{avg:>7}")

    print("\\nGrades:", grade_distribution(results))


if __name__ == "__main__":
    main()
`,
    },
  ],
  keyPoints: [
    "Split a program into small modules with one job each: models, loading, analysis, output.",
    "Collect validation errors with line numbers instead of stopping at the first bad row.",
    "Pure functions (stats, ranking) are easy to test and reuse in a CLI, API or web page.",
  ],
  exercise:
    "Add `class_report(results, student)` that returns each subject's score, grade and the student's position in that subject. Write pytest tests for `rank` (including a three-way tie), `load_results` (a bad score and a missing column) and `grade_distribution`.",
};
