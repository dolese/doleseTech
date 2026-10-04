import type { LevelTrack } from "../types";

export const beginner: LevelTrack = {
  intro:
    "Start from zero with the language of the web: run JavaScript in the browser, learn values, decisions, loops, functions, arrays and objects, and finish by making a web page respond to clicks.",
  outcomes: [
    "Run JavaScript in the browser console, in a web page and with Node.js",
    "Use variables, strings, numbers, booleans and template literals correctly",
    "Write conditions, loops and functions; work with arrays and objects",
    "Select page elements, change them and react to clicks",
  ],
  lessons: [
    {
      slug: "setup",
      title: "Running JavaScript",
      summary: "The browser console, adding a script to a web page, and running files with Node.js.",
      body: [
        "JavaScript is the programming language of the web: every browser runs it, and it makes pages interactive. With Node.js it also runs on servers and your computer (see the TypeScript track for that side).",
        "The fastest way to start is the browser console: open any page, press F12 (or Ctrl+Shift+J / Cmd+Option+J) and type `2 + 3`. `console.log()` prints values there.",
        "For real projects, put your code in a `.js` file and load it from an HTML page with `<script src=\"app.js\" defer></script>`. `defer` runs the script after the page's HTML has loaded. Use a code editor such as VS Code, and open the page through a small local server (the Live Server extension, or `npx serve`).",
      ],
      code: [
        {
          filename: "index.html",
          lang: "html",
          source: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello JavaScript</title>
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1 id="greeting">Hello!</h1>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const name = "Dolese";
const year = new Date().getFullYear();

console.log("Script loaded");
document.querySelector("#greeting").textContent = \`Hello, \${name}! Welcome to JavaScript in \${year}.\`;
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
npx serve .          # open the printed address, e.g. http://localhost:3000
node hello.js        # or run a plain .js file with Node.js
`,
        },
      ],
      keyPoints: [
        "The browser console (F12) is your playground and your first debugging tool.",
        "Load scripts with `<script src=\"...\" defer>` so the HTML exists before your code runs.",
        "Serve pages from a local server rather than double-clicking the HTML file.",
      ],
      exercise:
        "Create `index.html` and `app.js` as above. Change the script so it also adds today's date in a second heading, and log the page title (`document.title`) to the console.",
    },
    {
      slug: "variables-and-types",
      title: "Variables, Types & Strings",
      summary: "let and const, numbers, strings, booleans, null and undefined, template literals, and === vs ==.",
      body: [
        "Declare variables with `const` (cannot be reassigned) or `let` (can change). Prefer `const`; never use the old `var`.",
        "The basic types are `number` (integers and decimals together), `string`, `boolean`, `undefined` (no value assigned yet) and `null` (deliberately empty). `typeof` tells you a value's type.",
        "Template literals use backticks and `${...}` to insert values into text. Always compare with `===` and `!==`: the loose `==` converts types first and gives surprising results such as `\"5\" == 5` being true. Convert text to numbers explicitly with `Number()`.",
      ],
      code: [
        {
          filename: "basics.js",
          lang: "js",
          source: `
const school = "Azania Secondary";
let students = 420;
students += 15;

const fee = 150000.5;
const isOpen = true;
let nickname;              // undefined
const guardian = null;     // deliberately empty

console.log(typeof school, typeof students, typeof isOpen, typeof nickname);

const name = "  amina juma  ";
const clean = name.trim().toUpperCase();
console.log(clean, clean.length, clean.split(" "));

const average = (78 + 64 + 91) / 3;
console.log(\`\${school}: \${students} students, average \${average.toFixed(1)}\`);

console.log("5" == 5, "5" === 5);      // true false  ->  always use ===
console.log("10" + 5, Number("10") + 5); // "105" 15  ->  convert text first
console.log(0.1 + 0.2);                  // 0.30000000000000004 (floating point!)
console.log(fee.toLocaleString("en-US"), guardian ?? "no guardian listed");
`,
        },
      ],
      keyPoints: [
        "`const` by default, `let` when a value changes, never `var`.",
        "Always use `===` / `!==`; convert strings with `Number()` before arithmetic.",
        "Template literals — backticks with `${value}` inside — are the clearest way to build text.",
      ],
      exercise:
        "In the console or a file, store three test scores as strings (as if typed by a user), convert them to numbers, and print the total and the average to two decimal places using a template literal.",
    },
    {
      slug: "control-flow",
      title: "Decisions & Loops",
      summary: "if / else, switch, the ternary operator, truthy and falsy values, for, for...of and while.",
      body: [
        "`if`, `else if` and `else` choose what runs. Combine conditions with `&&` (and), `||` (or) and `!` (not). The ternary `condition ? a : b` picks one of two values.",
        "JavaScript treats some values as \"falsy\" in conditions: `false`, `0`, `\"\"`, `null`, `undefined` and `NaN`. Everything else is truthy — so `if (name)` checks that a name was given.",
        "Use `for...of` to loop over the items of an array or string, a classic `for` loop when you need a counter, and `while` when repeating until something changes.",
      ],
      code: [
        {
          filename: "grades.js",
          lang: "js",
          source: `
function gradeFor(score) {
  if (score >= 75) return "A";
  else if (score >= 65) return "B";
  else if (score >= 45) return "C";
  else if (score >= 30) return "D";
  return "F";
}

function remarkFor(grade) {
  switch (grade) {
    case "A": return "Excellent";
    case "B": return "Very good";
    case "C": return "Good";
    case "D": return "Satisfactory";
    default: return "Fail";
  }
}

const scores = [82, 67, 49, 31, 18];

for (const score of scores) {
  const grade = gradeFor(score);
  console.log(\`\${score} -> \${grade} (\${remarkFor(grade)})\`);
}

for (let i = 0; i < scores.length; i++) {
  console.log(\`Student \${i + 1}: \${scores[i] >= 30 ? "pass" : "fail"}\`);
}

const typedName = "";
console.log(typedName ? \`Hello \${typedName}\` : "Please enter your name");

let countdown = 3;
while (countdown > 0) {
  console.log(\`Starting in \${countdown}...\`);
  countdown--;
}
`,
        },
      ],
      keyPoints: [
        "`if / else if / else` for decisions; `switch` for one value against many options.",
        "Know the falsy values: `false`, `0`, `\"\"`, `null`, `undefined`, `NaN`.",
        "`for...of` for items, counted `for` for positions, `while` for open-ended repetition.",
      ],
      exercise:
        "Write FizzBuzz for 1–50. Then loop over an array of student names and print only the names longer than five letters, numbered from 1.",
    },
    {
      slug: "functions",
      title: "Functions & Scope",
      summary: "Function declarations, arrow functions, parameters and defaults, return values and scope.",
      body: [
        "Functions package steps under a name. Declare them with `function name(params) { ... }` or as arrow functions: `const square = (n) => n * n`. Arrow functions are short and are the usual choice for callbacks.",
        "Parameters can have defaults (`outOf = 100`). A function without `return` gives back `undefined`. Functions are values: you can store them in variables and pass them to other functions.",
        "Scope decides where a variable can be used. Variables declared with `let`/`const` inside `{ }` exist only inside those braces. Keep variables in the smallest scope that works — it prevents accidental changes from elsewhere.",
      ],
      code: [
        {
          filename: "functions.js",
          lang: "js",
          source: `
function percentage(score, outOf = 100) {
  return Math.round((score / outOf) * 100);
}

const greet = (name, title) => (title ? \`Hello, \${title} \${name}\` : \`Hello, \${name}\`);

function applyToAll(values, fn) {          // a function that takes a function
  const out = [];
  for (const v of values) out.push(fn(v));
  return out;
}

console.log(percentage(42, 50));          // 84
console.log(greet("Amina"), "|", greet("Juma", "Mr."));
console.log(applyToAll([1, 2, 3], (n) => n * 10));   // [10, 20, 30]

const passMark = 30;                       // outer scope
function countPasses(scores) {
  let passes = 0;                          // only exists inside this function
  for (const s of scores) {
    if (s >= passMark) passes++;
  }
  return passes;
}
console.log(countPasses([82, 25, 49, 12]));   // 2
console.log(typeof passes);                   // "undefined": not visible out here
`,
        },
      ],
      keyPoints: [
        "Arrow functions are compact and ideal for callbacks.",
        "Default parameters replace manual \"if missing\" checks.",
        "Declare variables in the smallest scope that works.",
      ],
      exercise:
        "Write `areaOfRectangle(width, height)` and `areaOfCircle(radius)`. Then write `describe(area, units = \"cm\")` returning \"Area: 12.00 cm²\", and use `applyToAll` to describe a list of radii.",
    },
    {
      slug: "arrays-and-objects",
      title: "Arrays & Objects",
      summary: "Store data in arrays and objects; transform it with map, filter, find and reduce; destructuring and spread.",
      body: [
        "An array is an ordered list: `[78, 64, 91]`. An object groups named values: `{ name: \"Amina\", score: 88 }`. An array of objects is the everyday way to hold records, such as students or products.",
        "Array methods replace most manual loops: `filter` keeps matching items, `map` transforms each item, `find` returns the first match, `some`/`every` test conditions, `reduce` combines items into one value, and `sort` orders them (copy first with `[...arr]` or use `toSorted`).",
        "Destructuring pulls values out (`const { name, score } = student`), and the spread syntax `...` copies or merges arrays and objects without changing the originals.",
      ],
      code: [
        {
          filename: "students.js",
          lang: "js",
          source: `
const students = [
  { id: 1, name: "Amina", form: 4, score: 88 },
  { id: 2, name: "Baraka", form: 3, score: 54 },
  { id: 3, name: "Neema", form: 4, score: 71 },
];

const formFour = students.filter((s) => s.form === 4).map((s) => s.name);
const top = students.find((s) => s.score >= 85);
const total = students.reduce((sum, s) => sum + s.score, 0);
const ranked = [...students].sort((a, b) => b.score - a.score);

console.log(formFour);                         // [ 'Amina', 'Neema' ]
console.log(top.name, (total / students.length).toFixed(1));
console.log(ranked.map((s) => s.name).join(" > "));
console.log(students.some((s) => s.score < 30), students.every((s) => s.form >= 3));

const { name, score } = students[0];           // destructuring
console.log(\`\${name} scored \${score}\`);

const updated = { ...students[1], score: 60 };  // copy with one change
console.log(updated, students[1].score);        // original still 54

const allScores = [...students.map((s) => s.score), 95];
console.log(Math.max(...allScores));            // 95
console.log(Object.keys(students[0]), Object.entries({ a: 1, b: 2 }));
`,
        },
      ],
      keyPoints: [
        "Arrays hold ordered lists; objects hold named properties.",
        "`filter`, `map`, `find`, `reduce` cover most data processing.",
        "Spread (`...`) copies instead of changing the original — safer code.",
      ],
      exercise:
        "Given an array of products (name, price, quantity, category), produce: the names under 5,000 TSh, the total stock value, the most expensive product, and an object counting products per category (hint: `reduce`).",
    },
    {
      slug: "dom-basics",
      title: "Your First Interactive Page",
      summary: "Select elements, change text and styles, create elements and respond to clicks.",
      body: [
        "The DOM (Document Object Model) is the browser's live model of your HTML page. JavaScript reads and changes it: `document.querySelector(\".css-selector\")` finds the first matching element and `querySelectorAll` finds all of them.",
        "Change what users see with `textContent` (text), `classList.add/remove/toggle` (CSS classes) and attributes such as `disabled`. Create new elements with `document.createElement` and add them with `append`.",
        "`element.addEventListener(\"click\", handler)` runs your function whenever the user clicks. Most interactive pages follow this pattern: listen for an event → update data → update the page.",
      ],
      code: [
        {
          filename: "index.html",
          lang: "html",
          source: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Attendance counter</title>
    <style>
      .full { color: #b5541e; font-weight: bold; }
    </style>
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1>Class attendance</h1>
    <p>Present: <span id="count">0</span> / 5</p>
    <button id="add">Mark present</button>
    <button id="reset">Reset</button>
    <ul id="log"></ul>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const LIMIT = 5;
let present = 0;

const countEl = document.querySelector("#count");
const addBtn = document.querySelector("#add");
const resetBtn = document.querySelector("#reset");
const log = document.querySelector("#log");

function render() {
  countEl.textContent = present;
  countEl.classList.toggle("full", present === LIMIT);
  addBtn.disabled = present === LIMIT;
}

addBtn.addEventListener("click", () => {
  present++;
  const item = document.createElement("li");
  item.textContent = \`Student \${present} arrived at \${new Date().toLocaleTimeString()}\`;
  log.append(item);
  render();
});

resetBtn.addEventListener("click", () => {
  present = 0;
  log.replaceChildren();          // remove all list items
  render();
});

render();
`,
        },
      ],
      keyPoints: [
        "`querySelector` finds elements with CSS selectors.",
        "Use `textContent` for text and `classList` for styling changes.",
        "Pattern: event → update your data → re-render the page from the data.",
      ],
      exercise:
        "Build a \"tip calculator\" page: an input for the bill amount, buttons for 5%, 10% and 15%, and a paragraph that shows the tip and total when a button is clicked. Show a message if the input is empty.",
    },
  ],
};
