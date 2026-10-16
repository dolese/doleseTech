At the end of Chapter 2 the results page looked finished, but it could not do anything. Every average was worked out by hand, the **Save mark** button only reloaded the page, and if one mark changed, someone had to recalculate the average, the grade and the class average with a calculator. In this chapter you add the third language of the web, JavaScript, and the page starts to work: it calculates averages, grades and positions by itself, checks each mark as it is typed, saves new marks, and remembers them the next time it is opened.

By the end of this chapter you will be able to:

- add a JavaScript file to a page and try code in the browser's console;
- store values in variables, and do arithmetic and rounding correctly;
- make decisions with `if` and `else`;
- write your own functions and reuse them;
- keep a class list in arrays and objects, and loop through it;
- read and change a page from JavaScript, safely;
- respond to typing and clicking with events;
- save data in the browser so it is still there tomorrow;
- read error messages and find your own mistakes.

You will start from the two files you finished in Chapter 2, `results.html` and `style.css`, in your `web` folder.

## 3.1 What JavaScript does

You now know three languages that work together, each with its own job:

| Language | Job | On our page |
|---|---|---|
| HTML | What is on the page | A table, a form, a button |
| CSS | How it looks | Navy heading row, green grade badges |
| JavaScript | What it *does* | Works out averages, checks marks, saves them |

JavaScript is a full programming language. It can store information, do calculations, make decisions and repeat work — and every web browser can run it. That makes it the only programming language you can use on a web page without installing anything.

### Adding a script to the page

Create a new file in the `web` folder called `results.js`. Then add one line to the `head` of `results.html`, under the `link` to the stylesheet:

```html
<script src="results.js" defer></script>
```

The `defer` attribute matters. Without it, the browser would run the script the moment it reached this line in the `head` — before the table and the form below it exist — and the script would not find them. With `defer`, the browser downloads the script straight away but waits to run it until the whole page has been read.

## 3.2 The console

Before you write the file, try JavaScript one line at a time. Open the page, press `F12` and choose the **Console** tab. Type each line below and press `Enter`:

```js
2 + 3
(78 + 85 + 81) / 3
"Habari, " + "Amina"
console.log("The page is working")
```

The console answers each line straight away: `5`, `81.33333333333333`, `"Habari, Amina"`. `console.log` prints a message; you will use it constantly to check what your program is doing. Anything a script prints with `console.log` appears here, and so does every error.

> **Scam alert:** Never paste code into the console because someone asked you to, however friendly or official the message is. Code in the console can read everything on the page, including your accounts. Browsers warn about this, and some make you type *allow pasting* before they let you paste at all. Type the examples in this book yourself — it is also how you learn them.

## 3.3 Values and variables

Programs work with *values*. The three kinds you need first are:

| Kind | Examples | Used for |
|---|---|---|
| Number | `78`, `81.3`, `-5` | Marks, averages, counts |
| String (text) | `"Amina Juma"`, `"Biology"` | Names, subjects, messages — always in quotes |
| Boolean | `true`, `false` | The answer to a yes-or-no question |

A *variable* is a name for a value, so you can use it later. Create one with `const` or `let`:

```js
const subject = "Mathematics";
let total = 0;
total = total + 78;
```

- `const` means the name will always refer to the same value. Use it whenever you can.
- `let` means the value may change later, like a running `total`.
- `=` puts the value on the right into the name on the left. As Chapter 1 warned, it does *not* mean "is equal to".

Names cannot contain spaces. JavaScript programmers write longer names in *camelCase* — every word after the first starts with a capital letter: `classAverage`, `topStudent`, `markInput`. Choose names that say what the value is; `averageOfAmina` is clear, `x2` is not.

## 3.4 Arithmetic and rounding

JavaScript uses the symbols from Chapter 1: `+`, `-`, `*` for multiply, `/` for divide and `%` for the remainder. Multiplication and division happen before addition and subtraction, just as in mathematics, so use brackets to say what you mean:

```js
78 + 85 + 81 / 3     // 189 — only 81 is divided
(78 + 85 + 81) / 3   // 81.33333333333333
```

Everything after `//` on a line is a *comment*: the computer ignores it.

### Rounding

An average such as `81.33333333333333` needs rounding to one decimal place. `Math.round` rounds to a whole number, so we multiply by 10 first and divide afterwards:

```js
function roundTo1(number) {
  return Math.round(number * 10) / 10;
}
```

`roundTo1(81.333)` gives `81.3`. To *show* a number with exactly one decimal place, use `toFixed(1)`: `(91).toFixed(1)` gives `"91.0"` — notice that the answer is a string, ready to display, not a number to calculate with.

> **Remember:** Computers store most decimals as close approximations. Type `0.1 + 0.2` into the console and you get `0.30000000000000004`. This is normal in every programming language. Round when you *show* a result, not halfway through a calculation.

### The string trap

```js
"78" + 5          // "785"
Number("78") + 5  // 83
```

When one side of `+` is a string, JavaScript joins instead of adding. Everything a visitor types into a form reaches your script as a string — even in a box with `type="number"` — so turn it into a number with `Number()` before you calculate. If the text is not a number at all, `Number` gives the special value `NaN`, "not a number", which you will meet again in section 3.13.

## 3.5 Making decisions

A grade depends on the mark. In code, a decision is an `if` statement:

```js
function gradeFor(mark) {
  if (mark >= 75) {
    return "A";
  } else if (mark >= 65) {
    return "B";
  } else if (mark >= 45) {
    return "C";
  } else if (mark >= 30) {
    return "D";
  } else {
    return "F";
  }
}
```

The computer checks each condition from the top and stops at the first one that is true. For a mark of 70, `70 >= 75` is false, so it moves on; `70 >= 65` is true, so the answer is `"B"` and the remaining lines are skipped. The order matters: if the test for `D` came first, every mark of 30 or more would get a D.

Always test the edges, where mistakes hide: `gradeFor(75)` must give `"A"` and `gradeFor(74)` must give `"B"`. Try them in the console once your file is loaded.

| Operator | Means | Example that is `true` |
|---|---|---|
| `===` | Is equal to | `grade === "A"` |
| `!==` | Is not equal to | `grade !== "F"` |
| `>`, `<` | Greater than, less than | `81 > 75` |
| `>=`, `<=` | Greater than or equal to, less than or equal to | `75 >= 75` |
| `&&` | And — both must be true | `mark >= 0 && mark <= 100` |
| `\|\|` | Or — at least one must be true | `mark < 0 \|\| mark > 100` |
| `!` | Not — turns true into false | `!false` |

> **Tip:** Use `===`, with three equals signs, to compare. JavaScript also has `==`, which converts values before comparing, so that `"78" == 78` is true. That surprises people; `===` never does.

## 3.6 Functions

`gradeFor` and `roundTo1` are *functions*: named pieces of code that you can use again and again. A function has:

- a **name**, such as `gradeFor`;
- **parameters** in brackets — the values it needs to do its job, such as `mark`;
- a **body** in curly braces — the steps;
- a **return value** — the answer it gives back, after `return`.

Defining a function does nothing on its own. It runs when you *call* it, by writing its name followed by the values in brackets: `gradeFor(81.3)` gives `"A"`.

Functions are why programs stay manageable. The grade boundaries live in exactly one place. If they change, you change `gradeFor`, and every grade on the page — in the table, in a report, anywhere — follows.

## 3.7 Arrays and objects

A whole class needs more than single variables. JavaScript has two ways to group values.

An *array* is a list in square brackets. Items are counted from **zero**:

```js
const SUBJECTS = ["Mathematics", "English", "Biology"];
SUBJECTS[0]       // "Mathematics"
SUBJECTS[2]       // "Biology"
SUBJECTS.length   // 3
```

An *object* groups named values, called *properties*, in curly braces:

```js
const student = { name: "Amina Juma", sex: "F", marks: { Mathematics: 78, English: 85, Biology: 81 } };
student.name               // "Amina Juma"
student.marks.Biology      // 81
student.marks["Biology"]   // 81 — the same, with the name as a string
```

The square-bracket form is useful when the property name is in a variable: if `subject` holds `"Biology"`, then `student.marks[subject]` is `81`.

Put the two together — an array of objects — and you have a class list. This is the start of `results.js`:

```js
const SUBJECTS = ["Mathematics", "English", "Biology"];
const STORAGE_KEY = "mwangaza-form4-term1-2026";

// The marks from Chapter 2, now kept as data instead of typed into the table.
const startingStudents = [
  { name: "Amina Juma", sex: "F", marks: { Mathematics: 78, English: 85, Biology: 81 } },
  { name: "Baraka Mushi", sex: "M", marks: { Mathematics: 52, English: 61, Biology: 47 } },
  { name: "Neema Kileo", sex: "F", marks: { Mathematics: 91, English: 88, Biology: 94 } },
  { name: "Juma Hassan", sex: "M", marks: { Mathematics: 34, English: 49, Biology: 38 } },
  { name: "Rehema Mollel", sex: "F", marks: { Mathematics: 66, English: 72, Biology: 59 } },
];
```

Names written in capitals, such as `SUBJECTS`, are a convention for settings that never change while the program runs. `STORAGE_KEY` is used in section 3.11.

The big idea of this chapter starts here: **the data is the truth, and the page is drawn from it.** In Chapter 2 the marks lived inside the HTML table. Now they live in this array, and the table will be built from it. Change a mark in the data, redraw the table, and every average, grade and position is right.

## 3.8 Loops

A *loop* repeats work for every item in a list. `for...of` takes the items one at a time:

```js
function averageOf(student) {
  let total = 0;
  for (const subject of SUBJECTS) {
    total = total + student.marks[subject];
  }
  return roundTo1(total / SUBJECTS.length);
}
```

The first time round, `subject` is `"Mathematics"`; then `"English"`; then `"Biology"`. Each time, that subject's mark is added to `total`. Dividing by `SUBJECTS.length` rather than by `3` means the function still works when you add a fourth subject.

When you need the position in the list as well, use the counting form of `for`:

```js
for (let i = 0; i < students.length; i++) {
  const student = students[i];
  // ...
}
```

Read it as: start with `i` at 0; keep going while `i` is less than the number of students; after each round, add one to `i` (`i++`). For five students, `i` is 0, 1, 2, 3 and 4.

### Positions

Schools rank students by average, and students with the same average share a position. If two students tie for second place, both are 2nd and the next student is 4th — no one is 3rd. There is a neat way to work this out: **a student's position is one more than the number of students with a higher average.**

```js
// Position 1 has the highest average. Students with the same average share
// a position, and the next position is skipped: 1, 2, 2, 4.
function positionOf(student) {
  let higher = 0;
  for (const other of students) {
    if (averageOf(other) > averageOf(student)) {
      higher = higher + 1;
    }
  }
  return higher + 1;
}
```

Nobody has a higher average than Neema, so she is 1st. Only Neema is above Amina, so Amina is 2nd. Two students with the same average have the same number of students above them, so they share a position automatically.

## 3.9 Changing the page

The browser turns your HTML into a tree of objects called the *DOM* (Document Object Model). JavaScript can find any element in it, read it and change it.

### Finding elements

`document.querySelector` takes a CSS selector — exactly the kind you wrote in Chapter 2 — and gives back the first element that matches:

```js
const tableBody = document.querySelector("#results-body");
```

For that to work, the elements need ids. In `results.html`, the body of the table loses its five typed rows and becomes empty, ready for JavaScript to fill:

```html
<tbody id="results-body"></tbody>
```

The three summary numbers get ids too, with a dash showing until the script fills them in:

```html
<ul class="stats">
  <li><span id="count">-</span> students</li>
  <li><span id="class-average">-</span> class average</li>
  <li><span id="top-student">-</span> top student</li>
</ul>
```

Add a ninth heading to the table, after **Grade**, for the new column:

```html
<th scope="col" class="num">Position</th>
```

### Building the table

To make a new element, create it, fill it, and attach it to the page:

```js
function addCell(row, text, className) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) {
    cell.className = className;
  }
  row.appendChild(cell);
  return cell;
}
```

`createElement("td")` makes a new, empty cell that is not yet on the page. `textContent` sets the text inside it, `className` sets its `class` attribute, and `appendChild` puts it inside the row. A *parameter* that is not given is `undefined`, so `if (className)` skips that step when a cell needs no class.

Now a function can build every row from the data:

```js
function renderTable() {
  tableBody.textContent = "";

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const average = averageOf(student);
    const grade = gradeFor(average);
    const row = document.createElement("tr");

    addCell(row, i + 1);
    addCell(row, student.name);
    addCell(row, student.sex);
    for (const subject of SUBJECTS) {
      addCell(row, student.marks[subject], "num");
    }
    addCell(row, average.toFixed(1), "num");

    const badge = document.createElement("span");
    badge.className = "grade grade-" + grade.toLowerCase();
    badge.textContent = grade;
    addCell(row, "").appendChild(badge);

    addCell(row, positionOf(student), "num");
    tableBody.appendChild(row);
  }
}
```

Setting `tableBody.textContent = ""` first removes the old rows, so the function can be called again and again — after every change — without the table growing. The grade badge is built from the grade itself: `"grade grade-" + "a"` gives the class `grade grade-a`, and the CSS from Chapter 2 colours it.

> **Warning:** You will see code online that builds pages by writing HTML into `innerHTML`. Avoid it for anything a person typed. If a "name" contains HTML or a script, `innerHTML` runs it — a classic way of attacking websites. `textContent` always shows text as text, whatever it contains.

### The summary

```js
function renderSummary() {
  let total = 0;
  let top = students[0];
  for (const student of students) {
    total = total + averageOf(student);
    if (averageOf(student) > averageOf(top)) {
      top = student;
    }
  }

  document.querySelector("#count").textContent = students.length;
  document.querySelector("#class-average").textContent = (total / students.length).toFixed(1);
  document.querySelector("#top-student").textContent = top.name;
}

function render() {
  renderTable();
  renderSummary();
}
```

The loop does two jobs at once: it adds up the averages for the class average, and it keeps track of the best student seen so far. It starts by assuming the first student is the best, and replaces them whenever it meets a higher average.

The last two lines of `results.js` start everything when the page opens:

```js
fillChoices();
render();
```

`fillChoices` is in the next section. Reload the page: the table is back, drawn by your code, with a **Position** column — and the averages match the ones you worked out by hand in Chapter 2.

## 3.10 Events: responding to the teacher

An *event* is something that happens on the page: a click, a key press, a form being sent. `addEventListener` tells the browser to run a function whenever a particular event happens to a particular element.

### Filling the choices

First, the form. Its two drop-down lists lose their typed `option` elements, and the form gets an id and one new attribute:

```html
<form id="mark-form" novalidate>
  <label for="student">Student</label>
  <select id="student" name="student"></select>

  <label for="subject">Subject</label>
  <select id="subject" name="subject"></select>

  <label for="mark">Mark (0 to 100)</label>
  <input id="mark" name="mark" type="number" min="0" max="100" required>

  <button type="submit">Save mark</button>
  <button type="button" id="reset" class="secondary">Restore original marks</button>
</form>
<p id="message" class="message" role="status"></p>
```

`novalidate` switches off the browser's own checking, because the script will check marks itself with clearer messages. The `p` with `role="status"` is where messages appear; the role makes screen readers announce them. The second button has `type="button"`, so clicking it does not send the form.

The script fills the drop-down lists from the data, so they can never disagree with the table:

```js
function fillChoices() {
  for (let i = 0; i < students.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = students[i].name;
    studentSelect.appendChild(option);
  }
  for (const subject of SUBJECTS) {
    const option = document.createElement("option");
    option.textContent = subject;
    subjectSelect.appendChild(option);
  }
}
```

Each student's option has the student's number in the list as its `value`, so when the form is sent, `students[Number(studentSelect.value)]` is the right student.

### Checking a mark

One function decides whether a mark is acceptable, and returns a message saying what is wrong — or an empty string if nothing is:

```js
// Returns what is wrong with a typed mark, or "" if it is fine.
function checkMark(text) {
  if (text.trim() === "") {
    return "Type a mark.";
  }
  const mark = Number(text);
  if (!Number.isInteger(mark)) {
    return "Marks are whole numbers, such as 67.";
  }
  if (mark < 0 || mark > 100) {
    return "A mark must be between 0 and 100.";
  }
  return "";
}
```

`trim()` removes spaces from both ends, so a box containing only spaces counts as empty. `Number.isInteger` is true only for whole numbers, so `67.5` — and `NaN` — are refused.

The `input` event happens every time the content of a box changes, so the teacher sees a problem while typing, not after:

```js
function showMessage(text, kind) {
  message.textContent = text;
  message.className = "message " + kind;
}

markInput.addEventListener("input", function () {
  showMessage(checkMark(markInput.value), "error");
});
```

The function given to `addEventListener` has no name; it exists only to be run when the event happens. When the mark is fine, `checkMark` returns `""` and the message disappears.

### Saving a mark

```js
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const problem = checkMark(markInput.value);
  if (problem !== "") {
    showMessage(problem, "error");
    markInput.focus();
    return;
  }

  const student = students[Number(studentSelect.value)];
  const subject = subjectSelect.value;
  const mark = Number(markInput.value);

  student.marks[subject] = mark;
  saveStudents();
  render();

  showMessage(`Saved: ${student.name}, ${subject} ${mark}.`, "success");
  markInput.value = "";
});
```

Step by step:

1. `event.preventDefault()` stops the browser's normal behaviour for a form, which is to reload the page.
2. The mark is checked again. If there is a problem, the message is shown, the cursor goes back to the box, and `return` leaves the function early — nothing is saved.
3. The new mark goes into the **data**: `student.marks[subject] = mark`.
4. The data is saved (next section), and `render()` redraws the table and the summary from it.
5. A confirmation appears. The text between backticks is a *template string*: everything inside `${ }` is replaced by its value, giving, for example, "Saved: Juma Hassan, Biology 58."

Try it: give Juma Hassan 58 in Biology. His average rises from 40.3 to 47.0, his grade from D to C, and the class average changes — all without a calculator.

The variables used by these functions are found once, when the script starts:

```js
const form = document.querySelector("#mark-form");
const studentSelect = document.querySelector("#student");
const subjectSelect = document.querySelector("#subject");
const markInput = document.querySelector("#mark");
const message = document.querySelector("#message");
const resetButton = document.querySelector("#reset");
```

Add the styles for the messages and the second button to the **end** of `style.css`:

```css
/* Chapter 3: messages and the second button */
.message {
  min-height: 1.5em;
  margin: 12px 0 0;
  font-weight: 600;
}

.message.error {
  color: #9b1c1c;
}

.message.success {
  color: #1d5e1a;
}

button.secondary {
  background: #ffffff;
  color: #1b2435;
  border: 1px solid #b8c1cc;
}

button.secondary:hover {
  background: #f4f6f8;
}
```

`.message.error`, with no space, means an element that has *both* classes. `min-height` keeps space for one line of message, so the page does not jump when a message appears.

## 3.11 Remembering marks

Enter a mark, then reload the page: the mark is gone. The `students` array lives in the browser's memory — the "desk" from Chapter 1 — and a reload clears the desk. The browser has a small "cupboard" each website can use, called `localStorage`. It keeps text, under a name you choose, until it is deleted.

`localStorage` can only store strings, so the array is turned into text with `JSON.stringify` and back again with `JSON.parse`. *JSON* is a way of writing data as text that looks almost exactly like JavaScript arrays and objects.

```js
function loadStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("The saved marks could not be read, so the originals are used.", error);
    }
  }
  return structuredClone(startingStudents);
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}
```

- `getItem` gives back the saved text, or `null` if nothing has been saved yet.
- `try` and `catch` handle a problem without stopping the whole program. If the saved text is damaged, `JSON.parse` *throws an error*; instead of the page breaking, the `catch` part runs, a warning goes to the console, and the original marks are used.
- `structuredClone` makes a complete, separate copy. Changing the copy never changes `startingStudents`, so the originals are always there to go back to.

Near the top of the file, the class list is loaded once, when the page opens:

```js
let students = loadStudents();
```

It is `let`, not `const`, because the restore button replaces it with a fresh copy.

### Putting the originals back

```js
resetButton.addEventListener("click", function () {
  if (confirm("Put back the original marks? Marks you entered will be lost.")) {
    localStorage.removeItem(STORAGE_KEY);
    students = structuredClone(startingStudents);
    render();
    showMessage("The original marks are back.", "success");
  }
});
```

`confirm` shows a box with **OK** and **Cancel**, and gives back `true` only if the teacher chose OK. Always ask before throwing work away.

> **Warning:** `localStorage` belongs to one browser on one device. Marks entered on the school office computer are not on the head teacher's phone, and clearing the browser's data deletes them. It is perfect for a draft, and wrong for a school's only copy of its results. Chapter 4 moves the marks into a database that everyone can share.

## 3.12 The whole program, in order

`results.js` is now complete. Read the full listing in section 3.14 from top to bottom and notice its shape, which most small programs share:

1. **Settings and data:** `SUBJECTS`, `STORAGE_KEY`, `startingStudents`, and `students` loaded from storage.
2. **Calculations:** `gradeFor`, `roundTo1`, `averageOf`, `positionOf`, `checkMark`. They only work things out; none of them touches the page.
3. **Saving:** `loadStudents`, `saveStudents`.
4. **Showing:** `addCell`, `renderTable`, `renderSummary`, `render`.
5. **Responding:** the form, the buttons and their events.
6. **Start:** `fillChoices()` and `render()`.

Keeping calculations apart from the page is deliberate. In Chapter 5 you will rewrite `gradeFor` and `averageOf` in Python, and because they never touched the page, they move across almost unchanged.

Divisions — Division I to IV and Division 0 — are worked out from a student's best seven subjects. With three subjects the page cannot do it yet; Chapter 5 adds it when the class has a full set of subjects.

## 3.13 Finding mistakes

Every programmer makes mistakes every day. The skill is finding them quickly. When the page does not do what you expect, open the console (`F12`) first. A red error tells you what went wrong and, on the right, which file and line.

- `Uncaught ReferenceError: totl is not defined`  
  A name is misspelt, or used before it was created. Names are case-sensitive: `markinput` is not `markInput`.
- `Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')`  
  `querySelector` found nothing: the id in the script does not match the HTML, or the script ran before the page existed — check for `defer`.
- `Uncaught SyntaxError: Unexpected token '}'`  
  A bracket, brace or quote is missing or extra near that line. VS Code highlights matching pairs when you click next to one.
- `NaN` appears in the table  
  A calculation used something that is not a number — often a subject that a student has no mark for.
- `785` where you expected `83`  
  A string was joined to a number. Use `Number()` on typed values.
- Nothing happens and there is no error  
  The script is not linked, the file was not saved, or the page was not reloaded.
- `Uncaught TypeError: render is not a function`  
  A variable has the same name as a function, or the function name is misspelt.

When there is no error but the answer is wrong, make the program tell you what it is doing. Add `console.log` lines, reload, and read the console:

```js
console.log("average of", student.name, "is", average);
```

Remove them when the problem is fixed. And use the console to test functions directly: `gradeFor(74)`, `averageOf(students[0])`, `positionOf(students[3])`.

## 3.14 The complete files

These are the files at the end of the chapter. `style.css` is the Chapter 2 file with the rules from section 3.10 added to the end.

### `web/results.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Form 4 Results, Term 1 2026 - Mwangaza Secondary School</title>
  <link rel="stylesheet" href="style.css">
  <script src="results.js" defer></script>
</head>
<body>
  <header class="site-header">
    <img src="logo.png" alt="Mwangaza Secondary School badge" width="56" height="56">
    <div>
      <h1>Mwangaza Secondary School</h1>
      <p>P.O. Box 1234, Dodoma</p>
    </div>
  </header>

  <main>
    <section>
      <h2>Form 4 - Term 1 examination, 2026</h2>
      <p>Class teacher: <strong>Mwl. Grace Mushi</strong></p>
      <ul class="stats">
        <li><span id="count">-</span> students</li>
        <li><span id="class-average">-</span> class average</li>
        <li><span id="top-student">-</span> top student</li>
      </ul>
    </section>

    <section>
      <h2>Results</h2>
      <div class="table-wrap">
        <table>
          <caption>Marks out of 100. Grades: A 75-100, B 65-74, C 45-64, D 30-44, F 0-29.</caption>
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">Student</th>
              <th scope="col">Sex</th>
              <th scope="col" class="num">Mathematics</th>
              <th scope="col" class="num">English</th>
              <th scope="col" class="num">Biology</th>
              <th scope="col" class="num">Average</th>
              <th scope="col">Grade</th>
              <th scope="col" class="num">Position</th>
            </tr>
          </thead>
          <tbody id="results-body"></tbody>
        </table>
      </div>
    </section>

    <section class="entry">
      <h2>Enter a mark</h2>
      <form id="mark-form" novalidate>
        <label for="student">Student</label>
        <select id="student" name="student"></select>

        <label for="subject">Subject</label>
        <select id="subject" name="subject"></select>

        <label for="mark">Mark (0 to 100)</label>
        <input id="mark" name="mark" type="number" min="0" max="100" required>

        <button type="submit">Save mark</button>
        <button type="button" id="reset" class="secondary">Restore original marks</button>
      </form>
      <p id="message" class="message" role="status"></p>
    </section>
  </main>

  <footer>
    <p>Mwangaza Secondary School results system. National results: <a href="https://www.necta.go.tz">necta.go.tz</a></p>
  </footer>
</body>
</html>
```

### `web/results.js`

```js
// Mwangaza Secondary School - results page
// Works out averages, grades and positions, and lets a teacher enter marks.

const SUBJECTS = ["Mathematics", "English", "Biology"];
const STORAGE_KEY = "mwangaza-form4-term1-2026";

// The marks from Chapter 2, now kept as data instead of typed into the table.
const startingStudents = [
  { name: "Amina Juma", sex: "F", marks: { Mathematics: 78, English: 85, Biology: 81 } },
  { name: "Baraka Mushi", sex: "M", marks: { Mathematics: 52, English: 61, Biology: 47 } },
  { name: "Neema Kileo", sex: "F", marks: { Mathematics: 91, English: 88, Biology: 94 } },
  { name: "Juma Hassan", sex: "M", marks: { Mathematics: 34, English: 49, Biology: 38 } },
  { name: "Rehema Mollel", sex: "F", marks: { Mathematics: 66, English: 72, Biology: 59 } },
];

let students = loadStudents();

// ---- Calculations ----

function gradeFor(mark) {
  if (mark >= 75) {
    return "A";
  } else if (mark >= 65) {
    return "B";
  } else if (mark >= 45) {
    return "C";
  } else if (mark >= 30) {
    return "D";
  } else {
    return "F";
  }
}

function roundTo1(number) {
  return Math.round(number * 10) / 10;
}

function averageOf(student) {
  let total = 0;
  for (const subject of SUBJECTS) {
    total = total + student.marks[subject];
  }
  return roundTo1(total / SUBJECTS.length);
}

// Position 1 has the highest average. Students with the same average share
// a position, and the next position is skipped: 1, 2, 2, 4.
function positionOf(student) {
  let higher = 0;
  for (const other of students) {
    if (averageOf(other) > averageOf(student)) {
      higher = higher + 1;
    }
  }
  return higher + 1;
}

// Returns what is wrong with a typed mark, or "" if it is fine.
function checkMark(text) {
  if (text.trim() === "") {
    return "Type a mark.";
  }
  const mark = Number(text);
  if (!Number.isInteger(mark)) {
    return "Marks are whole numbers, such as 67.";
  }
  if (mark < 0 || mark > 100) {
    return "A mark must be between 0 and 100.";
  }
  return "";
}

// ---- Saving in the browser ----

function loadStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("The saved marks could not be read, so the originals are used.", error);
    }
  }
  return structuredClone(startingStudents);
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// ---- Showing the results ----

const tableBody = document.querySelector("#results-body");

function addCell(row, text, className) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) {
    cell.className = className;
  }
  row.appendChild(cell);
  return cell;
}

function renderTable() {
  tableBody.textContent = "";

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const average = averageOf(student);
    const grade = gradeFor(average);
    const row = document.createElement("tr");

    addCell(row, i + 1);
    addCell(row, student.name);
    addCell(row, student.sex);
    for (const subject of SUBJECTS) {
      addCell(row, student.marks[subject], "num");
    }
    addCell(row, average.toFixed(1), "num");

    const badge = document.createElement("span");
    badge.className = "grade grade-" + grade.toLowerCase();
    badge.textContent = grade;
    addCell(row, "").appendChild(badge);

    addCell(row, positionOf(student), "num");
    tableBody.appendChild(row);
  }
}

function renderSummary() {
  let total = 0;
  let top = students[0];
  for (const student of students) {
    total = total + averageOf(student);
    if (averageOf(student) > averageOf(top)) {
      top = student;
    }
  }

  document.querySelector("#count").textContent = students.length;
  document.querySelector("#class-average").textContent = (total / students.length).toFixed(1);
  document.querySelector("#top-student").textContent = top.name;
}

function render() {
  renderTable();
  renderSummary();
}

// ---- Entering marks ----

const form = document.querySelector("#mark-form");
const studentSelect = document.querySelector("#student");
const subjectSelect = document.querySelector("#subject");
const markInput = document.querySelector("#mark");
const message = document.querySelector("#message");
const resetButton = document.querySelector("#reset");

// Fill the drop-down lists from the data, so they always match the table.
function fillChoices() {
  for (let i = 0; i < students.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = students[i].name;
    studentSelect.appendChild(option);
  }
  for (const subject of SUBJECTS) {
    const option = document.createElement("option");
    option.textContent = subject;
    subjectSelect.appendChild(option);
  }
}

function showMessage(text, kind) {
  message.textContent = text;
  message.className = "message " + kind;
}

markInput.addEventListener("input", function () {
  showMessage(checkMark(markInput.value), "error");
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const problem = checkMark(markInput.value);
  if (problem !== "") {
    showMessage(problem, "error");
    markInput.focus();
    return;
  }

  const student = students[Number(studentSelect.value)];
  const subject = subjectSelect.value;
  const mark = Number(markInput.value);

  student.marks[subject] = mark;
  saveStudents();
  render();

  showMessage(`Saved: ${student.name}, ${subject} ${mark}.`, "success");
  markInput.value = "";
});

resetButton.addEventListener("click", function () {
  if (confirm("Put back the original marks? Marks you entered will be lost.")) {
    localStorage.removeItem(STORAGE_KEY);
    students = structuredClone(startingStudents);
    render();
    showMessage("The original marks are back.", "success");
  }
});

// ---- Start ----

fillChoices();
render();
```

### Try it yourself

1. Add Kiswahili as a fourth subject: add it to `SUBJECTS`, give every student a Kiswahili mark in `startingStudents`, and add a heading cell to the table. Reload. If you see `NaN`, the page loaded the marks saved before Kiswahili existed — click **Restore original marks**. Explain why that fixes it.
2. Add a fourth number to the summary: how many students have an average of 45 or more.
3. Change `checkMark` so that a mark of exactly 0 asks "Was the student absent?" — while still allowing it to be saved.
4. Make the **Position** column show "1st", "2nd", "3rd" and "4th" instead of plain numbers. Hint: write a function that takes a number and returns a string.

## Key terms

| English | Kiswahili | Meaning |
|---|---|---|
| Programming language | Lugha ya programu | A language for giving a computer step-by-step instructions |
| Variable | Kigezo | A name that holds a value |
| Value | Thamani | A piece of data, such as a number or some text |
| String | Mfuatano wa herufi | Text, written between quotes |
| Function | Kitendakazi | A named set of steps that can be used again |
| Condition | Sharti | A question that is either true or false |
| Loop | Kitanzi | Code that repeats for each item or until something is true |
| Array | Safu | An ordered list of values |
| Object | Kitu | A group of named values |
| Event | Tukio | Something that happens on the page, such as a click |
| Error | Hitilafu | A problem that stops code from running as intended |
| Debugging | Kutatua hitilafu | Finding and fixing mistakes in code |

## Check your understanding

1. Why does the `script` tag need `defer` when it is placed in the `head`?
2. What is the difference between `const` and `let`? Why is `students` declared with `let`?
3. What does `"45" + 5` give, and why? How do you get `50`?
4. In `gradeFor`, what would go wrong if the `mark >= 30` test came before the `mark >= 75` test?
5. `SUBJECTS` is `["Mathematics", "English", "Biology"]`. What is `SUBJECTS[1]`, and what is `SUBJECTS.length`?
6. Averages are 91.0, 81.3, 81.3 and 65.7. Using the rule in `positionOf`, what position does each student get?
7. Why does the script use `textContent` rather than `innerHTML` to put names on the page?
8. What does `event.preventDefault()` stop in the submit handler?
9. A teacher enters marks on the school office computer. Can the head teacher see them on their own phone? Why or why not?
10. The console shows `Cannot read properties of null (reading 'addEventListener')`. Name two possible causes.

### Answers

1. Without `defer`, the script runs as soon as the browser reaches it — before the table and form further down exist — so `querySelector` would find nothing. `defer` waits until the whole page has been read.
2. A `const` name always refers to the same value; a `let` name can be given a new one. `students` uses `let` because the restore button replaces it with a fresh copy.
3. `"455"`, because when one side of `+` is a string, JavaScript joins the two as text. `Number("45") + 5` gives `50`.
4. Every mark of 30 or more would stop at that test and get a D, so no one could get an A, B or C.
5. `SUBJECTS[1]` is `"English"`, because counting starts at 0. `SUBJECTS.length` is `3`.
6. 91.0 is 1st. Both students with 81.3 have one student above them, so both are 2nd. 65.7 has three above, so it is 4th.
7. `textContent` always shows text as text. `innerHTML` would treat any HTML or script inside a name as real code, which an attacker could use.
8. The browser's normal behaviour for a form: sending it and reloading the page, which would lose what the script is doing.
9. No. `localStorage` belongs to one browser on one device. Sharing marks needs a database on a server, which is what Chapter 4 begins.
10. The id in `querySelector` does not match an id in the HTML, or the script ran before the page existed because `defer` is missing.
