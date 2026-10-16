/**
 * The parts of the examining process that need no judgement, done by code:
 * holding every model reply to the plan, putting the paper together,
 * comparing the blind answers with the key, balancing the answer key, and the
 * final checks before the paper goes to the teacher.
 */
import { z } from "zod";
import {
  examQuestionSchema,
  extractExamJson,
  normalizeExam,
  type Exam,
  type ExamIssue,
  type ExamQuestion,
} from "../exams";
import { PROBLEMS, type Problem } from "./prompts";
import {
  PLAN_BLOOMS,
  isItemisedFormat,
  itemNumbers,
  planSectionMarks,
  type Bloom,
  type ExamPlan,
  type PlanItem,
} from "./plan";

/** "1(iii)", "1 (iii)", "1.iii" → "1(iii)": numbers compared loosely. */
export function numberKey(n: string): string {
  return n.toLowerCase().replace(/[\s.]/g, "").replace(/^q(uestion)?/, "");
}

export function parseJson<S extends z.ZodTypeAny>(raw: string, schema: S): z.infer<S> | null {
  try {
    const parsed = schema.safeParse(extractExamJson(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

const questionsReply = z.object({ questions: z.array(examQuestionSchema) });

const isMcq = (format: string) => /multiple choice|mcq/i.test(format);

/** The letter a marking scheme gives for a multiple-choice item, if any. */
export function keyLetter(answer: string): string | null {
  const m = answer.match(/^\s*\(?([A-Ea-e])\b/);
  return m ? m[1].toUpperCase() : null;
}

/**
 * Hold one question to its plan item: the planned number, format and marks
 * (pinned, so totals can never drift), and a usable objective item. Null when
 * the question cannot be used as it is.
 */
function pinOne(item: PlanItem, q: ExamQuestion, number: string): ExamQuestion | null {
  if (!q.text.trim() || !q.answer.trim()) return null;
  const marks = isItemisedFormat(item.format) ? 1 : item.marks;
  const pinned: ExamQuestion = { ...q, number, type: item.format, marks, bloom: item.bloom, difficulty: item.difficulty };
  if (isMcq(item.format)) {
    const options = (q.options ?? []).map((o) => o.replace(/^\s*\(?[A-Ea-e][).]\s+/, "").trim());
    const letter = keyLetter(q.answer);
    if (options.length < 4 || options.length > 5 || options.some((o) => !o)) return null;
    if (!letter || letter.charCodeAt(0) - 65 >= options.length) return null;
    pinned.options = options;
  } else {
    delete pinned.options;
  }
  return pinned;
}

/**
 * Hold a setter's reply to the plan: every planned number present and usable.
 * Returns the questions in plan order, and the numbers that are missing.
 */
export function pinQuestions(items: PlanItem[], raw: string): { questions: ExamQuestion[]; missing: string[] } {
  const reply = parseJson(raw, questionsReply);
  if (!reply) return { questions: [], missing: items.flatMap(itemNumbers) };
  const byKey = new Map(reply.questions.map((q) => [numberKey(q.number), q]));

  const questions: ExamQuestion[] = [];
  const missing: string[] = [];
  for (const item of items) {
    for (const number of itemNumbers(item)) {
      const q = byKey.get(numberKey(number));
      const pinned = q ? pinOne(item, q, number) : null;
      if (pinned) questions.push(pinned);
      else missing.push(number);
    }
  }
  return { questions, missing };
}

/** Put the drafted sections together into a paper. */
export function assembleExam(plan: ExamPlan, sections: ExamQuestion[][], school?: string): Exam {
  return normalizeExam({
    title: `${school ? `${school} — ` : ""}${plan.form} ${plan.subject} ${plan.examType}`,
    subject: plan.subject,
    level: plan.level,
    form: plan.form,
    examType: plan.examType,
    durationMinutes: plan.durationMinutes,
    totalMarks: plan.totalMarks,
    language: plan.language,
    instructions: plan.rubric,
    sections: plan.sections.map((s, i) => ({
      name: s.name,
      instructions: s.instructions,
      marks: planSectionMarks(s),
      choose: s.choose,
      questions: sections[i] ?? [],
    })),
  }).exam;
}

/** The questions without their marking schemes: what the blind examiner sees. */
export function withoutSchemes(exam: Exam): ExamQuestion[] {
  return exam.sections
    .flatMap((s) => s.questions)
    .filter((q) => q.type !== "Essay")
    .map((q) => ({ ...q, answer: "" }));
}

// ── Blind answers against the key ───────────────────────────────────────────

export const blindReply = z.object({ answers: z.array(z.object({ number: z.string(), answer: z.string() })) });

export interface Disagreement {
  number: string;
  key: string;
  blind: string;
}

function trueFalse(s: string): string | null {
  const m = s.trim().match(/^(true|false|kweli|si kweli|uongo)\b/i);
  if (!m) return null;
  return /^true|^kweli$/i.test(m[1]) ? "TRUE" : "FALSE";
}

function matchingPairs(s: string): string {
  return [...s.matchAll(/\(?([ivx]+)\)?\s*[-–:=.]?\s*([A-J])\b/gi)]
    .map((m) => `${m[1].toLowerCase()}${m[2].toUpperCase()}`)
    .sort()
    .join(",");
}

/**
 * Where an independent examiner's answer to an objective question differs
 * from the marking scheme. Written answers are left to the moderator, who
 * sees both.
 */
export function compareObjective(exam: Exam, blind: Map<string, string>): { checked: number; disagreements: Disagreement[] } {
  let checked = 0;
  const disagreements: Disagreement[] = [];
  for (const q of exam.sections.flatMap((s) => s.questions)) {
    const theirs = blind.get(q.number);
    if (!theirs) continue;
    let ours: string | null = null;
    let mine: string | null = null;
    if (isMcq(q.type)) {
      ours = keyLetter(q.answer);
      mine = /^\s*problem/i.test(theirs) ? "PROBLEM" : keyLetter(theirs);
    } else if (q.type === "True/False") {
      ours = trueFalse(q.answer);
      mine = /^\s*problem/i.test(theirs) ? "PROBLEM" : trueFalse(theirs);
    } else if (q.type === "Matching") {
      ours = matchingPairs(q.answer);
      mine = /^\s*problem/i.test(theirs) ? "PROBLEM" : matchingPairs(theirs);
    } else {
      continue;
    }
    if (!ours || !mine) continue;
    checked++;
    if (ours !== mine) disagreements.push({ number: q.number, key: q.answer.slice(0, 120), blind: theirs.slice(0, 200) });
  }
  return { checked, disagreements };
}

// ── Moderation ──────────────────────────────────────────────────────────────

const PROBLEM_CODES = Object.keys(PROBLEMS) as [Problem, ...Problem[]];
export const moderationReply = z.object({
  verdicts: z
    .array(
      z.object({
        number: z.string(),
        problems: z.array(z.string()).default([]),
        note: z.string().default(""),
      }),
    )
    .default([]),
  summary: z.string().default(""),
});

export interface Verdict {
  number: string;
  problems: Problem[];
  note: string;
}

/** The moderator's verdicts, held to real question numbers and known codes. */
export function cleanVerdicts(exam: Exam, raw: z.infer<typeof moderationReply>["verdicts"]): Verdict[] {
  const numbers = new Map(exam.sections.flatMap((s) => s.questions).map((q) => [numberKey(q.number), q.number]));
  const out = new Map<string, Verdict>();
  for (const v of raw) {
    const number = numbers.get(numberKey(v.number));
    if (!number) continue;
    const problems = v.problems.map((p) => p.toUpperCase()).filter((p): p is Problem => PROBLEM_CODES.includes(p as Problem));
    out.set(number, { number, problems: problems.length ? problems : ["CLARITY"], note: v.note.slice(0, 500) });
  }
  return [...out.values()];
}

/** Replace revised questions in place, keeping their numbers and marks. */
export function applyRevisions(exam: Exam, plan: ExamPlan, raw: string, wanted: string[]): { exam: Exam; revised: string[] } {
  const reply = parseJson(raw, questionsReply);
  if (!reply) return { exam, revised: [] };
  const byKey = new Map(reply.questions.map((q) => [numberKey(q.number), q]));
  const items = new Map(plan.sections.flatMap((s) => s.items).map((i) => [i.number, i]));
  const revised: string[] = [];

  const sections = exam.sections.map((s) => ({
    ...s,
    questions: s.questions.map((q) => {
      if (!wanted.includes(q.number)) return q;
      const fresh = byKey.get(numberKey(q.number));
      const item = items.get(q.number.split(" ")[0]);
      const pinned = fresh && item ? pinOne(item, fresh, q.number) : null;
      if (!pinned) return q;
      revised.push(q.number);
      return pinned;
    }),
  }));
  return { exam: { ...exam, sections }, revised };
}

// ── The answer key ──────────────────────────────────────────────────────────

/**
 * Spread a multiple-choice question's correct answers across the letters, as
 * examiners do: no letter holding more than about a third of the key, and no
 * long run of the same letter. Moves the correct option, never changes it.
 */
export function balanceAnswerKey(exam: Exam): { exam: Exam; moved: number } {
  let moved = 0;
  const sections = exam.sections.map((s) => {
    const questions = s.questions.slice();
    const groups = new Map<string, number[]>();
    questions.forEach((q, i) => {
      if (!isMcq(q.type) || !q.options) return;
      const parent = q.number.split(" ")[0];
      groups.set(parent, [...(groups.get(parent) ?? []), i]);
    });
    for (const indices of groups.values()) {
      if (indices.length < 4) continue;
      const letters = indices.map((i) => keyLetter(questions[i].answer));
      const counts = new Map<string, number>();
      letters.forEach((l) => l && counts.set(l, (counts.get(l) ?? 0) + 1));
      const crowded = [...counts.values()].some((c) => c > Math.ceil(indices.length * 0.35));
      const run = letters.some((l, k) => k >= 2 && l && l === letters[k - 1] && l === letters[k - 2]);
      if (!crowded && !run) continue;
      // A fixed, even pattern over the available letters: A C B D E A D B …
      const width = Math.min(...indices.map((i) => questions[i].options!.length));
      const pattern = ["A", "C", "B", "D", "E", "B", "D", "A", "E", "C"].filter((l) => l.charCodeAt(0) - 65 < width);
      indices.forEach((i, k) => {
        const q = questions[i];
        const from = (keyLetter(q.answer) ?? "A").charCodeAt(0) - 65;
        const to = pattern[k % pattern.length].charCodeAt(0) - 65;
        if (from === to) return;
        const options = q.options!.slice();
        [options[from], options[to]] = [options[to], options[from]];
        questions[i] = { ...q, options, answer: q.answer.replace(/^\s*\(?[A-Ea-e]\b\)?/, String.fromCharCode(65 + to)) };
        moved++;
      });
    }
    return { ...s, questions };
  });
  return { exam: { ...exam, sections }, moved };
}

// ── Final checks ────────────────────────────────────────────────────────────

function words(text: string): Set<string> {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3));
}

/** Pairs of questions that say nearly the same thing. */
export function nearDuplicates(exam: Exam): [string, string][] {
  const qs = exam.sections.flatMap((s) => s.questions).map((q) => ({ number: q.number, words: words(q.text) }));
  const pairs: [string, string][] = [];
  for (let i = 0; i < qs.length; i++) {
    for (let j = i + 1; j < qs.length; j++) {
      const a = qs[i].words;
      const b = qs[j].words;
      if (a.size < 5 || b.size < 5) continue;
      const shared = [...a].filter((w) => b.has(w)).length;
      if (shared / (a.size + b.size - shared) >= 0.7) pairs.push([qs[i].number, qs[j].number]);
    }
  }
  return pairs;
}

/** Share of the marks at each thinking level in the finished paper. */
export function examBloomShare(exam: Exam): Record<Bloom, number> {
  const share = Object.fromEntries(PLAN_BLOOMS.map((b) => [b, 0])) as Record<Bloom, number>;
  const qs = exam.sections.flatMap((s) => s.questions);
  const total = qs.reduce((n, q) => n + q.marks, 0) || 1;
  for (const q of qs) {
    const b = (PLAN_BLOOMS as readonly string[]).includes(q.bloom ?? "") ? (q.bloom as Bloom) : "Understand";
    share[b] += q.marks / total;
  }
  return share;
}

/** Everything code can check about the finished paper. */
export function finalChecks(exam: Exam, plan: ExamPlan): ExamIssue[] {
  const { exam: normalized, issues } = normalizeExam(exam);
  const out: ExamIssue[] = issues.filter((i) => i.level !== "fixed");

  if (normalized.totalMarks !== plan.totalMarks) {
    out.push({ level: "warn", message: `The paper totals ${normalized.totalMarks} marks, not the planned ${plan.totalMarks}.` });
  }
  const expected = plan.sections.flatMap((s) => s.items).flatMap(itemNumbers);
  const present = new Set(normalized.sections.flatMap((s) => s.questions).map((q) => q.number));
  const absent = expected.filter((n) => !present.has(n));
  if (absent.length) out.push({ level: "warn", message: `Planned question(s) missing: ${absent.join(", ")}.` });

  for (const [a, b] of nearDuplicates(normalized)) {
    out.push({ level: "warn", message: `Questions ${a} and ${b} are very similar.` });
  }
  return out;
}

// ── The report ──────────────────────────────────────────────────────────────

export interface AgentReport {
  /** What the panel did, in order, for the teacher to see. */
  steps: string[];
  /** Questions read by the moderator. */
  reviewed: number;
  /** Questions sent back and rewritten. */
  revised: Verdict[];
  /** Questions still flagged after the last revision: the teacher should look. */
  unresolved: Verdict[];
  blind: { checked: number; agreed: number; disagreements: Disagreement[] };
  /** Answer-key letters moved to spread the key. */
  keyMoved: number;
  summary: string;
  checks: ExamIssue[];
  bloom: Record<Bloom, number>;
}

export const PROBLEM_LABELS: Record<Problem, string> = {
  SYLLABUS: "Off syllabus",
  LEVEL: "Wrong level",
  CLARITY: "Unclear",
  KEY: "Wrong answer key",
  DISTRACTORS: "Weak options",
  MARKS: "Marks don't fit",
  SCHEME: "Incomplete scheme",
  CONTEXT: "Unsuitable context",
  DUPLICATE: "Duplicate",
};
