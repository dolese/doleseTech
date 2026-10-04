import type { Practice } from "../../types";
import { datesNumbersIntl as datesNumbersIntlPractice } from "./more";

export const beginner: Record<string, Practice> = {
  setup: {
    solution: {
      notes: [
        "Add an empty `<h2>` with an id to the page, then fill it from the script. `toLocaleDateString` formats today's date in a readable way, and `document.title` reads the text of the page's `<title>`.",
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
    <title>Hello JavaScript</title>
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1 id="greeting">Hello!</h1>
    <h2 id="today"></h2>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const name = "Dolese";
const today = new Date();

document.querySelector("#greeting").textContent = \`Hello, \${name}!\`;
document.querySelector("#today").textContent = \`Today is \${today.toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})}\`;

console.log("Page title:", document.title);   // Page title: Hello JavaScript
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does the `defer` attribute on a `<script>` tag do?",
        options: [
          "Runs the script after the HTML has been parsed",
          "Loads the script only when the user clicks",
          "Runs the script twice",
          "Disables the script",
        ],
        answer: 0,
        explanation: "With `defer`, the elements your code looks for already exist when it runs.",
      },
      {
        question: "Which keyboard shortcut opens the browser's developer tools in most browsers?",
        options: ["Ctrl+S", "Alt+Tab", "F12", "Ctrl+P"],
        answer: 2,
        explanation: "F12 (or Ctrl+Shift+J / Cmd+Option+J for the console) opens DevTools.",
      },
      {
        question: "Where does `console.log(\"hi\")` print in a web page?",
        options: ["On the page itself", "In a pop-up", "In the HTML file", "In the browser's console (DevTools)"],
        answer: 3,
        explanation: "The console is for developers; use the DOM to show things to users.",
      },
      {
        question: "Why open pages through a local server rather than double-clicking the HTML file?",
        options: [
          "Servers make pages prettier",
          "Some features (like modules and fetch) don't work from `file://` pages",
          "Double-clicking deletes the file",
          "It's required for console.log",
        ],
        answer: 1,
        explanation: "Browsers restrict pages opened directly from disk for security reasons.",
      },
    ],
  },

  "variables-and-types": {
    solution: {
      notes: [
        "Form inputs and `prompt()` give you strings, so convert each with `Number()` before adding — otherwise `+` joins the text. `toFixed(2)` formats the average with two decimals.",
      ],
      code: [
        {
          filename: "scores.js",
          lang: "js",
          source: `
const typed = ["78", "64", "91"];          // what a user would type
const scores = typed.map(Number);          // [78, 64, 91]

const total = scores[0] + scores[1] + scores[2];
const average = total / scores.length;

console.log(typed[0] + typed[1]);          // "7864"  <- strings are joined, not added
console.log(\`Total: \${total}, average: \${average.toFixed(2)}\`);   // Total: 233, average: 77.67
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `\"10\" + 5` evaluate to in JavaScript?",
        options: ["15", "\"105\"", "An error", "NaN"],
        answer: 1,
        explanation: "With a string on either side, `+` joins text. Convert with `Number(\"10\")` first.",
      },
      {
        question: "Which comparison is `true`?",
        options: ["`\"5\" === 5`", "`null === undefined`", "`5 === 5`", "`\"a\" === \"A\"`"],
        answer: 2,
        explanation: "`===` compares value and type, with no conversions.",
      },
      {
        question: "What is the value of a variable declared with `let x;` before anything is assigned?",
        options: ["`undefined`", "`null`", "`0`", "An error"],
        answer: 0,
        explanation: "Declared-but-unassigned variables hold `undefined`.",
      },
      {
        question: "Which declaration should you avoid in modern JavaScript?",
        options: ["`const`", "`let`", "Arrow functions", "`var`"],
        answer: 3,
        explanation: "`var` has confusing function-level scoping; use `const` and `let`.",
      },
    ],
  },

  "control-flow": {
    solution: {
      notes: [
        "FizzBuzz checks 15 first so it isn't caught by the 3 or 5 tests. For the names, keep a separate counter so the numbering is 1, 2, 3 for the names that pass the filter, not their original positions.",
      ],
      code: [
        {
          filename: "loops.js",
          lang: "js",
          source: `
for (let n = 1; n <= 50; n++) {
  if (n % 15 === 0) console.log("FizzBuzz");
  else if (n % 3 === 0) console.log("Fizz");
  else if (n % 5 === 0) console.log("Buzz");
  else console.log(n);
}

const names = ["Amina", "Baraka", "Juma", "Rehema", "Ali", "Zawadi"];
let count = 0;
for (const name of names) {
  if (name.length > 5) {
    count++;
    console.log(\`\${count}. \${name}\`);
  }
}
// 1. Baraka
// 2. Rehema
// 3. Zawadi
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which of these values is truthy?",
        options: ["`0`", "`\"\"`", "`\"0\"`", "`null`"],
        answer: 2,
        explanation: "A non-empty string — even \"0\" — is truthy. The falsy values are false, 0, \"\", null, undefined and NaN.",
      },
      {
        question: "Which loop runs at least once, even if its condition is false from the start?",
        options: ["`while`", "`for`", "`for...of`", "`do...while`"],
        answer: 3,
        explanation: "`do...while` checks the condition after the body.",
      },
      {
        question: "What does `break` do inside a loop?",
        options: ["Exits the loop immediately", "Skips to the next round", "Pauses the program", "Restarts the loop"],
        answer: 0,
        explanation: "`continue` skips one round; `break` leaves the loop entirely.",
      },
      {
        question: "In a `switch`, what happens if a `case` has no `break` or `return`?",
        options: [
          "Nothing special",
          "Execution falls through into the next case",
          "A syntax error",
          "The default case runs first",
        ],
        answer: 1,
        explanation: "Fall-through is a classic bug source; end each case with `break` or `return`.",
      },
    ],
  },

  functions: {
    solution: {
      notes: [
        "Small single-purpose functions combine nicely: `applyToAll` maps each radius to an area, then to a description. The default `units = \"cm\"` means callers only pass units when they differ.",
      ],
      code: [
        {
          filename: "areas.js",
          lang: "js",
          source: `
const areaOfRectangle = (width, height) => width * height;
const areaOfCircle = (radius) => Math.PI * radius ** 2;
const describe = (area, units = "cm") => \`Area: \${area.toFixed(2)} \${units}²\`;

function applyToAll(values, fn) {
  const out = [];
  for (const v of values) out.push(fn(v));
  return out;
}

console.log(describe(areaOfRectangle(3, 4)));             // Area: 12.00 cm²
console.log(applyToAll([1, 2, 3], (r) => describe(areaOfCircle(r), "m")));
// [ 'Area: 3.14 m²', 'Area: 12.57 m²', 'Area: 28.27 m²' ]
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does a function return if it has no `return` statement?",
        options: ["`null`", "`0`", "`undefined`", "An empty string"],
        answer: 2,
        explanation: "Without `return`, the result is `undefined`.",
      },
      {
        question: "Which is a correct arrow function that doubles a number?",
        options: ["`const double = (n) => n * 2;`", "`const double = n -> n * 2;`", "`function => n * 2`", "`double(n) = n * 2`"],
        answer: 0,
        explanation: "Arrow functions use `=>`; one-expression bodies return automatically.",
      },
      {
        question: "A variable declared with `let` inside a function — where can it be used?",
        options: ["Anywhere in the program", "In every function", "Only in other files", "Only inside that function (its block)"],
        answer: 3,
        explanation: "`let` and `const` are block-scoped.",
      },
      {
        question: "What does it mean that functions are \"values\" in JavaScript?",
        options: [
          "They always return numbers",
          "They can be stored in variables and passed to other functions",
          "They can't take parameters",
          "They run automatically",
        ],
        answer: 1,
        explanation: "That's what makes callbacks like `map((n) => n * 2)` possible.",
      },
    ],
  },

  "arrays-and-objects": {
    solution: {
      notes: [
        "`filter` + `map` find the cheap names, `reduce` adds up price × quantity, a `reduce` that keeps the pricier item finds the most expensive one, and another `reduce` builds an object counting products per category.",
      ],
      code: [
        {
          filename: "products.js",
          lang: "js",
          source: `
const products = [
  { name: "Exercise book", price: 1500, quantity: 200, category: "Stationery" },
  { name: "Scientific calculator", price: 35000, quantity: 12, category: "Electronics" },
  { name: "Geometry set", price: 4500, quantity: 40, category: "Stationery" },
  { name: "School bag", price: 25000, quantity: 15, category: "Bags" },
];

const cheap = products.filter((p) => p.price < 5000).map((p) => p.name);
const stockValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
const mostExpensive = products.reduce((best, p) => (p.price > best.price ? p : best));
const perCategory = products.reduce((counts, p) => {
  counts[p.category] = (counts[p.category] ?? 0) + 1;
  return counts;
}, {});

console.log(cheap);                                  // [ 'Exercise book', 'Geometry set' ]
console.log(stockValue.toLocaleString("en-US"));     // 1,275,000
console.log(mostExpensive.name);                     // Scientific calculator
console.log(perCategory);                            // { Stationery: 2, Electronics: 1, Bags: 1 }
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which method returns the first item that matches a condition?",
        options: ["`filter`", "`map`", "`find`", "`some`"],
        answer: 2,
        explanation: "`find` returns one item (or `undefined`); `filter` returns all matches in an array.",
      },
      {
        question: "What does `const { name, score } = student;` do?",
        options: [
          "Copies `name` and `score` from the object into two variables",
          "Deletes those properties",
          "Creates a new object",
          "Checks the properties exist",
        ],
        answer: 0,
        explanation: "That's destructuring.",
      },
      {
        question: "Why copy with `[...students].sort(...)` instead of `students.sort(...)`?",
        options: [
          "Spread sorts faster",
          "`sort` doesn't work on arrays of objects",
          "It's required for numbers",
          "`sort` changes the original array; the copy keeps the original order intact",
        ],
        answer: 3,
        explanation: "`sort` sorts in place. `toSorted` is the modern non-mutating alternative.",
      },
      {
        question: "What does `{ ...student, score: 60 }` create?",
        options: [
          "An error — objects can't be spread",
          "A new object with all of student's properties, but score set to 60",
          "The same object with score changed",
          "An array",
        ],
        answer: 1,
        explanation: "Spread copies properties; later ones override earlier ones.",
      },
    ],
  },

  "dom-basics": {
    solution: {
      notes: [
        "One click handler, shared by all three buttons through `data-percent` attributes, reads the bill, checks it, and shows the tip and total. Using `type=\"number\"` on the input gives a numeric keyboard on phones.",
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
    <title>Tip calculator</title>
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1>Tip calculator</h1>
    <label>Bill (TSh) <input id="bill" type="number" min="0" /></label>
    <p>
      <button data-percent="5">5%</button>
      <button data-percent="10">10%</button>
      <button data-percent="15">15%</button>
    </p>
    <p id="result"></p>
  </body>
</html>
`,
        },
        {
          filename: "app.js",
          lang: "js",
          source: `
const billInput = document.querySelector("#bill");
const result = document.querySelector("#result");

for (const button of document.querySelectorAll("[data-percent]")) {
  button.addEventListener("click", () => {
    if (billInput.value === "") {
      result.textContent = "Please enter the bill amount first.";
      return;
    }
    const bill = Number(billInput.value);
    const percent = Number(button.dataset.percent);
    const tip = (bill * percent) / 100;
    result.textContent = \`Tip (\${percent}%): \${tip.toLocaleString("en-US")} TSh. Total: \${(bill + tip).toLocaleString("en-US")} TSh\`;
  });
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `document.querySelector(\".card\")` return?",
        options: [
          "All elements with class card",
          "The first element with class card (or null)",
          "The number of cards",
          "A new card element",
        ],
        answer: 1,
        explanation: "`querySelectorAll` returns all matches; `querySelector` returns the first.",
      },
      {
        question: "Which property safely sets an element's text?",
        options: ["`innerHTML`", "`value`", "`textContent`", "`src`"],
        answer: 2,
        explanation: "`textContent` treats everything as plain text, so no HTML or scripts can be injected.",
      },
      {
        question: "What does `element.classList.toggle(\"full\", condition)` do?",
        options: [
          "Adds the class when the condition is true and removes it when false",
          "Always adds the class",
          "Deletes the element",
          "Changes the element's id",
        ],
        answer: 0,
        explanation: "The second argument forces the class on or off.",
      },
      {
        question: "Which pattern does the lesson recommend for interactive pages?",
        options: [
          "Change the HTML file on every click",
          "Reload the page after each event",
          "Store everything in the URL",
          "Event → update your data → re-render the page from the data",
        ],
        answer: 3,
        explanation: "Keeping the page in sync with one source of data avoids confusing bugs.",
      },
    ],
  },
  "dates-numbers-and-intl": datesNumbersIntlPractice,
};
