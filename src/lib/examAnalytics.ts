/**
 * Assessment analytics + moderation for a generated exam (modules 19 & 18).
 * Pure functions computed from the exam JSON — no AI, no I/O.
 */
import { BLOOM_LEVELS, type Exam, type ExamQuestion } from "./exams";

export interface Dist {
  label: string;
  count: number;
  marks: number;
}

export interface ExamAnalysis {
  questionCount: number;
  computedMarks: number;
  declaredMarks: number;
  estimatedMinutes: number;
  declaredMinutes: number;
  hotsPercent: number; // % of marks at Analyze/Evaluate/Create
  bloom: Dist[];
  types: Dist[];
  difficulty: Dist[];
  sections: { name: string; computed: number; declared: number }[];
}

const HOTS = new Set(["Analyze", "Evaluate", "Create"]);

function normBloom(v: string | undefined): string {
  const t = (v ?? "").trim().toLowerCase();
  return BLOOM_LEVELS.find((b) => b.toLowerCase() === t) ?? "Understand";
}

function allQuestions(exam: Exam): ExamQuestion[] {
  return exam.sections.flatMap((s) => s.questions);
}

function tally(items: { key: string; marks: number }[]): Dist[] {
  const map = new Map<string, Dist>();
  for (const it of items) {
    const d = map.get(it.key) ?? { label: it.key, count: 0, marks: 0 };
    d.count += 1;
    d.marks += it.marks;
    map.set(it.key, d);
  }
  return [...map.values()].sort((a, b) => b.marks - a.marks);
}

export function analyzeExam(exam: Exam): ExamAnalysis {
  const qs = allQuestions(exam);
  const computedMarks = qs.reduce((n, q) => n + (q.marks || 0), 0);
  const hotsMarks = qs.filter((q) => HOTS.has(normBloom(q.bloom))).reduce((n, q) => n + (q.marks || 0), 0);

  // Bloom in canonical order (include zero rows for a full picture)
  const bloomMap = new Map<string, Dist>(BLOOM_LEVELS.map((b) => [b, { label: b, count: 0, marks: 0 }]));
  for (const q of qs) {
    const d = bloomMap.get(normBloom(q.bloom))!;
    d.count += 1;
    d.marks += q.marks || 0;
  }

  // ~1.5 min per mark is a common rough estimate for written papers
  const estimatedMinutes = Math.round(computedMarks * 1.5);

  return {
    questionCount: qs.length,
    computedMarks,
    declaredMarks: exam.totalMarks || computedMarks,
    estimatedMinutes,
    declaredMinutes: exam.durationMinutes || 0,
    hotsPercent: computedMarks ? Math.round((hotsMarks / computedMarks) * 100) : 0,
    bloom: [...bloomMap.values()],
    types: tally(qs.map((q) => ({ key: q.type || "Other", marks: q.marks || 0 }))),
    difficulty: tally(qs.map((q) => ({ key: q.difficulty || "Medium", marks: q.marks || 0 }))),
    sections: exam.sections.map((s) => ({
      name: s.name,
      computed: s.questions.reduce((n, q) => n + (q.marks || 0), 0),
      declared: s.marks || 0,
    })),
  };
}

export interface ModerationItem {
  level: "warn" | "ok";
  message: string;
}

export function moderateExam(exam: Exam): ModerationItem[] {
  const a = analyzeExam(exam);
  const items: ModerationItem[] = [];

  // Total marks reconciliation
  if (a.declaredMarks && a.computedMarks !== a.declaredMarks) {
    items.push({ level: "warn", message: `Question marks sum to ${a.computedMarks}, but the paper declares ${a.declaredMarks}.` });
  } else {
    items.push({ level: "ok", message: `Marks add up correctly (${a.computedMarks}).` });
  }

  // Section marks reconciliation
  const badSections = a.sections.filter((s) => s.declared && s.computed !== s.declared);
  if (badSections.length) {
    items.push({ level: "warn", message: `Section marks don't match the stated total in: ${badSections.map((s) => s.name).join(", ")}.` });
  }

  // MCQ integrity
  const badMcq = allQuestions(exam).filter((q) => /multiple choice|mcq/i.test(q.type) && (!q.options || q.options.length < 2));
  if (badMcq.length) {
    items.push({ level: "warn", message: `${badMcq.length} multiple-choice question(s) have fewer than 2 options.` });
  }

  // Marking scheme present
  const noAnswer = allQuestions(exam).filter((q) => !q.answer || q.answer.trim().length === 0);
  if (noAnswer.length) {
    items.push({ level: "warn", message: `${noAnswer.length} question(s) are missing a marking scheme / model answer.` });
  } else {
    items.push({ level: "ok", message: "Every question has a marking scheme." });
  }

  // Higher-order thinking balance
  if (a.hotsPercent === 0) {
    items.push({ level: "warn", message: "No higher-order (Analyze/Evaluate/Create) questions — the paper only tests recall & understanding." });
  } else if (a.hotsPercent < 15) {
    items.push({ level: "warn", message: `Only ${a.hotsPercent}% of marks test higher-order thinking; consider adding more.` });
  } else {
    items.push({ level: "ok", message: `Higher-order thinking is well represented (${a.hotsPercent}% of marks).` });
  }

  // Timing sanity (within ±40% of the ~1.5 min/mark estimate)
  if (a.declaredMinutes) {
    const lo = a.estimatedMinutes * 0.6;
    const hi = a.estimatedMinutes * 1.4;
    if (a.declaredMinutes < lo) {
      items.push({ level: "warn", message: `Time may be tight: ~${a.estimatedMinutes} min is typical for ${a.computedMarks} marks, but only ${a.declaredMinutes} min is allotted.` });
    } else if (a.declaredMinutes > hi) {
      items.push({ level: "warn", message: `Time looks generous: ${a.declaredMinutes} min for ${a.computedMarks} marks (≈${a.estimatedMinutes} min is typical).` });
    } else {
      items.push({ level: "ok", message: `Timing looks reasonable (${a.declaredMinutes} min for ${a.computedMarks} marks).` });
    }
  }

  return items;
}
