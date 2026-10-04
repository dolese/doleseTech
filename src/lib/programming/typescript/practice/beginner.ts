import type { Practice } from "../../types";

export const beginner: Record<string, Practice> = {
  setup: {
    solution: {
      notes: [
        "Store each fact in a `const` with a type annotation, then join them into one sentence. Running `npx tsc --noEmit` after changing `age` to a string shows TypeScript catching the mistake before the program ever runs.",
      ],
      code: [
        {
          filename: "about.ts",
          lang: "ts",
          source: `
const name: string = "Amina";
const age: number = 17;
const school: string = "Azania Secondary";

console.log("My name is " + name + ", I am " + age + " years old and I study at " + school + ".");
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
npx tsx about.ts
# My name is Amina, I am 17 years old and I study at Azania Secondary.

# After changing the line to: const age: number = "twenty";
npx tsc --noEmit
# about.ts:2:7 - error TS2322: Type 'string' is not assignable to type 'number'.
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does TypeScript add on top of JavaScript?",
        options: ["A faster runtime", "A type system checked before the code runs", "A new browser", "A database"],
        answer: 1,
        explanation: "TypeScript is JavaScript plus types. The compiler checks the types, then the code runs as ordinary JavaScript.",
      },
      {
        question: "Which command runs a `.ts` file directly during development?",
        options: ["`node hello.ts`", "`npm hello.ts`", "`npx tsx hello.ts`", "`tsc --run hello.ts`"],
        answer: 2,
        explanation: "`tsx` runs TypeScript files directly. `tsc` type-checks and compiles; plain `node` expects JavaScript.",
      },
      {
        question: "What does `npx tsc --noEmit` do?",
        options: [
          "Deletes compiled files",
          "Runs the program without printing",
          "Installs TypeScript",
          "Type-checks the project without writing any output files",
        ],
        answer: 3,
        explanation: "`--noEmit` tells the compiler to only check types — a fast way to find errors.",
      },
      {
        question: "Why keep `\"strict\": true` in tsconfig.json?",
        options: [
          "It enables the strongest checks, catching the most bugs",
          "It makes programs run faster",
          "It is required to use npm",
          "It hides compiler errors",
        ],
        answer: 0,
        explanation: "Strict mode turns on checks such as `strictNullChecks` that catch many real bugs.",
      },
    ],
  },

  "variables-and-types": {
    solution: {
      notes: [
        "Use `reduce` (or a loop) to add the scores, divide by the array's length for the average, and store the result in a tuple whose two positions have different types.",
      ],
      code: [
        {
          filename: "scores.ts",
          lang: "ts",
          source: `
const scores: number[] = [78, 64, 91, 55, 82];

let total = 0;
for (const s of scores) total += s;
const average = total / scores.length;

const record: [string, number] = ["Amina", average];

console.log("Total:", total);                     // Total: 370
console.log("Average:", average.toFixed(1));     // Average: 74.0
console.log(record[0] + " averaged " + record[1]); // Amina averaged 74
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which declaration should you use for a value that never gets reassigned?",
        options: ["`var`", "`let`", "`const`", "`static`"],
        answer: 2,
        explanation: "`const` prevents reassignment and signals intent. Use `let` only when the value must change.",
      },
      {
        question: "What type does TypeScript infer for `let students = 420;`?",
        options: ["`number`", "`420`", "`any`", "`string`"],
        answer: 0,
        explanation: "A `let` variable is widened to `number`, so it can later hold other numbers.",
      },
      {
        question: "Why prefer `unknown` over `any` for data of uncertain shape?",
        options: [
          "`unknown` is faster at runtime",
          "`unknown` forces you to check the type before using the value",
          "`any` cannot hold objects",
          "There is no difference",
        ],
        answer: 1,
        explanation: "`any` switches checking off; `unknown` keeps you safe until you narrow it with checks such as `typeof`.",
      },
      {
        question: "What is `[string, number]`?",
        options: ["An array of strings or numbers", "A function type", "An object type", "A tuple: a string first, then a number"],
        answer: 3,
        explanation: "A tuple fixes the length and the type at each position.",
      },
    ],
  },

  functions: {
    solution: {
      notes: [
        "Each function annotates its parameters and return type. `describeArea` gives `units` a default value, so callers can leave it out. `toFixed(2)` formats the number to two decimal places.",
      ],
      code: [
        {
          filename: "areas.ts",
          lang: "ts",
          source: `
function areaOfRectangle(width: number, height: number): number {
  return width * height;
}

function areaOfCircle(radius: number): number {
  return Math.PI * radius * radius;
}

function describeArea(area: number, units: string = "cm"): string {
  return "Area: " + area.toFixed(2) + " " + units + "²";
}

console.log(describeArea(areaOfRectangle(3, 4)));      // Area: 12.00 cm²
console.log(describeArea(areaOfCircle(2), "m"));        // Area: 12.57 m²
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `?` after a parameter name mean, as in `title?: string`?",
        options: ["The parameter is optional", "The parameter can be any type", "The parameter is private", "The parameter is a question"],
        answer: 0,
        explanation: "An optional parameter may be left out; inside the function its type includes `undefined`.",
      },
      {
        question: "What is the return type of a function that returns nothing?",
        options: ["`null`", "`never`", "`void`", "`undefined[]`"],
        answer: 2,
        explanation: "`void` means the function doesn't return a useful value.",
      },
      {
        question: "Which is a valid arrow function that squares a number?",
        options: ["`(n) -> n * n`", "`const square = (n: number): number => n * n;`", "`function => n * n`", "`square(n) = n * n`"],
        answer: 1,
        explanation: "Arrow functions use `=>`; the parameter and return types can be annotated.",
      },
      {
        question: "What happens when you call `percentage(42)` if it is declared as `percentage(score: number, outOf: number = 100)`?",
        options: ["A compile error", "`outOf` is `undefined`", "It returns `NaN`", "`outOf` uses its default value of 100"],
        answer: 3,
        explanation: "A default value is used whenever the argument is not supplied.",
      },
    ],
  },

  "control-flow": {
    solution: {
      notes: [
        "Check the combined case (divisible by both 3 and 5, i.e. by 15) first — otherwise \"Fizz\" would win for 15. For counting passes, keep a counter and increase it inside the loop.",
      ],
      code: [
        {
          filename: "fizzbuzz.ts",
          lang: "ts",
          source: `
for (let n = 1; n <= 50; n++) {
  if (n % 15 === 0) console.log("FizzBuzz");
  else if (n % 3 === 0) console.log("Fizz");
  else if (n % 5 === 0) console.log("Buzz");
  else console.log(n);
}

const scores = [82, 25, 49, 30, 12, 67];
let passes = 0;
for (const score of scores) {
  if (score >= 30) passes++;
}
console.log("Passes: " + passes + " of " + scores.length);   // Passes: 4 of 6
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why should you use `===` instead of `==`?",
        options: [
          "`===` is shorter to type",
          "`===` compares without converting types, avoiding surprises like `\"5\" == 5`",
          "`==` doesn't work on numbers",
          "`===` is only for strings",
        ],
        answer: 1,
        explanation: "`==` converts types before comparing; `===` compares value and type exactly.",
      },
      {
        question: "Which loop is the natural choice for visiting every item of an array?",
        options: ["`for...of`", "`while (true)`", "`do...while`", "`switch`"],
        answer: 0,
        explanation: "`for...of` gives you each item directly, without managing an index.",
      },
      {
        question: "In FizzBuzz, why test `n % 15 === 0` first?",
        options: [
          "Because 15 is the largest number",
          "It runs faster",
          "Otherwise multiples of 15 would match the `% 3` test first and print only \"Fizz\"",
          "It is required by TypeScript",
        ],
        answer: 2,
        explanation: "`if / else if` stops at the first true condition, so the most specific case must come first.",
      },
      {
        question: "What does `scores[i] >= 30 ? \"pass\" : \"fail\"` evaluate to when the score is 25?",
        options: ["`\"pass\"`", "`true`", "`25`", "`\"fail\"`"],
        answer: 3,
        explanation: "The ternary returns the value after `:` when the condition is false.",
      },
    ],
  },

  "objects-and-interfaces": {
    solution: {
      notes: [
        "Describe the data with an interface first. Then `filter` + `map` gives the cheap product names, `reduce` adds up price × quantity, and a `reduce` that keeps the larger item finds the most expensive product.",
      ],
      code: [
        {
          filename: "products.ts",
          lang: "ts",
          source: `
interface Product {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

const products: Product[] = [
  { name: "Exercise book", price: 1500, quantity: 200, category: "Stationery" },
  { name: "Scientific calculator", price: 35000, quantity: 12 },
  { name: "Geometry set", price: 4500, quantity: 40, category: "Stationery" },
  { name: "School bag", price: 25000, quantity: 15, category: "Bags" },
];

const cheap = products.filter((p) => p.price < 5000).map((p) => p.name);
const stockValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
const mostExpensive = products.reduce((best, p) => (p.price > best.price ? p : best));

console.log(cheap);            // [ 'Exercise book', 'Geometry set' ]
console.log(stockValue);       // 1275000
console.log(mostExpensive.name); // Scientific calculator
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does a `readonly` property in an interface mean?",
        options: [
          "It can only be read from files",
          "It is hidden from `console.log`",
          "It cannot be changed after the object is created",
          "It is optional",
        ],
        answer: 2,
        explanation: "TypeScript reports an error if code tries to assign to a `readonly` property.",
      },
      {
        question: "Which array method returns only the items that pass a test?",
        options: ["`filter`", "`map`", "`reduce`", "`find`"],
        answer: 0,
        explanation: "`filter` keeps matching items; `map` transforms every item; `find` returns just the first match.",
      },
      {
        question: "What does `top?.name ?? \"No top student\"` do when `top` is `undefined`?",
        options: ["Throws an error", "Returns `undefined`", "Returns `\"undefined\"`", "Returns `\"No top student\"`"],
        answer: 3,
        explanation: "`?.` stops safely at `undefined`, and `??` then supplies the fallback.",
      },
      {
        question: "Do `map` and `filter` change the original array?",
        options: ["Yes, always", "No — they return new arrays", "Only `map` does", "Only for arrays of objects"],
        answer: 1,
        explanation: "They return new arrays and leave the original untouched, which makes code easier to reason about.",
      },
    ],
  },

  "modules-and-npm": {
    solution: {
      notes: [
        "Put the text helpers in their own module and `export` them. `main.ts` imports them, reads the file with `readFile`, and prints the results. A `count` script in package.json runs it with one command.",
      ],
      code: [
        {
          filename: "src/text.ts",
          lang: "ts",
          source: `
export function wordCount(text: string): number {
  return text.split(/\\s+/).filter(Boolean).length;
}

export function longestWord(text: string): string {
  return text
    .split(/\\s+/)
    .filter(Boolean)
    .reduce((longest, word) => (word.length > longest.length ? word : longest), "");
}
`,
        },
        {
          filename: "src/main.ts",
          lang: "ts",
          source: `
import { readFile, writeFile } from "node:fs/promises";
import { longestWord, wordCount } from "./text";

async function main(): Promise<void> {
  await writeFile("essay.txt", "Photosynthesis happens in the chloroplasts of green plants.");
  const text = await readFile("essay.txt", "utf8");
  console.log("Words:", wordCount(text));          // Words: 8
  console.log("Longest:", longestWord(text));      // Longest: Photosynthesis
}

main();
`,
        },
        {
          filename: "package.json",
          lang: "json",
          source: `
{
  "type": "module",
  "scripts": {
    "count": "tsx src/main.ts"
  }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What makes a value in one file available to other files?",
        options: ["Declaring it with `const`", "The `export` keyword", "Putting it in package.json", "Naming the file `index.ts`"],
        answer: 1,
        explanation: "Only exported values can be imported by other modules.",
      },
      {
        question: "What does the `node:` prefix in `import { readFile } from \"node:fs/promises\"` indicate?",
        options: [
          "The module must be installed from npm",
          "The module is written in TypeScript",
          "It is a built-in Node.js module",
          "It only works in the browser",
        ],
        answer: 2,
        explanation: "`node:` makes it explicit that the import is part of Node.js itself.",
      },
      {
        question: "What is the main benefit of npm `scripts`?",
        options: [
          "Everyone runs the project the same way, e.g. `npm run dev`",
          "They make code run faster",
          "They replace TypeScript",
          "They encrypt your code",
        ],
        answer: 0,
        explanation: "Scripts document and standardise common commands for the whole team.",
      },
      {
        question: "Which package.json setting enables modern ES modules in Node.js?",
        options: ["`\"modules\": true`", "`\"esm\": \"on\"`", "`\"strict\": true`", "`\"type\": \"module\"`"],
        answer: 3,
        explanation: "`\"type\": \"module\"` tells Node.js to treat `.js` files as ES modules.",
      },
    ],
  },
};
