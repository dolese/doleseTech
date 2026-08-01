/**
 * DOLESE AI Exams Composer — Phase 1 core.
 * Types, options, the exam JSON schema, and the prompt builder used by the
 * /api/exams/generate route and the /exams UI. Tanzania (TIE/NECTA) oriented.
 */
import { z } from "zod";
import { blueprintPromptBlock, examStructureGoverned } from "./examBlueprints";

export const EXAM_TYPES = [
  "Quiz",
  "Weekly Test",
  "Monthly Test",
  "Midterm Test",
  "Terminal Exam",
  "Mock Exam",
  "Pre-National Exam",
  "Final Examination",
  "Practice Paper",
  "Revision Paper",
] as const;

export const QUESTION_FORMATS = [
  "Multiple Choice",
  "True/False",
  "Matching",
  "Fill in the Blanks",
  "Short Answer",
  "Structured",
  "Essay",
] as const;

export const DIFFICULTIES = ["Very Easy", "Easy", "Medium", "Difficult", "Very Difficult", "Balanced"] as const;
export const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const;
export const LANGUAGES = ["English", "Kiswahili"] as const;
export const DURATIONS = [30, 45, 60, 90, 120, 150, 180] as const;

export type Language = (typeof LANGUAGES)[number];

export interface ExamConfig {
  subject: string;
  level: string; // O-Level / A-Level
  form: string; // Form I..VI
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  topics: string[];
  formats: string[];
  difficulty: string;
  language: Language;
  school?: string;
}

// ── Figure spec (controlled diagram the model can attach) ───────
export const figureSchema = z.object({
  type: z.enum(["numberline", "barchart", "coordinates", "table"]),
  caption: z.string().optional().default(""),
  // number line
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  marks: z.array(z.object({ value: z.number(), label: z.string().optional() })).optional(),
  // bar chart (labels + values)
  labels: z.array(z.string()).optional(),
  values: z.array(z.number()).optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
  // coordinate plane
  xMin: z.number().optional(),
  xMax: z.number().optional(),
  yMin: z.number().optional(),
  yMax: z.number().optional(),
  points: z.array(z.object({ x: z.number(), y: z.number(), label: z.string().optional() })).optional(),
  segments: z.array(z.object({ x1: z.number(), y1: z.number(), x2: z.number(), y2: z.number(), label: z.string().optional() })).optional(),
  // data table
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
});
export type Figure = z.infer<typeof figureSchema>;

// ── Exam schema (what the model must return) ────────────────────
export const examQuestionSchema = z.object({
  number: z.string(),
  type: z.string(),
  marks: z.number(),
  bloom: z.string().optional().default("Understand"),
  difficulty: z.string().optional().default("Medium"),
  text: z.string(),
  options: z.array(z.string()).optional(),
  figure: figureSchema.optional(),
  answer: z.string(), // model answer / marking scheme
});

export const examSectionSchema = z.object({
  name: z.string(),
  instructions: z.string().optional().default(""),
  marks: z.number().optional().default(0),
  /** For optional sections: how many of the printed questions a candidate answers.
   *  Omitted (or ≥ question count) means every question is compulsory. */
  choose: z.number().int().positive().optional(),
  questions: z.array(examQuestionSchema),
});

export const examSchema = z.object({
  title: z.string(),
  subject: z.string(),
  level: z.string().optional().default(""),
  form: z.string().optional().default(""),
  examType: z.string().optional().default(""),
  durationMinutes: z.number().optional().default(0),
  totalMarks: z.number().optional().default(0),
  language: z.string().optional().default("English"),
  instructions: z.array(z.string()).optional().default([]),
  sections: z.array(examSectionSchema),
});

export type Exam = z.infer<typeof examSchema>;
export type ExamQuestion = z.infer<typeof examQuestionSchema>;
export type ExamSection = z.infer<typeof examSectionSchema>;

// ── Effective marks (choice-aware) ──────────────────────────────────
// A section where candidates choose a subset of questions ("answer any two").
const CHOICE_RE = /\b(any|choose|either|optional|attempt\s+(?:any|only)|chagua|jibu\s+maswali)\b/i;

/** Sum of every printed question's marks in a section. */
export function sectionPrintedMarks(s: ExamSection): number {
  return s.questions.reduce((n, q) => n + (q.marks || 0), 0);
}

/** How many questions a candidate answers in a section (choose, else all). */
export function sectionAnswerCount(s: ExamSection): number {
  return s.choose && s.choose > 0 && s.choose < s.questions.length ? s.choose : s.questions.length;
}

/**
 * Marks a candidate can actually earn in a section. For an optional section
 * ("answer any two of four") this is the best `choose` questions, not the sum of
 * all printed questions — the number that belongs on the cover and in the total.
 */
export function sectionEffectiveMarks(s: ExamSection): number {
  const marks = s.questions.map((q) => q.marks || 0);
  const n = sectionAnswerCount(s);
  if (n < marks.length) {
    return [...marks].sort((a, b) => b - a).slice(0, n).reduce((a, b) => a + b, 0);
  }
  // No explicit choose, but the wording implies a choice and marks were declared
  // below the printed sum → trust the declared (legacy papers without `choose`).
  const printed = marks.reduce((a, b) => a + b, 0);
  if (CHOICE_RE.test(s.instructions || "") && s.marks && s.marks < printed) return s.marks;
  return printed;
}

/** The marks the whole paper is worth to a candidate (choice-aware). */
export function examEffectiveMarks(exam: Exam): number {
  return exam.sections.reduce((n, s) => n + sectionEffectiveMarks(s), 0);
}

// ── Quality control ─────────────────────────────────────────────────
export interface ExamIssue {
  level: "fixed" | "warn";
  message: string;
}

export interface NormalizedExam {
  exam: Exam;
  issues: ExamIssue[];
}

// Objective item types whose model answer is naturally short (a letter, a word).
const OBJECTIVE_TYPE = /multiple choice|mcq|matching|true\s*\/?\s*false|fill/i;
// A model answer that carries no real marking information.
const TRIVIAL_ANSWER = /^(n\/?a|tbd|todo|none|-+|\.+|see above|as above)$/i;

function isTrivialAnswer(a: string | undefined): boolean {
  const t = (a || "").trim();
  return t.length === 0 || TRIVIAL_ANSWER.test(t);
}

/**
 * Detect "not answerable" content faults — problems that make a paper unusable
 * even when the marks add up. These cannot be fixed deterministically (they need
 * new content), so they are reported as warnings and drive the repair pass.
 */
export function validateExam(exam: Exam): ExamIssue[] {
  const issues: ExamIssue[] = [];
  const qs = exam.sections.flatMap((s) => s.questions);

  const mcqBadCount = qs.filter((q) => /multiple choice|mcq/i.test(q.type) && (q.options?.length ?? 0) !== 4);
  if (mcqBadCount.length) {
    issues.push({ level: "warn", message: `${mcqBadCount.length} multiple-choice question(s) do not have exactly 4 options (A–D).` });
  }

  const blankOption = qs.filter((q) => (q.options ?? []).some((o) => !o || !o.trim()));
  if (blankOption.length) {
    issues.push({ level: "warn", message: `${blankOption.length} question(s) have a blank answer option.` });
  }

  const missingAnswer = qs.filter((q) => isTrivialAnswer(q.answer));
  if (missingAnswer.length) {
    issues.push({ level: "warn", message: `${missingAnswer.length} question(s) have a missing or placeholder marking scheme.` });
  }

  const thinAnswer = qs.filter(
    (q) => !OBJECTIVE_TYPE.test(q.type) && !isTrivialAnswer(q.answer) && (q.answer || "").trim().length < 8,
  );
  if (thinAnswer.length) {
    issues.push({ level: "warn", message: `${thinAnswer.length} non-objective question(s) have a very short marking scheme.` });
  }

  return issues;
}

/**
 * Make a generated paper internally consistent before it is delivered, so the
 * printed section and paper totals always match the questions actually set — no
 * "the marks don't add up" mistakes reach the teacher.
 *
 * - Every section's `marks` is set to its effective (choice-aware) marks.
 * - The paper total is the sum of those section marks.
 * - "Not answerable" content faults (bad MCQ option counts, missing marking
 *   schemes) are flagged via validateExam. Every issue is reported.
 */
export function normalizeExam(exam: Exam): NormalizedExam {
  const issues: ExamIssue[] = [];

  const sections = exam.sections.map((s) => {
    const effective = sectionEffectiveMarks(s);
    if (s.marks && s.marks !== effective) {
      const detail = sectionAnswerCount(s) < s.questions.length ? ` (answer ${sectionAnswerCount(s)} of ${s.questions.length})` : "";
      issues.push({ level: "fixed", message: `${s.name}: declared ${s.marks} marks corrected to ${effective}${detail} to match its questions.` });
    }
    return { ...s, marks: effective };
  });

  const total = sections.reduce((n, s) => n + (s.marks || 0), 0);
  if (exam.totalMarks && exam.totalMarks !== total) {
    issues.push({ level: "fixed", message: `Paper total corrected from ${exam.totalMarks} to ${total} to match the sections.` });
  }

  const normalized: Exam = { ...exam, sections, totalMarks: total || exam.totalMarks };
  issues.push(...validateExam(normalized));

  return { exam: normalized, issues };
}

export const examConfigSchema = z.object({
  subject: z.string().min(1),
  level: z.string().default(""),
  form: z.string().default(""),
  examType: z.enum(EXAM_TYPES),
  durationMinutes: z.number().int().min(15).max(300),
  totalMarks: z.number().int().min(5).max(200),
  topics: z.array(z.string()).max(40).default([]),
  formats: z.array(z.enum(QUESTION_FORMATS)).min(1),
  difficulty: z.enum(DIFFICULTIES),
  language: z.enum(LANGUAGES),
  school: z.string().max(120).optional(),
  model: z.string().optional(),
  instruction: z.string().max(600).optional(), // optional refine instruction
});

// ── Prompt builder ──────────────────────────────────────────────
export function buildExamPrompt(config: ExamConfig, refine?: string): { system: string; user: string } {
  const system = `You are a senior Tanzanian examiner and TIE curriculum expert who writes NECTA-standard, competence-based examination papers. You know the Tanzania 2023 competence-based curriculum, NECTA paper structure (Sections A/B/C with objective, short/structured, and essay items), marks allocation, timing, and Bloom's taxonomy balance.

You output ONLY a single valid JSON object (no markdown, no code fences, no commentary) with this exact shape:
{
  "title": string,
  "subject": string,
  "level": string,
  "form": string,
  "examType": string,
  "durationMinutes": number,
  "totalMarks": number,
  "language": string,
  "instructions": string[],            // candidate instructions (rubric)
  "sections": [
    {
      "name": string,                  // e.g. "SECTION A"
      "instructions": string,
      "marks": number,                 // marks a candidate earns in this section
      "choose": number,                // OPTIONAL — for an optional section, how many of the printed questions to answer (e.g. 2 when "answer any two of four"); omit for compulsory sections
      "questions": [
        {
          "number": string,            // e.g. "1", "2(a)"
          "type": string,              // one of the requested formats
          "marks": number,
          "bloom": string,             // Remember|Understand|Apply|Analyze|Evaluate|Create
          "difficulty": string,
          "text": string,              // the full question (use \n for structured sub-parts)
          "options": string[],         // ONLY for Multiple Choice; otherwise omit
          "figure": {                  // OPTIONAL — include ONLY when the question needs a diagram
            "type": "numberline" | "barchart" | "coordinates" | "table",
            "caption": string,
            // numberline: min, max, step, marks:[{value,label}]
            // barchart:   labels:string[], values:number[], xLabel, yLabel
            // coordinates:xMin,xMax,yMin,yMax, points:[{x,y,label}], segments:[{x1,y1,x2,y2,label}]
            // table:      headers:string[], rows:string[][]
          },
          "answer": string             // model answer / marking scheme with mark breakdown
        }
      ]
    }
  ]
}

Rules:
- The marks a candidate can earn MUST sum exactly to totalMarks. For a COMPULSORY section, its "marks" equals the sum of its question marks. For an OPTIONAL section, set "choose" to the number of questions answered and set the section "marks" to the marks earned by that many questions (NOT the sum of all printed questions), then include extra printed questions to choose from. State the choice in the section "instructions" (e.g. "Answer any two (2) questions from this section.").
- Keep the whole paper doable within the given duration.
- Balance Bloom's levels across the paper; do not make every item "Remember".
- Only use the requested question formats. Multiple Choice items need 4 options (A–D) and the answer states the correct letter.
- Cover the requested topics; every question must be answerable from the stated subject/form syllabus.
- Every question includes a correct, complete "answer" (model answer) with a brief mark breakdown.
- Write ALL mathematical expressions in LaTeX: inline as $...$ and display as $$...$$ (e.g. fractions $\\frac{3}{4}$, powers $x^{2}$, roots $\\sqrt{x}$, $\\times$, $\\pm$, $\\leq$). Do not write math as plain ASCII.
- Attach a "figure" ONLY when the question genuinely needs a diagram — a data table to read, a bar chart, a number line, or points/lines to plot on a coordinate plane. Use one of the four supported figure types with numeric data (never prose). Do not invent figure types. Most questions need no figure.
- Write in the requested language.`;

  const blueprint = blueprintPromptBlock(config.subject, config.level, config.examType, config.totalMarks);
  const governed = examStructureGoverned(config.subject, config.level, config.examType);

  const parts = [
    `Create a ${config.examType} for ${config.subject} — ${config.level} ${config.form}.`,
    `Duration: ${config.durationMinutes} minutes. Total marks: ${config.totalMarks}.`,
    governed
      ? `The official paper structure below governs the sections and question types; use the teacher's format preferences (${config.formats.join(", ")}) only where they fit that structure.`
      : `Question formats to use: ${config.formats.join(", ")}.`,
    `Overall difficulty: ${config.difficulty}.`,
    `Language: ${config.language}.`,
    config.topics.length ? `Focus on these topics: ${config.topics.join("; ")}.` : `Cover the core topics of the form.`,
    config.school ? `School: ${config.school}.` : "",
    blueprint ? `\n${blueprint}` : "",
    refine ? `\nApply this change to the paper: ${refine}` : "",
    `\nReturn ONLY the JSON object.`,
  ];
  return { system, user: parts.filter(Boolean).join(" ") };
}

// ── Exam variants (A/B/C/D) — anti-cheat randomisation ──────────
export const EXAM_VERSIONS = ["A", "B", "C", "D"] as const;
export type ExamVersion = (typeof EXAM_VERSIONS)[number];

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Reorder MCQ options and remap the answer's leading letter accordingly. */
function shuffleOptions(q: ExamQuestion, rng: () => number): ExamQuestion {
  if (!q.options || q.options.length < 2) return q;
  const order = shuffle(
    q.options.map((_, i) => i),
    rng,
  );
  const options = order.map((i) => q.options![i]);
  let answer = q.answer;
  const m = q.answer.match(/^\s*([A-Da-d])\b/);
  if (m) {
    const oldIdx = m[1].toUpperCase().charCodeAt(0) - 65;
    const newPos = order.indexOf(oldIdx);
    if (newPos >= 0) answer = q.answer.replace(/^\s*[A-Da-d]\b/, String.fromCharCode(65 + newPos));
  }
  return { ...q, options, answer };
}

/**
 * Produce version A/B/C/D of an exam. A is the canonical order; B/C/D shuffle
 * question order (renumbered continuously) and MCQ options, deterministically
 * per version so the same version always reproduces the same paper.
 */
export function makeVariant(exam: Exam, version: ExamVersion): Exam {
  if (version === "A") return exam;
  const rng = mulberry32(version.charCodeAt(0) * 2654435761);
  let n = 0;
  const sections = exam.sections.map((s) => {
    const questions = shuffle(s.questions, rng).map((q) => {
      n += 1;
      const withOpts = shuffleOptions(q, rng);
      return { ...withOpts, number: String(n) };
    });
    return { ...s, questions };
  });
  return { ...exam, title: `${exam.title} — Version ${version}`, sections };
}

/** Extract a JSON object from a model response that may include stray text/fences. */
export function extractExamJson(raw: string): unknown {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return JSON.parse(s);
}

/** Unicode replacements for common LaTeX operators, relations and symbols. */
const LATEX_SYMBOLS: Array<[string, string]> = [
  ["\\times", "×"], ["\\div", "÷"], ["\\cdot", "·"], ["\\ast", "∗"],
  ["\\pm", "±"], ["\\mp", "∓"], ["\\leq", "≤"], ["\\geq", "≥"], ["\\neq", "≠"],
  ["\\approx", "≈"], ["\\equiv", "≡"], ["\\propto", "∝"], ["\\sim", "∼"],
  ["\\infty", "∞"], ["\\partial", "∂"], ["\\nabla", "∇"], ["\\prime", "′"],
  ["\\angle", "∠"], ["\\triangle", "△"], ["\\parallel", "∥"], ["\\perp", "⊥"],
  ["\\Rightarrow", "⇒"], ["\\Leftarrow", "⇐"], ["\\Leftrightarrow", "⇔"],
  ["\\rightarrow", "→"], ["\\leftarrow", "←"], ["\\to", "→"], ["\\mapsto", "↦"],
  ["\\leftrightarrow", "↔"], ["\\Sigma", "Σ"], ["\\sum", "Σ"], ["\\prod", "∏"],
  ["\\int", "∫"], ["\\sqrt", "√"], ["\\therefore", "∴"], ["\\because", "∵"],
  ["\\in", "∈"], ["\\notin", "∉"], ["\\ni", "∋"], ["\\subset", "⊂"],
  ["\\subseteq", "⊆"], ["\\supset", "⊃"], ["\\cup", "∪"], ["\\cap", "∩"],
  ["\\emptyset", "∅"], ["\\varnothing", "∅"], ["\\forall", "∀"], ["\\exists", "∃"],
  ["\\ldots", "…"], ["\\cdots", "⋯"], ["\\dots", "…"], ["\\degree", "°"], ["\\circ", "°"],
  // Greek (lower)
  ["\\alpha", "α"], ["\\beta", "β"], ["\\gamma", "γ"], ["\\delta", "δ"],
  ["\\epsilon", "ε"], ["\\varepsilon", "ε"], ["\\zeta", "ζ"], ["\\eta", "η"],
  ["\\theta", "θ"], ["\\iota", "ι"], ["\\kappa", "κ"], ["\\lambda", "λ"],
  ["\\mu", "μ"], ["\\nu", "ν"], ["\\xi", "ξ"], ["\\pi", "π"], ["\\rho", "ρ"],
  ["\\sigma", "σ"], ["\\tau", "τ"], ["\\phi", "φ"], ["\\varphi", "φ"],
  ["\\chi", "χ"], ["\\psi", "ψ"], ["\\omega", "ω"],
  // Greek (upper)
  ["\\Gamma", "Γ"], ["\\Delta", "Δ"], ["\\Theta", "Θ"], ["\\Lambda", "Λ"],
  ["\\Xi", "Ξ"], ["\\Pi", "Π"], ["\\Phi", "Φ"], ["\\Psi", "Ψ"], ["\\Omega", "Ω"],
];

/**
 * Best-effort LaTeX → readable plain text for the .docx export (which has no
 * equation typesetting). Covers secondary-school maths/science notation and,
 * critically, NEVER silently deletes an unknown macro — it drops the backslash
 * and keeps the word, so \sin, \log, \lim, \vec, matrices, etc. survive as
 * readable text instead of vanishing from the printed paper.
 */
export function latexToPlain(input: string): string {
  let s = input || "";
  // Math delimiters
  s = s.replace(/\${1,2}/g, "");
  // Environments (matrices, cases, aligned…): keep contents; row/col separators
  s = s.replace(/\\begin\{[a-zA-Z*]+\}/g, "").replace(/\\end\{[a-zA-Z*]+\}/g, "");
  // Text-mode wrappers → inner text
  s = s.replace(/\\(?:text|mathrm|mathbf|mathit|mathsf|operatorname)\s*\{([^{}]*)\}/g, "$1");
  // Fractions, roots, powers, subscripts, binomials, accents
  s = s.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)");
  s = s.replace(/\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/g, "$1√($2)");
  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)");
  s = s.replace(/\\binom\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "C($1, $2)");
  s = s.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/_\{([^{}]*)\}/g, "_$1");
  s = s.replace(/\\(?:overline|underline|vec|hat|bar|widehat|overrightarrow)\s*\{([^{}]*)\}/g, "$1");
  // Known symbols/operators
  for (const [tex, uni] of LATEX_SYMBOLS) s = s.split(tex).join(uni);
  // Row/column separators from environments
  s = s.replace(/\\\\/g, "; ");
  // Spacing macros
  s = s.replace(/\\[,;:!> ]/g, " ").replace(/\\q?quad/g, "  ");
  s = s.replace(/\\left|\\right/g, "");
  // Any remaining \macro → keep the name (never delete content)
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  // Leftover grouping/alignment characters
  s = s.replace(/[{}]/g, "").replace(/&/g, " ");
  return s.replace(/[ \t]{2,}/g, " ").trim();
}
