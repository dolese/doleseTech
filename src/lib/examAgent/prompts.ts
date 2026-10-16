/**
 * What each member of the examining panel is asked to do. Every prompt asks
 * for one JSON object, parsed and checked in assemble.ts — nothing a model
 * returns reaches the teacher unchecked.
 *
 *   setter     writes questions to the plan                 (draft)
 *   examiner   answers the paper blind, without the scheme  (solve)
 *   moderator  reviews every question against a checklist   (moderate)
 *   setter     fixes what the moderator sent back           (revise)
 */
import type { Exam, ExamQuestion } from "../exams";
import { isItemisedFormat, itemNumbers, type ExamPlan, type PlanItem } from "./plan";

/** Problems a moderator can raise, and what each means. */
export const PROBLEMS = {
  SYLLABUS: "not on the syllabus for this level and form, or not the planned topic",
  LEVEL: "the thinking level or difficulty is clearly not what the plan asked for",
  CLARITY: "ambiguous, unclear, could be read two ways, or has language errors",
  KEY: "the marking-scheme answer is wrong, or a multiple-choice item has no correct option or more than one",
  DISTRACTORS: "wrong options are implausible, overlap, use 'all/none of the above', or the stem gives the answer away",
  MARKS: "the work demanded does not fit the marks, or sub-part marks do not add up to the question's marks",
  SCHEME: "the marking scheme is incomplete: no mark allocation, missing acceptable alternatives, or an essay without its points",
  CONTEXT: "unsuitable or insensitive content, or a foreign setting where a Tanzanian one would fit",
  DUPLICATE: "repeats, overlaps with or gives away another question in the paper",
} as const;
export type Problem = keyof typeof PROBLEMS;

const QUESTION_FIELDS = `{
  "number": string,     // exactly as given in the plan, e.g. "1 (iii)" or "4"
  "type": string,       // exactly the planned format
  "marks": number,      // exactly the planned marks
  "bloom": string,      // the planned thinking level
  "difficulty": string, // the planned difficulty
  "text": string,       // the full question; use \\n between sub-parts
  "options": string[],  // ONLY for Multiple Choice: the options' text, without letters
  "figure": object,     // OPTIONAL, only if a diagram is essential (see rules)
  "answer": string      // the marking scheme
}`;

const WRITING_RULES = [
  "Every question must be answerable from the syllabus of the stated level and form, and test the planned topic at the planned thinking level and difficulty.",
  "Multiple Choice: one item per number; 4 options (A–D) or 5 options (A–E), exactly ONE correct, all of similar length and plausible to a candidate who has not mastered the topic. Never use 'all of the above' or 'none of the above'. Write negatives in capitals (NOT). The answer starts with the correct letter, e.g. \"C. Because …\", and does not mention other option letters.",
  "True/False: one statement per number; the answer is \"True\" or \"False\" with a one-line reason.",
  "Fill in the Blanks: one sentence per number with a single blank shown as ______; the answer is the missing word(s).",
  "Matching: ONE question. In the text, give List A (items (i), (ii), …) and List B (responses A, B, …) with two or three MORE responses than items. The answer pairs every item: \"(i) C, (ii) A, …\".",
  "Short Answer and Structured: split into parts (a), (b), (c) where natural, show each part's marks in brackets, e.g. \"(b) Explain … (3 marks)\", and make the parts add up exactly to the question's marks.",
  "Essay: a clear task with a command word (Discuss, Explain, Analyse, Evaluate …). The marking scheme gives the introduction, each expected point with its marks, and the conclusion, adding up to the question's marks.",
  "Every marking scheme shows how the marks are earned — the points or steps, each with its mark — and acceptable alternative answers.",
  "Use Tanzanian names, places, currency (TZS) and everyday situations. Nothing a candidate could find upsetting or unfair.",
  "Write all mathematics in LaTeX: inline $...$ and display $$...$$ (fractions $\\frac{3}{4}$, powers $x^{2}$, $\\times$, $\\leq$).",
  "Attach a \"figure\" only when the question cannot be asked without one: type \"numberline\" (min, max, step, marks[{value,label}]), \"barchart\" (labels[], values[], xLabel, yLabel), \"coordinates\" (xMin, xMax, yMin, yMax, points[{x,y,label}], segments[{x1,y1,x2,y2,label}]) or \"table\" (headers[], rows[][]), with numeric data. Most questions need none.",
];

const SETTER = (plan: ExamPlan) =>
  `You are a senior Tanzanian examiner on a NECTA-style examining panel, setting questions for ${plan.subject} (${plan.level}, ${plan.form}). You write to an approved table of specifications: the number, format, marks, topic, thinking level and difficulty of every question are fixed, and you follow them exactly.

You output ONLY one valid JSON object, no markdown and no commentary: {"questions": [ ...questions ]}, where each question is:
${QUESTION_FIELDS}

Rules:
${WRITING_RULES.map((r) => `- ${r}`).join("\n")}
- Write in ${plan.language}.${plan.guidance.length ? `\n\nHow ${plan.subject} is examined:\n${plan.guidance.map((g) => `- ${g}`).join("\n")}` : ""}`;

function describeItem(item: PlanItem): string {
  const numbers = itemNumbers(item);
  const what = isItemisedFormat(item.format)
    ? `${item.format}, ${item.parts} items numbered "${numbers[0]}" to "${numbers[numbers.length - 1]}", 1 mark each`
    : item.format === "Matching"
      ? `Matching, one question numbered "${item.number}" with ${item.parts} items in List A, ${item.marks} marks`
      : `${item.format}, numbered "${item.number}", ${item.marks} marks`;
  return `Question ${item.number}: ${what}. Topic${item.topics.length > 1 ? "s" : ""}: ${item.topics.join("; ")}. Thinking level: ${item.bloom}. Difficulty: ${item.difficulty}.`;
}

function paperLine(plan: ExamPlan): string {
  return `${plan.examType} — ${plan.subject}, ${plan.level} ${plan.form}. ${plan.durationMinutes} minutes, ${plan.totalMarks} marks.`;
}

/** Write some of a section's questions. */
export function draftPrompt(plan: ExamPlan, sectionIndex: number, itemNumbersToWrite: string[], instruction?: string) {
  const section = plan.sections[sectionIndex];
  const items = section.items.filter((i) => itemNumbersToWrite.includes(i.number));
  const others = plan.sections
    .flatMap((s) => s.items)
    .filter((i) => !itemNumbersToWrite.includes(i.number))
    .map((i) => `- Question ${i.number} (${i.format}): ${i.topics.join("; ")}`);

  const user = [
    paperLine(plan),
    `\n${section.name}: ${section.instructions}${section.note ? ` (${section.note})` : ""}`,
    section.choose ? `Candidates choose ${section.choose} of these ${section.items.length} questions, so they must be alternatives of equal standard and length.` : "",
    `\nWrite these questions:\n${items.map((i) => `- ${describeItem(i)}`).join("\n")}`,
    others.length ? `\nOther questions in the paper, written separately — do not overlap with them:\n${others.join("\n")}` : "",
    instruction ? `\nThe teacher asks: ${instruction}` : "",
    `\nReturn ONLY the JSON object.`,
  ];
  return { system: SETTER(plan), user: user.filter(Boolean).join("\n") };
}

function printQuestion(q: ExamQuestion, withScheme: boolean): string {
  const lines = [`[${q.number}] (${q.type}, ${q.marks} mark${q.marks === 1 ? "" : "s"}) ${q.text}`];
  if (q.options?.length) q.options.forEach((o, i) => lines.push(`   ${String.fromCharCode(65 + i)}. ${o}`));
  if (q.figure) lines.push(`   [figure: ${JSON.stringify(q.figure)}]`);
  if (withScheme) lines.push(`   MARKING SCHEME: ${q.answer}`);
  return lines.join("\n");
}

/** Answer the paper without the marking scheme, as a second examiner would. */
export function solvePrompt(plan: ExamPlan, questions: ExamQuestion[]) {
  const system = `You are an experienced Tanzanian examiner checking a ${plan.subject} paper for ${plan.level} ${plan.form}. Answer every question yourself, carefully and independently, as a top candidate would. You are NOT shown the marking scheme.

You output ONLY one valid JSON object: {"answers": [{"number": string, "answer": string}]}, one entry per question number given.
- Multiple Choice: the letter only, e.g. "C".
- True/False: "True" or "False".
- Fill in the Blanks: the missing word(s) only.
- Matching: every pair, e.g. "(i) C, (ii) A, (iii) F".
- Short Answer and Structured: the final answer(s) and key points, at most 60 words.
- If a question cannot be answered as written — ambiguous, no correct option, more than one correct option, missing information — answer "PROBLEM: " and the reason.`;
  const user = `${paperLine(plan)}\n\n${questions.map((q) => printQuestion(q, false)).join("\n\n")}\n\nReturn ONLY the JSON object.`;
  return { system, user };
}

function specLine(plan: ExamPlan, number: string): string {
  const base = number.split(" ")[0];
  const item = plan.sections.flatMap((s) => s.items).find((i) => i.number === base);
  return item ? `plan: ${item.topics.join("; ")} · ${item.bloom} · ${item.difficulty}` : "";
}

/** Review every question against the moderation checklist. */
export function moderatePrompt(plan: ExamPlan, exam: Exam, blind: Map<string, string>, only?: string[]) {
  const problems = Object.entries(PROBLEMS).map(([code, meaning]) => `- ${code}: ${meaning}`).join("\n");
  const system = `You are the chief examiner moderating a ${plan.subject} ${plan.examType} for ${plan.level} ${plan.form} before it is printed. Check every question against the approved plan and this checklist:
${problems}

An independent examiner has answered the paper without seeing the marking scheme. Where their answer differs from the scheme, decide who is right; if the scheme is wrong, or the question allows both, that is KEY or CLARITY.

Be strict about correctness, fairness and clarity, and practical about style: do not send back a sound question for a small preference. For each question you send back, say exactly what must change.

You output ONLY one valid JSON object:
{"verdicts": [{"number": string, "problems": [string], "note": string}], "summary": string}
- "verdicts" lists ONLY questions that must be revised; an empty list means every question passes.
- "problems" uses the codes above.
- "summary" is two or three sentences on the paper as a whole: coverage, balance, standard.`;

  const questions = exam.sections.flatMap((s) =>
    s.questions
      .filter((q) => !only || only.includes(q.number))
      .map((q) => {
        const theirs = blind.get(q.number);
        return `${printQuestion(q, true)}\n   ${specLine(plan, q.number)}${theirs ? `\n   INDEPENDENT EXAMINER: ${theirs}` : ""}`;
      }),
  );
  const user = `${paperLine(plan)}\n${only ? `These questions were revised after the first moderation; check them again.\n` : ""}\n${questions.join("\n\n")}\n\nReturn ONLY the JSON object.`;
  return { system, user };
}

export interface RevisionRequest {
  question: ExamQuestion;
  problems: string[];
  note: string;
  blind?: string;
}

/** Rewrite the questions the moderator sent back. */
export function revisePrompt(plan: ExamPlan, requests: RevisionRequest[], instruction?: string) {
  const system = `${SETTER(plan)}

You are now revising questions the chief examiner sent back. Fix every problem named. Keep each question's number, format and marks exactly; keep its topic and thinking level unless the note says otherwise. Return the complete revised questions.`;
  const blocks = requests.map((r) =>
    [
      printQuestion(r.question, true),
      `   ${specLine(plan, r.question.number)}`,
      `   SENT BACK FOR: ${r.problems.join(", ")} — ${r.note}`,
      r.blind ? `   INDEPENDENT EXAMINER ANSWERED: ${r.blind}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const user = `${paperLine(plan)}${instruction ? `\nThe teacher asked: ${instruction}` : ""}\n\nRevise these questions:\n\n${blocks.join("\n\n")}\n\nReturn ONLY the JSON object with the revised questions.`;
  return { system, user };
}
