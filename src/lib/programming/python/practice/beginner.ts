import type { Practice } from "../../types";
import { stringsAndText as stringsAndTextPractice, datesAndTimes as datesAndTimesPractice } from "./more";

export const beginner: Record<string, Practice> = {
  setup: {
    solution: {
      notes: [
        "An f-string builds the sentence from the three variables. In the REPL, `**` is \"to the power of\", `//` is whole-number division and `%` is the remainder.",
      ],
      code: [
        {
          filename: "about.py",
          lang: "python",
          source: `
name = "Amina"
age = 17
school = "Azania Secondary"

print(f"My name is {name}, I am {age} years old and I study at {school}.")
`,
        },
        {
          filename: "Python REPL",
          lang: "python",
          source: `
>>> 2 ** 10
1024
>>> 17 // 5
3
>>> 17 % 5
2
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is a virtual environment for?",
        options: [
          "Running Python in the browser",
          "Keeping each project's installed packages separate",
          "Making Python faster",
          "Writing code without a text editor",
        ],
        answer: 1,
        explanation: "Each project gets its own packages, so different projects don't clash.",
      },
      {
        question: "What does `17 // 5` evaluate to?",
        options: ["3.4", "2", "3", "85"],
        answer: 2,
        explanation: "`//` is floor division: it gives the whole-number part of the result.",
      },
      {
        question: "How do you leave the interactive Python shell?",
        options: ["`exit()`", "`stop`", "`quit;`", "`Ctrl+S`"],
        answer: 0,
        explanation: "`exit()` (or Ctrl+D on macOS/Linux, Ctrl+Z then Enter on Windows) closes the REPL.",
      },
      {
        question: "Which command runs the file `hello.py`?",
        options: ["`run hello.py`", "`pip hello.py`", "`python -m hello.py`", "`python hello.py`"],
        answer: 3,
        explanation: "`python hello.py` (or `python3 hello.py` on some systems) runs the script.",
      },
    ],
  },

  "variables-and-types": {
    solution: {
      notes: [
        "`input()` always returns text, so convert each score with `float()` before adding. `.strip().title()` tidies the name, and `:.1f` in the f-string rounds the average to one decimal place.",
      ],
      code: [
        {
          filename: "average.py",
          lang: "python",
          source: `
name = input("Student name: ")
score1 = float(input("Score 1: "))
score2 = float(input("Score 2: "))
score3 = float(input("Score 3: "))

average = (score1 + score2 + score3) / 3
print(f"{name.strip().title()}: average {average:.1f}")
`,
        },
        {
          filename: "Example run",
          lang: "text",
          source: `
Student name:   amina hassan
Score 1: 78
Score 2: 64
Score 3: 91
Amina Hassan: average 77.7
`,
        },
      ],
    },
    quiz: [
      {
        question: "What type does `input()` return?",
        options: ["`int`", "`str`", "Whatever the user typed", "`float`"],
        answer: 1,
        explanation: "`input()` always returns a string; convert it with `int()` or `float()` before calculating.",
      },
      {
        question: "What does `f\"{average:.1f}\"` print when `average` is 77.666?",
        options: ["`77.666`", "`78`", "`77.7`", "`77.6`"],
        answer: 2,
        explanation: "`.1f` formats the number with one decimal place, rounding it.",
      },
      {
        question: "What is `type(None)`?",
        options: ["`NoneType`", "`null`", "`str`", "`bool`"],
        answer: 0,
        explanation: "`None` is Python's \"no value\" object, of type `NoneType`.",
      },
      {
        question: "What does `\"  amina juma  \".strip().title()` return?",
        options: ["`\"AMINA JUMA\"`", "`\"  Amina Juma  \"`", "`\"amina juma\"`", "`\"Amina Juma\"`"],
        answer: 3,
        explanation: "`strip()` removes surrounding spaces; `title()` capitalises each word.",
      },
    ],
  },

  "control-flow": {
    solution: {
      notes: [
        "The multiplication table is a `for` loop over `range(1, 13)`. The guessing game keeps asking inside a `while` loop until the guess is right, giving a hint each time.",
      ],
      code: [
        {
          filename: "tables.py",
          lang: "python",
          source: `
import random

number = int(input("Times table for: "))
for i in range(1, 13):
    print(f"{i:>2} x {number} = {i * number}")

secret = random.randint(1, 100)
guesses = 0
guess = None
while guess != secret:
    guess = int(input("Guess the number (1-100): "))
    guesses += 1
    if guess < secret:
        print("Higher!")
    elif guess > secret:
        print("Lower!")
print(f"Correct! You needed {guesses} guesses.")
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which numbers does `range(1, 5)` produce?",
        options: ["1, 2, 3, 4, 5", "0, 1, 2, 3, 4", "1, 2, 3, 4", "1 and 5"],
        answer: 2,
        explanation: "The stop value is excluded: `range(1, 5)` gives 1 to 4.",
      },
      {
        question: "How does Python know which lines belong inside an `if` block?",
        options: ["Curly braces `{ }`", "Indentation", "The `end` keyword", "Semicolons"],
        answer: 1,
        explanation: "Indentation is part of Python's syntax; use 4 spaces consistently.",
      },
      {
        question: "What does `enumerate(scores, start=1)` give you on each loop?",
        options: [
          "The position (starting at 1) and the item",
          "Only the item",
          "Only the position",
          "The total of the list",
        ],
        answer: 0,
        explanation: "`enumerate` pairs each item with a counter — handy for numbered output.",
      },
      {
        question: "What does `continue` do inside a loop?",
        options: [
          "Leaves the loop completely",
          "Restarts the program",
          "Pauses for a second",
          "Skips the rest of this round and moves to the next one",
        ],
        answer: 3,
        explanation: "`break` leaves the loop; `continue` jumps to the next iteration.",
      },
    ],
  },

  functions: {
    solution: {
      notes: [
        "Each function has type hints and a docstring. `math.pi` gives π, and `describe_area` uses a default value for `units` so callers only pass it when they need something other than centimetres.",
      ],
      code: [
        {
          filename: "areas.py",
          lang: "python",
          source: `
import math


def area_of_rectangle(width: float, height: float) -> float:
    """Return the area of a rectangle."""
    return width * height


def area_of_circle(radius: float) -> float:
    """Return the area of a circle."""
    return math.pi * radius ** 2


def describe_area(area: float, units: str = "cm") -> str:
    """Describe an area to two decimal places, e.g. 'Area: 12.00 cm²'."""
    return f"Area: {area:.2f} {units}²"


print(describe_area(area_of_rectangle(3, 4)))      # Area: 12.00 cm²
print(describe_area(area_of_circle(2), units="m")) # Area: 12.57 m²
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does a function return if it has no `return` statement?",
        options: ["`0`", "An empty string", "`None`", "An error"],
        answer: 2,
        explanation: "Python functions return `None` by default.",
      },
      {
        question: "In `greet(\"Juma\", title=\"Mr.\")`, what is `title=\"Mr.\"`?",
        options: ["A keyword argument", "A default value", "A global variable", "A docstring"],
        answer: 0,
        explanation: "Passing an argument by name makes calls clearer and order-independent.",
      },
      {
        question: "Does Python stop you from calling `percentage(\"abc\")` when the hint says `score: float`?",
        options: [
          "Yes, always",
          "Only on Windows",
          "Yes, but only for numbers",
          "No — hints aren't enforced at runtime; tools like mypy report the mistake",
        ],
        answer: 3,
        explanation: "Type hints document intent; type checkers and editors use them to find bugs.",
      },
      {
        question: "What does `low, high, avg = stats([78, 64, 91])` do when `stats` returns a tuple of three values?",
        options: [
          "Raises an error",
          "Unpacks the three returned values into three variables",
          "Stores the whole tuple in `low`",
          "Calls `stats` three times",
        ],
        answer: 1,
        explanation: "Tuple unpacking assigns each returned value to its own variable.",
      },
    ],
  },

  collections: {
    solution: {
      notes: [
        "A list of dictionaries holds the products. A list comprehension finds the cheap names, `sum` over a generator adds up the stock value, `max` with a `key` finds the most expensive product, and a dictionary comprehension plus `.get` counts categories.",
      ],
      code: [
        {
          filename: "products.py",
          lang: "python",
          source: `
products = [
    {"name": "Exercise book", "price": 1500, "quantity": 200, "category": "Stationery"},
    {"name": "Scientific calculator", "price": 35000, "quantity": 12, "category": "Electronics"},
    {"name": "Geometry set", "price": 4500, "quantity": 40, "category": "Stationery"},
    {"name": "School bag", "price": 25000, "quantity": 15, "category": "Bags"},
]

cheap = [p["name"] for p in products if p["price"] < 5000]
stock_value = sum(p["price"] * p["quantity"] for p in products)
most_expensive = max(products, key=lambda p: p["price"])

per_category = {}
for p in products:
    per_category[p["category"]] = per_category.get(p["category"], 0) + 1

print(cheap)                    # ['Exercise book', 'Geometry set']
print(f"{stock_value:,} TSh")   # 1,275,000 TSh
print(most_expensive["name"])   # Scientific calculator
print(per_category)             # {'Stationery': 2, 'Electronics': 1, 'Bags': 1}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which collection keeps only unique values?",
        options: ["list", "tuple", "set", "dict"],
        answer: 2,
        explanation: "A set automatically drops duplicates and checks membership quickly.",
      },
      {
        question: "What does `by_name.get(\"Ali\", \"not found\")` return if \"Ali\" isn't a key?",
        options: ["`\"not found\"`", "`None`", "A `KeyError`", "`False`"],
        answer: 0,
        explanation: "`get` returns the default instead of raising `KeyError`.",
      },
      {
        question: "What is the main difference between a list and a tuple?",
        options: [
          "Tuples can only hold numbers",
          "Lists are faster in every case",
          "Tuples are sorted automatically",
          "A tuple can't be changed after it is created",
        ],
        answer: 3,
        explanation: "Lists are mutable; tuples are fixed — good for pairs like coordinates.",
      },
      {
        question: "What does `[s for s in scores if s >= 30]` produce?",
        options: [
          "The number of passing scores",
          "A new list of only the scores that are 30 or more",
          "True or False",
          "The original list, modified",
        ],
        answer: 1,
        explanation: "A list comprehension builds a new list from items that pass the condition.",
      },
    ],
  },

  "files-and-modules": {
    solution: {
      notes: [
        "`text_tools.py` holds the reusable functions. `main.py` imports them, reads the essay with `with open(...)`, prints the results, and opens `report.txt` in append mode (`\"a\"`) so each run adds a new line instead of overwriting.",
      ],
      code: [
        {
          filename: "text_tools.py",
          lang: "python",
          source: `
def word_count(text: str) -> int:
    return len(text.split())


def longest_word(text: str) -> str:
    return max(text.split(), key=len, default="")
`,
        },
        {
          filename: "main.py",
          lang: "python",
          source: `
from text_tools import longest_word, word_count


def main() -> None:
    with open("essay.txt", "w", encoding="utf-8") as f:
        f.write("Photosynthesis happens in the chloroplasts of green plants.")

    with open("essay.txt", encoding="utf-8") as f:
        text = f.read()

    count = word_count(text)
    longest = longest_word(text)
    print(f"Words: {count}, longest: {longest}")

    with open("report.txt", "a", encoding="utf-8") as report:
        report.write(f"essay.txt: {count} words, longest '{longest}'\\n")


if __name__ == "__main__":
    main()
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why open files with `with open(...) as f:`?",
        options: [
          "It reads files faster",
          "The file is closed automatically, even if an error happens",
          "It is the only way to read text",
          "It encrypts the file",
        ],
        answer: 1,
        explanation: "The `with` block guarantees cleanup when it ends.",
      },
      {
        question: "Which mode adds to the end of an existing file?",
        options: ["`\"w\"`", "`\"r\"`", "`\"x\"`", "`\"a\"`"],
        answer: 3,
        explanation: "`\"a\"` appends; `\"w\"` replaces the file's contents.",
      },
      {
        question: "When does code under `if __name__ == \"__main__\":` run?",
        options: [
          "Only when the file is run directly, not when it is imported",
          "Every time the module is imported",
          "Never",
          "Only inside a virtual environment",
        ],
        answer: 0,
        explanation: "It marks the module's entry point, so importing it has no side effects.",
      },
      {
        question: "What is `requirements.txt` used for?",
        options: [
          "Storing passwords",
          "Listing the Python version",
          "Recording the packages (and versions) a project needs, so others can install them",
          "Running tests",
        ],
        answer: 2,
        explanation: "`pip install -r requirements.txt` recreates the same environment elsewhere.",
      },
    ],
  },
  "strings-and-text": stringsAndTextPractice,
  "dates-and-times": datesAndTimesPractice,
};
