import type { LevelTrack } from "../types";

export const beginner: LevelTrack = {
  intro:
    "Start from zero: install Node.js, write and run your first TypeScript program, and learn the building blocks every program uses — values, types, functions, decisions, loops, objects and modules.",
  outcomes: [
    "Set up a Node.js + TypeScript project and run .ts files",
    "Use variables, primitive types, arrays and objects with type annotations",
    "Write functions, conditionals and loops to solve small problems",
    "Split code into modules and use npm packages and scripts",
  ],
  lessons: [
    {
      slug: "setup",
      title: "Setting up Node.js & TypeScript",
      summary: "Install the tools, create a project and run your first program.",
      body: [
        "Node.js is a runtime that lets JavaScript run outside the browser — on servers, laptops and command-line tools. TypeScript is JavaScript plus a type system: you write `.ts` files, and the TypeScript compiler checks your types before the code runs, catching many bugs early.",
        "Install the current LTS (long-term support) version of Node.js from nodejs.org. It comes with `npm`, the package manager. Check the install with `node -v` and `npm -v`.",
        "In a new folder, create a project with `npm init -y`, then install TypeScript, `tsx` (a fast runner for .ts files) and the Node.js type definitions as development dependencies. Then add the `tsconfig.json` below: it controls how the type checker works. It tells TypeScript to use the Node.js type definitions and to be `strict` — keep that on.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
mkdir hello-ts && cd hello-ts
npm init -y
npm install --save-dev typescript tsx @types/node
`,
        },
        {
          filename: "tsconfig.json",
          lang: "json",
          source: `
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "moduleDetection": "force",
    "types": ["node"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  }
}
`,
        },
        {
          filename: "hello.ts",
          lang: "ts",
          source: `
const name: string = "Dolese";
const year: number = new Date().getFullYear();

console.log("Hello, " + name + "! Welcome to TypeScript in " + year + ".");
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
npx tsx hello.ts      # run the file directly
npx tsc --noEmit      # type-check the whole project without running it
`,
        },
      ],
      keyPoints: [
        "Node.js runs JavaScript; TypeScript adds types that are checked before running.",
        "`tsx` runs .ts files directly; `tsc` type-checks and compiles them.",
        "Always keep `\"strict\": true` in tsconfig.json — it catches the most bugs.",
      ],
      exercise:
        "Create `about.ts` that stores your name, age and school in variables and prints one sentence about you. Run it with `npx tsx about.ts`, then change `age` to a string like \"twenty\" while it is annotated as `number` and see the error `tsc --noEmit` gives.",
    },
    {
      slug: "variables-and-types",
      title: "Variables & Basic Types",
      summary: "let vs const, primitive types, type inference, arrays and any vs unknown.",
      body: [
        "Use `const` for values that never get reassigned and `let` for values that change. Avoid `var` — it has confusing scoping rules.",
        "The basic (primitive) types are `string`, `number` (integers and decimals), `boolean`, `null` and `undefined`. You can annotate a variable with `: type`, but TypeScript usually infers the type from the value, so annotations are mostly needed for function parameters and empty values.",
        "Arrays are written `number[]` or `Array<number>`. A tuple like `[string, number]` is a fixed-length array where each position has its own type.",
        "`any` switches type checking off — avoid it. When you truly don't know a value's type (for example, parsed JSON), use `unknown`, which forces you to check the type before using it.",
      ],
      code: [
        {
          filename: "types.ts",
          lang: "ts",
          source: `
const school = "Azania Secondary"; // inferred as string
let students = 420;                 // inferred as number
students = students + 15;           // OK: let can change

const isOpen: boolean = true;
const scores: number[] = [78, 64, 91];
const subjects: string[] = ["Maths", "Physics"];
const pair: [string, number] = ["Biology", 85]; // tuple

let nickname: string | undefined; // no value yet
nickname = "Doli";

const raw: unknown = JSON.parse('{"marks": 72}');
if (typeof raw === "object" && raw !== null && "marks" in raw) {
  console.log("Parsed:", raw.marks);
}

console.log(school, students, isOpen, scores, subjects, pair, nickname);
`,
        },
      ],
      keyPoints: [
        "Prefer `const`; use `let` only when a value must change.",
        "Let TypeScript infer types where it can; annotate parameters and empty values.",
        "Use `unknown` instead of `any`, then narrow it with checks like `typeof`.",
      ],
      exercise:
        "Create an array of five test scores, then compute and print the total and average. Store a student's name and average together in a tuple `[string, number]`.",
    },
    {
      slug: "functions",
      title: "Functions",
      summary: "Parameters, return types, optional and default values, arrow functions.",
      body: [
        "A function groups steps under a name so you can reuse them. In TypeScript you annotate each parameter's type and, ideally, the return type — this documents intent and lets the compiler check every call.",
        "Mark a parameter optional with `?`, or give it a default value with `=`. A function that returns nothing has return type `void`.",
        "Arrow functions (`(a, b) => a + b`) are a shorter syntax, commonly used for callbacks passed to other functions such as `map` and `filter`.",
      ],
      code: [
        {
          filename: "functions.ts",
          lang: "ts",
          source: `
function add(a: number, b: number): number {
  return a + b;
}

function greet(name: string, title?: string): string {
  return title ? "Hello, " + title + " " + name : "Hello, " + name;
}

function percentage(score: number, outOf: number = 100): number {
  return Math.round((score / outOf) * 100);
}

const square = (n: number): number => n * n;

function logResult(label: string, value: number): void {
  console.log(label + ": " + value);
}

logResult("add", add(2, 3));
logResult("percentage", percentage(42, 50));
logResult("square", square(9));
console.log(greet("Amina"), "|", greet("Juma", "Mr."));
`,
        },
      ],
      keyPoints: [
        "Annotate every parameter; annotate return types on exported/public functions.",
        "`?` makes a parameter optional; `= value` provides a default.",
        "Arrow functions are ideal for short callbacks.",
      ],
      exercise:
        "Write `areaOfRectangle(width, height)` and `areaOfCircle(radius)` functions with proper types. Add an optional `units` parameter (default \"cm\") to a `describeArea` function that returns a string like \"Area: 12 cm²\".",
    },
    {
      slug: "control-flow",
      title: "Decisions & Loops",
      summary: "if/else, switch, comparison operators, for, for...of and while loops.",
      body: [
        "Programs make decisions with `if` / `else if` / `else`. Always use strict equality `===` and `!==`, which compare without converting types.",
        "`switch` is tidy when one value is compared against many fixed options. The ternary operator `condition ? a : b` picks between two values in one expression.",
        "Loops repeat work. Use `for...of` to walk through the items of an array, a classic `for` loop when you need the index, and `while` when you repeat until a condition changes.",
      ],
      code: [
        {
          filename: "grades.ts",
          lang: "ts",
          source: `
function gradeFor(score: number): string {
  if (score >= 75) return "A";
  else if (score >= 65) return "B";
  else if (score >= 45) return "C";
  else if (score >= 30) return "D";
  return "F";
}

function remarkFor(grade: string): string {
  switch (grade) {
    case "A":
      return "Excellent";
    case "B":
      return "Very good";
    case "C":
      return "Good";
    case "D":
      return "Satisfactory";
    default:
      return "Fail";
  }
}

const scores = [82, 67, 49, 31, 18];

for (const score of scores) {
  const grade = gradeFor(score);
  console.log(score + " -> " + grade + " (" + remarkFor(grade) + ")");
}

for (let i = 0; i < scores.length; i++) {
  const status = scores[i] >= 30 ? "pass" : "fail";
  console.log("Student " + (i + 1) + ": " + status);
}

let countdown = 3;
while (countdown > 0) {
  console.log("Starting in " + countdown + "...");
  countdown--;
}
`,
        },
      ],
      keyPoints: [
        "Use `===` / `!==`, never `==` / `!=`.",
        "`for...of` for items, indexed `for` when you need positions, `while` for open-ended repetition.",
        "Return early from functions to keep `if` chains flat and readable.",
      ],
      exercise:
        "Write a FizzBuzz program for 1–50: print \"Fizz\" for multiples of 3, \"Buzz\" for multiples of 5, \"FizzBuzz\" for both, otherwise the number. Then count how many scores in an array are passes (≥ 30) using a loop.",
    },
    {
      slug: "objects-and-interfaces",
      title: "Objects, Interfaces & Array Methods",
      summary: "Describe data with interfaces, then transform it with map, filter and reduce.",
      body: [
        "Real programs work with structured data — a student, an order, a product. An `interface` (or a `type` alias) describes the shape of an object: which properties it has and their types. Mark properties `?` when optional and `readonly` when they must not change.",
        "Arrays of objects are processed with array methods instead of manual loops: `filter` keeps items that match a test, `map` transforms each item, `find` returns the first match, and `reduce` combines all items into one value (such as a total).",
        "These methods never change the original array — they return new values, which makes code easier to reason about.",
      ],
      code: [
        {
          filename: "students.ts",
          lang: "ts",
          source: `
interface Student {
  readonly id: number;
  name: string;
  form: number;
  score: number;
  email?: string;
}

const students: Student[] = [
  { id: 1, name: "Amina", form: 4, score: 88 },
  { id: 2, name: "Baraka", form: 3, score: 54, email: "baraka@example.com" },
  { id: 3, name: "Neema", form: 4, score: 71 },
];

const formFour = students.filter((s) => s.form === 4);
const names = formFour.map((s) => s.name.toUpperCase());
const top = students.find((s) => s.score >= 85);
const total = students.reduce((sum, s) => sum + s.score, 0);
const average = total / students.length;

console.log(names);                       // [ 'AMINA', 'NEEMA' ]
console.log(top?.name ?? "No top student");
console.log("Average:", average.toFixed(1));

type Summary = { count: number; average: number };
const summary: Summary = { count: students.length, average };
console.log(summary);
`,
        },
      ],
      keyPoints: [
        "Describe data shapes with `interface` or `type` before writing logic.",
        "`filter`, `map`, `find`, `reduce` replace most manual loops.",
        "`?.` safely reads from a value that may be undefined; `??` supplies a fallback.",
      ],
      exercise:
        "Define a `Product` interface (name, price, quantity, optional category). From an array of products compute: the names of products under 5,000 TSh, the total stock value (price × quantity), and the most expensive product.",
    },
    {
      slug: "modules-and-npm",
      title: "Modules, Node.js Built-ins & npm Scripts",
      summary: "Split code across files, read files with node:fs and automate tasks with npm scripts.",
      body: [
        "As programs grow, split them into modules: each file `export`s what other files may use, and `import`s what it needs. Set `\"type\": \"module\"` in package.json to use modern ES modules in Node.js.",
        "Node.js ships built-in modules for files (`node:fs/promises`), paths (`node:path`), operating-system info and more. The `node:` prefix makes it clear the import is built-in, not from npm.",
        "Add `scripts` to package.json so everyone on the team runs the project the same way: `npm run dev`, `npm run typecheck`, `npm start`.",
      ],
      code: [
        {
          filename: "src/math.ts",
          lang: "ts",
          source: `
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export const PASS_MARK = 30;
`,
        },
        {
          filename: "src/main.ts",
          lang: "ts",
          source: `
import { readFile, writeFile } from "node:fs/promises";
import { average, PASS_MARK } from "./math";

async function main(): Promise<void> {
  await writeFile("scores.txt", "78\\n64\\n25\\n91\\n");
  const text = await readFile("scores.txt", "utf8");
  const scores = text.split("\\n").filter(Boolean).map(Number);

  console.log("Average:", average(scores).toFixed(1));
  console.log("Passed:", scores.filter((s) => s >= PASS_MARK).length);
}

main();
`,
        },
        {
          filename: "package.json",
          lang: "json",
          source: `
{
  "name": "hello-ts",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "typecheck": "tsc --noEmit",
    "start": "tsx src/main.ts"
  }
}
`,
        },
      ],
      keyPoints: [
        "One responsibility per module; `export` only what others need.",
        "Use `node:`-prefixed imports for Node.js built-ins.",
        "npm scripts document and standardise how a project is run.",
      ],
      exercise:
        "Create `src/text.ts` exporting `wordCount(text)` and `longestWord(text)`. In `src/main.ts`, read a .txt file with `readFile` and print both results. Add a `count` script to package.json that runs it.",
    },
  ],
};
