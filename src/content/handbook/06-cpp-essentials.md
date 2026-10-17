Many diploma and university computing courses in Tanzania teach programming in C++, and its ideas — classes, inheritance, careful use of memory, a compiler that checks your work before it runs — appear in every serious language. This chapter is written for those courses. You will rebuild the Form 4 results calculation from Chapter 5 in C++: grades and divisions in their own files, a `Student` class that refuses bad marks, people of different kinds sharing a common base class, and the standard library doing the sorting and counting.

By the end of this chapter you will be able to:

- install a C++ compiler and turn source code into a program;
- explain how C++'s types differ from JavaScript's and Python's;
- split a program into header and source files;
- use `std::vector`, `std::map`, `std::sort` and `std::accumulate`;
- write classes with private data, constructors and `const` member functions;
- use inheritance and virtual functions so different classes share one interface;
- throw and catch exceptions;
- read the compiler's error messages and fix what they point to.

The files for this chapter go in the `cpp` folder of your `results-system` project. This chapter assumes you have worked through Chapter 5, and moves faster than the earlier ones.

## 6.1 A compiled language

JavaScript and Python are run by another program — the browser, or `python` — which reads your code line by line as it goes. C++ is different. A *compiler* reads all of your code first, checks it, and translates it into a *program* that the computer's processor runs directly.

```text
 grades.cpp ─┐
 student.cpp ├─►  compiler (g++)  ─►  results.exe  ─►  run it
 main.cpp ───┘     checks types,        a program
                   translates           on its own
```

This has three consequences you will notice at once:

- **Mistakes are found early.** Use a number where text is expected, or call a function that does not exist, and the compiler refuses before the program ever runs.
- **Programs are fast.** There is nothing in between your program and the processor. This is why C++ is used for games, phones, cars, databases — PostgreSQL itself is written in C — and anywhere speed matters.
- **There is a step between writing and running.** Every change must be compiled again.

## 6.2 Setting up

On Windows, the easiest free compiler to install is *g++* from MSYS2:

1. Download the installer from **msys2.org** and run it, accepting the defaults.
2. In the **MSYS2 UCRT64** window that opens at the end, install the compiler:

```text
pacman -S mingw-w64-ucrt-x86_64-gcc
```

3. Add the compiler's folder to your PATH, so any terminal can find it: press `Windows`, type **environment variables**, open **Edit the system environment variables → Environment Variables**, select **Path** under your user variables, click **Edit → New**, and add `C:\msys64\ucrt64\bin`.
4. Close and reopen VS Code, open a terminal, and check:

```text
g++ --version
```

In VS Code, also install the **C/C++** extension from Microsoft. If you cannot install anything — on a shared college computer, for example — free websites such as onlinegdb.com compile and run C++ in the browser. They are fine for practice; keep your own copy of anything important.

### The first program

Create `hello.cpp`:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name = "Mwl. Grace Mushi";
    int students = 40;
    std::cout << "Habari, " << name << "! You have " << students << " students.\n";
    std::cout << "7 / 2 = " << 7 / 2 << '\n';
    std::cout << "7.0 / 2 = " << 7.0 / 2 << '\n';
    return 0;
}
```

Compile it, then run the program the compiler made:

```text
g++ -std=c++17 -Wall -o hello hello.cpp
.\hello
```

```output
Habari, Mwl. Grace Mushi! You have 40 students.
7 / 2 = 3
7.0 / 2 = 3.5
```

- `#include` brings in parts of the *standard library*: `<iostream>` for printing, `<string>` for text.
- Every C++ program starts at the function `main`. Returning `0` tells the computer it finished successfully.
- `std::cout << ...` prints. The `<<` arrows send each value to the screen, one after another. `'\n'` starts a new line.
- `std::` means the name comes from the standard library's *namespace*, called `std`.
- In the compile command, `-std=c++17` chooses the 2017 version of the language, `-Wall` turns on warnings about suspicious code, and `-o hello` names the program. On Linux and macOS, run it with `./hello`.

Look at the second and third lines of output. `7 / 2` is `3`: when both numbers are whole numbers, C++ does *integer division* and throws the remainder away. With one decimal number, `7.0 / 2` is `3.5`. Averages computed with whole numbers will be wrong unless you plan for this.

## 6.3 Types

In C++, every variable has a *type* that is fixed when it is created and checked by the compiler.

| C++ | Holds | JavaScript | Python |
|---|---|---|---|
| `int` | Whole numbers | number | `int` |
| `double` | Decimals | number | `float` |
| `char` | One character, in single quotes: `'A'` | string | `str` |
| `bool` | `true` or `false` | boolean | `bool` |
| `std::string` | Text, in double quotes: `"Amina"` | string | `str` |
| `std::vector<int>` | A list of `int`s | array | `list` |
| `std::map<std::string, int>` | Values under keys, kept in order | object | `dict` |

`const` before a type means the value can never change after it is set — the compiler enforces it. Use it whenever you can; it tells the reader, and the compiler, what will stay fixed.

To turn a whole number into a `double` before dividing, use `static_cast<double>(total) / count`. You will see exactly that in `Student::average` later.

## 6.4 Header and source files

A C++ program is usually split across several files. Each part comes in two halves:

- a **header** (`.h`) that *declares* what exists — the names and types of the functions, without their bodies;
- a **source file** (`.cpp`) that *defines* them — the bodies that do the work.

Other files `#include` the header, so they know what they can call. Here is the header for grades, `grades.h`:

```cpp
// Grades, points and divisions for Form 4 results.
#pragma once

#include <string>
#include <vector>

namespace results {

char gradeFor(int mark);
int pointsFor(char grade);

struct Division {
    int points;        // points of the best seven subjects; 0 if incomplete
    std::string name;  // "I" to "IV", "0", or "INC"
};

Division divisionFor(const std::vector<char>& grades);

}  // namespace results
```

- `#pragma once` stops the header being included twice in the same file, which would be an error.
- `namespace results { ... }` puts these names in a group of their own. Outside, they are written `results::gradeFor`, so they can never clash with another library's `gradeFor`.
- A `struct` groups values under one name. `Division` returns two answers — the points and the division's name — as one value, like the pair Python returned in Chapter 5.
- `const std::vector<char>& grades` is a *reference* to a list that the function promises not to change. Without the `&`, C++ would make a complete copy of the list every time the function is called.

The definitions are in `grades.cpp`. The divisions follow the rule explained in Chapter 5 — the best seven subjects, with A worth 1 point and F worth 5:

```cpp
int pointsFor(char grade) {
    switch (grade) {
        case 'A': return 1;
        case 'B': return 2;
        case 'C': return 3;
        case 'D': return 4;
        case 'F': return 5;
    }
    throw std::invalid_argument(std::string("not a grade: ") + grade);
}
```

`switch` picks the `case` matching the value — a neat way to write a chain of `if` statements that all test the same variable. If no case matches, the function reaches `throw`, which reports an error instead of returning a made-up number.

```cpp
Division divisionFor(const std::vector<char>& grades) {
    const std::size_t best = 7;
    if (grades.size() < best) return {0, "INC"};

    std::vector<int> points;
    for (char grade : grades) points.push_back(pointsFor(grade));
    std::sort(points.begin(), points.end());
    int total = std::accumulate(points.begin(), points.begin() + best, 0);

    if (total <= 17) return {total, "I"};
    if (total <= 21) return {total, "II"};
    if (total <= 25) return {total, "III"};
    if (total <= 33) return {total, "IV"};
    return {total, "0"};
}
```

This is where the standard library earns its place:

- `for (char grade : grades)` is a *range-based for loop*: each grade in turn, like Python's `for`.
- `push_back` adds an item to the end of a vector.
- `std::sort(points.begin(), points.end())` sorts the whole vector, smallest first. Standard algorithms work on a *range*, given as a beginning and an end.
- `std::accumulate(points.begin(), points.begin() + best, 0)` adds up the first seven, starting from `0`. Python's `sum(sorted(...)[:7])` became one line here too.
- `return {total, "I"}` builds a `Division` from its two values.

## 6.5 Classes

A *class* bundles data with the functions that work on it, and decides who may touch the data. Here is the student, in `student.h`:

```cpp
class Student : public Person {
public:
    Student(std::string name, std::string admissionNo);

    void setMark(const std::string& subject, int mark);
    double average() const;
    results::Division division() const;
    std::string describe() const override;

private:
    std::string admissionNo_;
    std::map<std::string, int> marks_;  // subject -> mark
};
```

Ignore `: public Person` and `override` for a moment; they are the subject of section 6.6.

- Everything under `public:` can be used by any code. Everything under `private:` can only be used by the class's own functions. The trailing underscore in `marks_` is a common way to mark private data.
- The **constructor** — the function with the same name as the class — runs when a `Student` is created, and sets it up.
- A function marked `const` promises not to change the object. `average()` only reads marks, so it is `const`; `setMark` changes them, so it is not.

Why make the marks private? Because then **the only way to change a mark is `setMark`**, and `setMark` checks it:

```cpp
void Student::setMark(const std::string& subject, int mark) {
    if (mark < 0 || mark > 100) {
        throw std::invalid_argument(name() + ", " + subject + ": " + std::to_string(mark) +
                                    " is not between 0 and 100");
    }
    marks_[subject] = mark;
}
```

No part of the program, however large it grows, can put a mark of 147 into a student. If someone tries to reach past the check and write `s.marks_["Biology"] = 147;` directly, the compiler stops them:

```output
error: 'std::map<std::__cxx11::basic_string<char>, int> Student::marks_' is private within this context
```

This idea — data kept private, and changed only through functions that protect it — is called *encapsulation*. It is the same reason the database in Chapter 4 has `CHECK` constraints: put the rule in one place that cannot be avoided.

`Student::` in front of the name says that this `setMark` belongs to the `Student` class. `std::to_string` turns a number into text, and `marks_[subject] = mark` stores the mark in the map under the subject's name, replacing any mark already there.

The constructor uses a special form, the *member initialiser list* after the colon, to set up the base class and the data before the body runs:

```cpp
Student::Student(std::string name, std::string admissionNo)
    : Person(std::move(name)), admissionNo_(std::move(admissionNo)) {}
```

`std::move` hands the text over instead of copying it — a small speed-up that you will see in most modern C++.

The average needs care with integer division, from section 6.2:

```cpp
double Student::average() const {
    if (marks_.empty()) return 0.0;
    int total = 0;
    for (const auto& [subject, mark] : marks_) total += mark;
    return static_cast<double>(total) / marks_.size();
}
```

`const auto& [subject, mark]` takes each entry of the map apart into its key and value, like Python's `for subject, mark in marks.items()`. `auto` lets the compiler work out the type itself.

## 6.6 Inheritance and virtual functions

A school has students and teachers. Both have names; each describes themselves differently. *Inheritance* lets them share what is common. The base class, in `person.h`:

```cpp
class Person {
public:
    explicit Person(std::string name) : name_(std::move(name)) {}
    virtual ~Person() = default;

    const std::string& name() const { return name_; }

    // Every kind of person describes themselves in their own way.
    virtual std::string describe() const = 0;

private:
    std::string name_;
};
```

And a teacher is a kind of person:

```cpp
class Teacher : public Person {
public:
    Teacher(std::string name, std::string subject)
        : Person(std::move(name)), subject_(std::move(subject)) {}

    std::string describe() const override {
        return name() + " teaches " + subject_;
    }

private:
    std::string subject_;
};
```

- `class Teacher : public Person` means a `Teacher` **is a** `Person`: it has everything a person has — here, `name()` — plus its own subject. `Student` is declared the same way.
- `virtual` marks a function that each derived class may provide its own version of. When the program calls `describe()` on a `Person`, C++ runs the version belonging to the real object, whether it is a teacher or a student. This is *polymorphism*: one call, many forms.
- `= 0` makes `describe` a *pure virtual* function: `Person` has no version of its own, so every derived class must write one. A class with a pure virtual function is *abstract* — you cannot create a plain `Person`, only teachers and students. Try `Person p("Amina");` and the compiler says:

```output
error: cannot declare variable 'p' to be of abstract type 'Person'
```

- `override` says "this replaces a virtual function from the base class". If you misspell the name, or the parameters do not match, the compiler tells you, instead of quietly creating a second, unrelated function.
- `virtual ~Person() = default;` is a *virtual destructor*. Any class meant to be used through a base-class pointer needs one, so that deleting the object cleans up the whole of it.
- `explicit` stops C++ from silently turning a plain string into a `Person` where you did not ask for one.

The payoff comes in `main.cpp`, where one list holds both kinds:

```cpp
    std::vector<std::unique_ptr<Person>> people;
    people.push_back(std::make_unique<Teacher>("Mwl. Grace Mushi", "Biology"));
    people.push_back(std::make_unique<Student>(students.front()));

    std::cout << '\n';
    for (const auto& person : people) std::cout << person->describe() << '\n';
```

A `std::unique_ptr<Person>` owns an object of any class derived from `Person`, and deletes it automatically when the list goes away — no memory is leaked, and you never write `delete` yourself. `->` calls a function through a pointer. The loop does not know or care which kind of person it has; each describes itself correctly.

## 6.7 Exceptions

When something goes wrong that the current function cannot fix, it *throws* an exception, as `setMark` does. Code further up that knows what to do *catches* it:

```cpp
    try {
        students.front().setMark("Biology", 147);
    } catch (const std::invalid_argument& error) {
        std::cout << "\nRefused: " << error.what() << '\n';
    }
```

`error.what()` is the message given when the exception was thrown. If nothing catches an exception, the program stops — which is better than carrying on with a wrong mark.

## 6.8 The whole program

`main.cpp` puts it together: it gives five students their marks, sorts them best first, prints a table, counts the divisions, shows a bad mark being refused, and lets a teacher and a student describe themselves. Sorting uses a *lambda* — a small function written where it is needed:

```cpp
    std::sort(students.begin(), students.end(), [](const Student& a, const Student& b) {
        if (rankOf(a) != rankOf(b)) return rankOf(a) < rankOf(b);
        return a.average() > b.average();
    });
```

The lambda answers one question for `std::sort`: should `a` come before `b`? Fewer points first; if the points are equal, the higher average first. `rankOf` treats an incomplete result as worse than any division.

Counting uses a map: `++count[d.name];` adds one to the count for that division, and a name not yet in the map starts at zero.

A program made of several files is compiled by naming all the `.cpp` files. Headers are not listed; they are included by the `.cpp` files that need them:

```text
g++ -std=c++17 -Wall -Wextra -o results main.cpp grades.cpp student.cpp
.\results
```

```output
No. Name            Average  Points  Division
1   Neema Kileo        89.2       7  I
2   Amina Juma         79.2       7  I
3   Rehema Mollel      65.8      15  I
4   Baraka Mushi       53.1      20  II
5   Juma Hassan        38.6      26  IV

Divisions: I=3 II=1 IV=1

Refused: Neema Kileo, Biology: 147 is not between 0 and 100

Mwl. Grace Mushi teaches Biology
Neema Kileo (MSS/2023/003), 9 subjects
```

These five students have the same averages, points and divisions as in the Python report in Chapter 5. Two programs in two languages agreeing is good evidence that both are right.

`-Wextra` turns on even more warnings than `-Wall`. This program compiles with none. Aim for that in your own work: a warning is the compiler pointing at something that is probably a mistake.

## 6.9 Reading compiler errors

The compiler's messages look alarming at first, but they follow a pattern: **file, line, column, then what is wrong**. Always fix the *first* error first — one mistake often causes a cascade of confusing errors after it, which disappear when the first is fixed.

| The compiler says | What it means |
|---|---|
| `main.cpp:4:5: error: expected ',' or ';' before 'return'` | A semicolon is missing at the end of the line *before* line 4 |
| `error: 'cout' was not declared in this scope; did you mean 'std::cout'?` | The `std::` is missing, or the `#include` is |
| `error: cannot declare variable 'p' to be of abstract type 'Person'` | You tried to create an object of a class with a pure virtual function |
| `error: ... is private within this context` | Code outside a class tried to use its private data |
| `undefined reference to 'Student::division() const'` | This comes from the *linker*, the last step: a function was declared but its `.cpp` file was not included in the compile command |

The last one is worth understanding. Compiling has two stages: each `.cpp` file is compiled on its own, and then the *linker* joins the pieces into one program. If you forget `student.cpp` in the command, every file still compiles — the header promised `Student::division` exists — but the linker cannot find its body.

## 6.10 The complete files

The `cpp` folder holds six files. Compile them with the command in section 6.8.

### `cpp/grades.h`

```cpp
// Grades, points and divisions for Form 4 results.
#pragma once

#include <string>
#include <vector>

namespace results {

char gradeFor(int mark);
int pointsFor(char grade);

struct Division {
    int points;        // points of the best seven subjects; 0 if incomplete
    std::string name;  // "I" to "IV", "0", or "INC"
};

Division divisionFor(const std::vector<char>& grades);

}  // namespace results
```

### `cpp/grades.cpp`

```cpp
#include "grades.h"

#include <algorithm>
#include <numeric>
#include <stdexcept>

namespace results {

char gradeFor(int mark) {
    if (mark < 0 || mark > 100) {
        throw std::invalid_argument("a mark must be between 0 and 100");
    }
    if (mark >= 75) return 'A';
    if (mark >= 65) return 'B';
    if (mark >= 45) return 'C';
    if (mark >= 30) return 'D';
    return 'F';
}

int pointsFor(char grade) {
    switch (grade) {
        case 'A': return 1;
        case 'B': return 2;
        case 'C': return 3;
        case 'D': return 4;
        case 'F': return 5;
    }
    throw std::invalid_argument(std::string("not a grade: ") + grade);
}

Division divisionFor(const std::vector<char>& grades) {
    const std::size_t best = 7;
    if (grades.size() < best) return {0, "INC"};

    std::vector<int> points;
    for (char grade : grades) points.push_back(pointsFor(grade));
    std::sort(points.begin(), points.end());
    int total = std::accumulate(points.begin(), points.begin() + best, 0);

    if (total <= 17) return {total, "I"};
    if (total <= 21) return {total, "II"};
    if (total <= 25) return {total, "III"};
    if (total <= 33) return {total, "IV"};
    return {total, "0"};
}

}  // namespace results
```

### `cpp/person.h`

```cpp
// People in a school: what every person has, and how each kind differs.
#pragma once

#include <string>
#include <utility>

class Person {
public:
    explicit Person(std::string name) : name_(std::move(name)) {}
    virtual ~Person() = default;

    const std::string& name() const { return name_; }

    // Every kind of person describes themselves in their own way.
    virtual std::string describe() const = 0;

private:
    std::string name_;
};

class Teacher : public Person {
public:
    Teacher(std::string name, std::string subject)
        : Person(std::move(name)), subject_(std::move(subject)) {}

    std::string describe() const override {
        return name() + " teaches " + subject_;
    }

private:
    std::string subject_;
};
```

### `cpp/student.h`

```cpp
// A student and their marks for one examination.
#pragma once

#include <map>
#include <string>

#include "grades.h"
#include "person.h"

class Student : public Person {
public:
    Student(std::string name, std::string admissionNo);

    void setMark(const std::string& subject, int mark);
    double average() const;
    results::Division division() const;
    std::string describe() const override;

private:
    std::string admissionNo_;
    std::map<std::string, int> marks_;  // subject -> mark
};
```

### `cpp/student.cpp`

```cpp
#include "student.h"

#include <stdexcept>
#include <utility>
#include <vector>

Student::Student(std::string name, std::string admissionNo)
    : Person(std::move(name)), admissionNo_(std::move(admissionNo)) {}

void Student::setMark(const std::string& subject, int mark) {
    if (mark < 0 || mark > 100) {
        throw std::invalid_argument(name() + ", " + subject + ": " + std::to_string(mark) +
                                    " is not between 0 and 100");
    }
    marks_[subject] = mark;
}

double Student::average() const {
    if (marks_.empty()) return 0.0;
    int total = 0;
    for (const auto& [subject, mark] : marks_) total += mark;
    return static_cast<double>(total) / marks_.size();
}

results::Division Student::division() const {
    std::vector<char> grades;
    for (const auto& [subject, mark] : marks_) grades.push_back(results::gradeFor(mark));
    return results::divisionFor(grades);
}

std::string Student::describe() const {
    return name() + " (" + admissionNo_ + "), " + std::to_string(marks_.size()) + " subjects";
}
```

### `cpp/main.cpp`

```cpp
// Form 4 results: classes, inheritance and the standard library.
#include <algorithm>
#include <iomanip>
#include <iostream>
#include <map>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

#include "person.h"
#include "student.h"

// Lower is better: points of the best seven, with incomplete results last.
int rankOf(const Student& student) {
    results::Division d = student.division();
    return d.name == "INC" ? 100 : d.points;
}

int main() {
    const std::vector<std::string> subjects = {"Civics",  "History",     "Geography", "Kiswahili", "English",
                                               "Biology", "Mathematics", "Chemistry", "Physics"};
    const std::vector<std::vector<int>> marks = {
        {82, 76, 79, 88, 85, 81, 78, 74, 70},
        {58, 49, 61, 66, 61, 47, 52, 44, 40},
        {90, 85, 88, 92, 88, 94, 91, 86, 89},
        {38, 41, 35, 52, 49, 38, 34, 29, 31},
        {68, 70, 63, 75, 72, 59, 66, 58, 61},
    };
    std::vector<Student> students = {
        {"Amina Juma", "MSS/2023/001"},  {"Baraka Mushi", "MSS/2023/002"},
        {"Neema Kileo", "MSS/2023/003"}, {"Juma Hassan", "MSS/2023/004"},
        {"Rehema Mollel", "MSS/2023/005"},
    };

    for (std::size_t i = 0; i < students.size(); ++i) {
        for (std::size_t j = 0; j < subjects.size(); ++j) {
            students[i].setMark(subjects[j], marks[i][j]);
        }
    }

    // Best first: fewest points, then the higher average.
    std::sort(students.begin(), students.end(), [](const Student& a, const Student& b) {
        if (rankOf(a) != rankOf(b)) return rankOf(a) < rankOf(b);
        return a.average() > b.average();
    });

    std::cout << std::left << std::setw(4) << "No." << std::setw(15) << "Name" << std::right
              << std::setw(8) << "Average" << std::setw(8) << "Points" << "  Division\n";

    std::map<std::string, int> count;
    int number = 1;
    for (const Student& s : students) {
        results::Division d = s.division();
        std::cout << std::left << std::setw(4) << number++ << std::setw(15) << s.name() << std::right
                  << std::fixed << std::setprecision(1) << std::setw(8) << s.average()
                  << std::setw(8) << d.points << "  " << d.name << '\n';
        ++count[d.name];
    }

    std::cout << "\nDivisions:";
    for (const auto& [name, n] : count) std::cout << ' ' << name << '=' << n;
    std::cout << '\n';

    // A mistake in the data is refused, not quietly accepted.
    try {
        students.front().setMark("Biology", 147);
    } catch (const std::invalid_argument& error) {
        std::cout << "\nRefused: " << error.what() << '\n';
    }

    // A teacher and a student are both people, so one list can hold both.
    std::vector<std::unique_ptr<Person>> people;
    people.push_back(std::make_unique<Teacher>("Mwl. Grace Mushi", "Biology"));
    people.push_back(std::make_unique<Student>(students.front()));

    std::cout << '\n';
    for (const auto& person : people) std::cout << person->describe() << '\n';

    return 0;
}
```

`std::setw(15)` sets the width of the next value printed, and `std::left` and `std::right` line it up, as `<` and `>` did in Python's f-strings. `std::fixed` with `std::setprecision(1)` prints one decimal place.

### Try it yourself

1. Add Elia Kimaro from Chapter 5, who missed Geography: give him every mark except that one. Check that his points and division match the Python report.
2. Add a `HeadTeacher` class that inherits from `Teacher` and describes themselves differently. Does `people` need any change to hold one?
3. Read the class list from `class_list.csv` instead of the marks written in `main`. You will need `<fstream>`, `std::getline` and a way to split a line at commas.
4. Write a small test program, `test_grades.cpp`, that uses `assert` from `<cassert>` to check the grade and division boundaries tested in Chapter 5.
5. Add a function to `Student` that returns its best subject. Should it be `const`?

## Key terms

| English | Kiswahili | Meaning |
|---|---|---|
| Compiler | Kikusanyaji | A program that checks source code and turns it into a program the computer runs |
| Source code | Msimbo chanzo | The code you write, before it is compiled |
| Header file | Faili kichwa | A `.h` file that declares what other files can use |
| Type | Aina | The kind of value a variable holds, such as `int` or `std::string` |
| Class | Darasa | A bundle of data and the functions that work on it |
| Object | Kitu | One value made from a class, such as one student |
| Constructor | Kijenzi | The function that sets up a new object |
| Inheritance | Urithi | A class taking on everything another class has, and adding to it |
| Encapsulation | Ufichaji | Keeping data private and changing it only through checked functions |
| Polymorphism | Upolimofu | One call running different code depending on the real object |
| Exception | Hitilafu | An error that is thrown and can be caught further up |
| Linker | Kiunganishi | The last step of compiling, joining all the pieces into one program |

## Check your understanding

1. What does a compiler do that Python and the browser do not do before your program runs?
2. Why does `7 / 2` give `3` in C++, and how do you get `3.5`?
3. What is the difference between `grades.h` and `grades.cpp`?
4. Why is the parameter of `divisionFor` written `const std::vector<char>& grades` and not `std::vector<char> grades`?
5. Why are a student's marks `private`, and what would go wrong if they were `public`?
6. Why is `average()` a `const` function, but not `setMark`?
7. What does `= 0` after `virtual std::string describe() const` mean, and what does it stop you doing?
8. In the loop over `people`, how does C++ know whether to run `Teacher::describe` or `Student::describe`?
9. You compile with `g++ -o results main.cpp grades.cpp` and get `undefined reference to 'Student::division() const'`. What is wrong?
10. The compiler reports twelve errors. Which do you fix first, and why?

### Answers

1. It reads and checks the whole program before anything runs — types, names, function calls — and translates it into a program the processor runs directly.
2. Both numbers are `int`, so C++ does integer division and drops the remainder. Make one of them a `double`: `7.0 / 2`, or `static_cast<double>(7) / 2`.
3. The header declares the functions and types — what exists. The source file defines them — the bodies that do the work. Other files include the header.
4. The `&` passes a reference, so the vector is not copied each time; `const` promises the function will not change it.
5. So that the only way to change a mark is `setMark`, which checks it. If they were public, any code could store a mark of 147 and every result would be wrong.
6. `average()` only reads the marks, so it promises not to change the object. `setMark` changes the marks, so it cannot be `const`.
7. It makes `describe` pure virtual: `Person` has no version of its own and every derived class must write one. You cannot create a plain `Person` object.
8. `describe` is `virtual`, so C++ looks at the real type of each object when the program runs and calls that class's version.
9. `student.cpp` is missing from the command, so the linker cannot find the bodies of `Student`'s functions. Add it: `g++ -o results main.cpp grades.cpp student.cpp`.
10. The first. A single mistake, such as a missing semicolon, often causes many confusing errors after it, which disappear once it is fixed.
