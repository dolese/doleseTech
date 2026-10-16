/**
 * The examiner's plan: a table of specifications, drawn up before a single
 * question is written — the way a head of department plans a paper.
 *
 * It is built by code, not by a model, so it is instant, free, the same every
 * time for the same request, and editable by the teacher before anything is
 * written. It fixes, for every printed question: the format, the marks, the
 * syllabus topic(s), the thinking level (Bloom) and the difficulty.
 *
 *   - Full national-style papers (Terminal, Mock, Pre-National, Final) follow
 *     the official NECTA section structure from examBlueprints.ts exactly.
 *   - Class tests follow the formats the teacher chose, laid out in the same
 *     Section A / B / C convention.
 */
import { z } from "zod";
import { blueprintFor, isFullPaperType, scaleSections } from "../examBlueprints";
import { SUBJECTS, SUBJECT_TOPICS, subjectSlug } from "../education";
import type { ExamConfig } from "../exams";

export const PLAN_BLOOMS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const;
export type Bloom = (typeof PLAN_BLOOMS)[number];
export const PLAN_DIFFICULTIES = ["Easy", "Moderate", "Challenging"] as const;
export type ItemDifficulty = (typeof PLAN_DIFFICULTIES)[number];

const OBJECTIVE_FORMATS = ["Multiple Choice", "True/False", "Matching", "Fill in the Blanks"];
export const isObjectiveFormat = (format: string) => OBJECTIVE_FORMATS.includes(format);
/** Objective formats whose items are each printed separately: (i), (ii), … */
export const isItemisedFormat = (format: string) => isObjectiveFormat(format) && format !== "Matching";

/** The most objective items one printed question carries: (i) to (xx). */
const MAX_PARTS = 20;
/** When no syllabus outline is known, the setter chooses — and the moderator checks. */
export const ANY_TOPIC = "Any topic from the syllabus";

export const planItemSchema = z.object({
  number: z.string().max(8),
  format: z.string().max(40),
  marks: z.number().int().min(1).max(100),
  /** Objective questions: how many items (MCQ (i)–(x), matching pairs). 0 otherwise. */
  parts: z.number().int().min(0).max(MAX_PARTS),
  topics: z.array(z.string().max(120)).min(1).max(8),
  bloom: z.enum(PLAN_BLOOMS),
  difficulty: z.enum(PLAN_DIFFICULTIES),
});
export type PlanItem = z.infer<typeof planItemSchema>;

export const planSectionSchema = z.object({
  name: z.string().max(40),
  instructions: z.string().max(300),
  /** Optional sections: questions a candidate answers. Omitted when all are compulsory. */
  choose: z.number().int().positive().optional(),
  note: z.string().max(400).default(""),
  items: z.array(planItemSchema).min(1).max(40),
});
export type PlanSection = z.infer<typeof planSectionSchema>;

export const examPlanSchema = z.object({
  subject: z.string().max(80),
  level: z.string().max(20),
  form: z.string().max(20),
  examType: z.string().max(40),
  language: z.enum(["English", "Kiswahili"]),
  durationMinutes: z.number().int().min(15).max(300),
  totalMarks: z.number().int().min(5).max(200),
  /** True when the official NECTA structure governs the sections. */
  official: z.boolean(),
  materials: z.array(z.string().max(120)).max(10),
  rubric: z.array(z.string().max(300)).max(12),
  guidance: z.array(z.string().max(400)).max(20),
  topicPool: z.array(z.string().max(120)).max(80),
  sections: z.array(planSectionSchema).min(1).max(6),
});
export type ExamPlan = z.infer<typeof examPlanSchema>;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Marks a candidate can earn in a section: all questions, or the best `choose`. */
export function planSectionMarks(section: PlanSection): number {
  if (!section.choose || section.choose >= section.items.length) {
    return section.items.reduce((n, item) => n + item.marks, 0);
  }
  // Optional questions carry equal marks; a candidate answers `choose` of them.
  return section.items[0].marks * section.choose;
}

export function planTotalMarks(plan: ExamPlan): number {
  return plan.sections.reduce((n, s) => n + planSectionMarks(s), 0);
}

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"];

/** The question numbers a plan item becomes on the paper: "1 (i)"… or just "4". */
export function itemNumbers(item: PlanItem): string[] {
  if (isItemisedFormat(item.format) && item.parts > 0) {
    return ROMAN.slice(0, item.parts).map((r) => `${item.number} (${r})`);
  }
  return [item.number];
}

/**
 * Share of the marks a candidate earns at each Bloom level. In an optional
 * section each question counts for its chance of being chosen.
 */
export function planBloomShare(plan: ExamPlan): Record<Bloom, number> {
  const share = Object.fromEntries(PLAN_BLOOMS.map((b) => [b, 0])) as Record<Bloom, number>;
  const total = planTotalMarks(plan) || 1;
  for (const s of plan.sections) {
    const weight = s.choose && s.choose < s.items.length ? s.choose / s.items.length : 1;
    for (const item of s.items) share[item.bloom] += (item.marks * weight) / total;
  }
  return share;
}

/** Topics the plan examines, and how many marks each carries. */
export function planTopicCoverage(plan: ExamPlan): { topic: string; marks: number }[] {
  const marks = new Map<string, number>();
  for (const item of plan.sections.flatMap((s) => s.items)) {
    for (const topic of item.topics) marks.set(topic, (marks.get(topic) ?? 0) + item.marks / item.topics.length);
  }
  return [...marks].map(([topic, m]) => ({ topic, marks: Math.round(m) })).sort((a, b) => b.marks - a.marks);
}

// ── Words ───────────────────────────────────────────────────────────────────

const EN_NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const SW_NUMBERS = ["sifuri", "moja", "mawili", "matatu", "manne", "matano", "sita", "saba", "manane", "tisa", "kumi"];

function enCount(n: number): string {
  return n < EN_NUMBERS.length ? `${EN_NUMBERS[n]} (${n})` : String(n);
}
function swCount(n: number): string {
  return n < SW_NUMBERS.length ? `${SW_NUMBERS[n]} (${n})` : String(n);
}
function letterOf(name: string): string {
  return name.replace(/^(SECTION|SEHEMU)\s+/i, "");
}
function joinLetters(letters: string[], and: string): string {
  return letters.length <= 1 ? letters.join("") : `${letters.slice(0, -1).join(", ")} ${and} ${letters[letters.length - 1]}`;
}

function sectionInstructions(choose: number | undefined, of: number, kiswahili: boolean): string {
  if (choose && choose < of) {
    return kiswahili
      ? `Jibu maswali ${swCount(choose)} kati ya ${of} katika sehemu hii.`
      : `Answer any ${enCount(choose)} questions from this section.`;
  }
  return kiswahili ? "Jibu maswali yote katika sehemu hii." : "Answer all questions in this section.";
}

function paperRubric(sections: PlanSection[], materials: string[], kiswahili: boolean): string[] {
  const letters = sections.map((s) => letterOf(s.name));
  const count = sections.reduce((n, s) => n + s.items.length, 0);
  const compulsory = sections.filter((s) => !s.choose || s.choose >= s.items.length).map((s) => letterOf(s.name));
  const optional = sections.filter((s) => s.choose && s.choose < s.items.length);

  if (kiswahili) {
    const lines = [
      sections.length > 1
        ? `Karatasi hii ina sehemu ${joinLetters(letters, "na")} zenye jumla ya maswali ${count}.`
        : `Karatasi hii ina maswali ${count}.`,
      optional.length
        ? `Jibu maswali yote katika sehemu ${joinLetters(compulsory, "na")}, na ${optional
            .map((s) => `maswali ${swCount(s.choose!)} kutoka sehemu ${letterOf(s.name)}`)
            .join(" na ")}.`
        : "Jibu maswali yote.",
    ];
    if (materials.length) lines.push(`Vifaa vinavyoruhusiwa: ${materials.join(", ")}.`);
    lines.push("Vifaa vya mawasiliano na vitu vyote visivyoruhusiwa haviruhusiwi katika chumba cha mtihani.");
    lines.push("Andika Namba yako ya Mtihani katika kila ukurasa wa kijitabu chako cha kujibia.");
    return lines;
  }

  const lines = [
    sections.length > 1
      ? `This paper consists of sections ${joinLetters(letters, "and")} with a total of ${enCount(count)} questions.`
      : `This paper consists of ${enCount(count)} questions.`,
    optional.length
      ? `Answer all questions in section${compulsory.length > 1 ? "s" : ""} ${joinLetters(compulsory, "and")}, and ${optional
          .map((s) => `any ${enCount(s.choose!)} questions from section ${letterOf(s.name)}`)
          .join(" and ")}.`
      : "Answer all questions.",
  ];
  if (materials.length) lines.push(`${materials.join(", ")} may be used.`);
  lines.push("All communication devices and any unauthorised materials are not allowed in the examination room.");
  lines.push("Write your Examination Number on every page of your answer booklet(s).");
  return lines;
}

// ── Topics ──────────────────────────────────────────────────────────────────

const FORMS = ["Form I", "Form II", "Form III", "Form IV", "Form V", "Form VI"];
/** Papers that examine everything taught so far, not one form's work. */
const CUMULATIVE_TYPES = new Set(["Mock Exam", "Pre-National Exam", "Final Examination"]);

/** The syllabus topics this paper may examine. */
export function topicPoolFor(config: Pick<ExamConfig, "subject" | "level" | "form" | "examType" | "topics">): string[] {
  if (config.topics.length) return [...new Set(config.topics)];
  const subject = SUBJECTS.find((s) => s.name === config.subject && s.level === config.level);
  const outline = subject ? SUBJECT_TOPICS[subjectSlug(subject)] : undefined;
  if (!outline?.length) return [];

  const upTo = FORMS.indexOf(config.form);
  const forms = CUMULATIVE_TYPES.has(config.examType) && upTo >= 0
    ? outline.filter((f) => FORMS.indexOf(f.form) <= upTo && FORMS.indexOf(f.form) >= (upTo >= 4 ? 4 : 0))
    : outline.filter((f) => f.form === config.form);
  return [...new Set((forms.length ? forms : outline).flatMap((f) => f.topics))];
}

/**
 * Indices that walk the whole syllabus evenly, so consecutive questions come
 * from different parts of it (golden-ratio spacing, deterministic).
 */
function spreadOrder(n: number): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let k = 0; order.length < n; k++) {
    const i = Math.floor(((k * 0.6180339887) % 1) * n);
    if (!seen.has(i)) {
      seen.add(i);
      order.push(i);
    }
    if (k > n * 10) break;
  }
  for (let i = 0; i < n; i++) if (!seen.has(i)) order.push(i);
  return order;
}

// ── Bloom levels and difficulty ─────────────────────────────────────────────

const BLOOM_LADDER: Record<string, Bloom[]> = {
  "Multiple Choice": ["Understand"],
  "True/False": ["Remember"],
  Matching: ["Remember"],
  "Fill in the Blanks": ["Remember"],
  "Short Answer": ["Understand", "Apply"],
  Structured: ["Understand", "Apply", "Analyze", "Apply"],
  // O-Level essays mix "explain/describe" with "discuss/assess".
  Essay: ["Analyze", "Understand", "Evaluate"],
};
const A_LEVEL_ESSAY: Bloom[] = ["Evaluate", "Analyze", "Create"];

function shiftBloom(bloom: Bloom, by: number): Bloom {
  const i = Math.min(PLAN_BLOOMS.length - 1, Math.max(1, PLAN_BLOOMS.indexOf(bloom) + by));
  return PLAN_BLOOMS[i];
}

/** Share of easy, moderate and challenging questions for each overall difficulty. */
const DIFFICULTY_MIX: Record<string, [number, number, number]> = {
  "Very Easy": [0.6, 0.4, 0],
  Easy: [0.5, 0.4, 0.1],
  Medium: [0.2, 0.6, 0.2],
  Balanced: [0.3, 0.5, 0.2],
  Difficult: [0.1, 0.5, 0.4],
  "Very Difficult": [0, 0.4, 0.6],
};

/** Difficulty for n questions in order: easier first within a section. */
function difficulties(n: number, overall: string): ItemDifficulty[] {
  const mix = DIFFICULTY_MIX[overall] ?? DIFFICULTY_MIX.Balanced;
  const counts = mix.map((m) => Math.floor(m * n));
  // Largest remainders take the leftover questions.
  const order = mix.map((m, i) => ({ i, r: m * n - Math.floor(m * n) })).sort((a, b) => b.r - a.r);
  for (let k = 0; counts.reduce((a, b) => a + b, 0) < n; k++) counts[order[k % 3].i]++;
  return PLAN_DIFFICULTIES.flatMap((d, i) => Array<ItemDifficulty>(counts[i]).fill(d));
}

// ── Section shapes ──────────────────────────────────────────────────────────

interface Shape {
  name: string;
  marks: number;
  perQuestion: number;
  formats: string[];
  choice?: { answer: number; of: number };
  note: string;
}

const CHOICE_TYPES = new Set(["Midterm Test", "Terminal Exam", "Mock Exam", "Pre-National Exam", "Final Examination", "Practice Paper", "Revision Paper"]);

/** Class tests: the teacher's formats, laid out as Sections A, B and C. */
function customShapes(config: ExamConfig): Shape[] {
  const formats = config.formats;
  const groups = [
    { formats: formats.filter(isObjectiveFormat), weight: 0.2 },
    { formats: formats.filter((f) => f === "Short Answer" || f === "Structured"), weight: 0.5 },
    { formats: formats.filter((f) => f === "Essay"), weight: 0.3 },
  ].filter((g) => g.formats.length);
  const totalWeight = groups.reduce((n, g) => n + g.weight, 0);
  const total = config.totalMarks;

  const shapes: Shape[] = groups.map((g, i) => {
    const objective = g.formats.every(isObjectiveFormat);
    const essay = g.formats.includes("Essay");
    const perQuestion = objective ? 1
      : essay ? (total >= 60 ? 15 : total >= 30 ? 10 : 5)
      : g.formats.includes("Structured") ? (total >= 60 ? 9 : total >= 30 ? 6 : 4)
      : (total >= 60 ? 5 : 3);
    return {
      name: `SECTION ${"ABC"[i]}`,
      marks: Math.round((total * g.weight) / totalWeight),
      perQuestion,
      formats: g.formats,
      note: objective ? "Objective items, 1 mark each." : essay ? "Extended answers." : "Short-answer and structured questions.",
    };
  });
  const drift = total - shapes.reduce((n, s) => n + s.marks, 0);
  shapes.reduce((a, b) => (b.marks > a.marks ? b : a)).marks += drift;

  for (const s of shapes) {
    const answered = Math.max(1, Math.round(s.marks / s.perQuestion));
    if (s.formats.includes("Essay") && CHOICE_TYPES.has(config.examType) && answered >= 2) {
      s.choice = { answer: answered, of: answered + 1 };
    }
  }
  return shapes;
}

/** Split an objective section's marks between its formats: NECTA's 10 MCQ + 6 matching. */
function objectiveSplit(marks: number, formats: string[]): { format: string; count: number }[] {
  const objective = formats.filter(isObjectiveFormat);
  if (objective.length === 1) return [{ format: objective[0], count: marks }];
  // Too few marks for a matching question to make sense: all multiple choice.
  if (objective.includes("Multiple Choice") && objective.includes("Matching") && marks < 8) {
    return [{ format: "Multiple Choice", count: marks }];
  }
  if (objective.length === 2 && objective.includes("Multiple Choice") && objective.includes("Matching")) {
    const matching = Math.min(10, Math.max(3, Math.round(marks * 0.375)));
    return [
      { format: "Multiple Choice", count: marks - matching },
      { format: "Matching", count: matching },
    ];
  }
  const base = Math.floor(marks / objective.length);
  return objective.map((format, i) => ({ format, count: base + (i < marks - base * objective.length ? 1 : 0) }));
}

function writtenFormat(shape: Shape, marks: number, index: number): string {
  const written = shape.formats.filter((f) => !isObjectiveFormat(f));
  if (written.length <= 1) return written[0] ?? shape.formats[0];
  if (written.includes("Essay") && written.includes("Structured")) return index % 2 ? "Essay" : "Structured";
  if (written.includes("Structured") && written.includes("Short Answer")) return marks >= 6 ? "Structured" : "Short Answer";
  return written[index % written.length];
}

// ── The plan ────────────────────────────────────────────────────────────────

export function buildPlan(config: ExamConfig): ExamPlan {
  const blueprint = blueprintFor(config.subject, config.level);
  const official = Boolean(blueprint) && isFullPaperType(config.examType);
  const kiswahili = config.language === "Kiswahili";
  const aLevel = /a-?level/i.test(config.level);

  const shapes: Shape[] = official
    ? scaleSections(blueprint!, config.totalMarks).map((s) => ({
        name: s.name,
        marks: s.marks,
        perQuestion: s.perQuestionMarks,
        formats: s.formats,
        choice: s.choice,
        note: s.note,
      }))
    : customShapes(config);

  // 1. Questions and marks, section by section.
  let number = 0;
  const sections: PlanSection[] = shapes.map((shape) => {
    const items: PlanItem[] = [];
    const objectiveOnly = shape.formats.every(isObjectiveFormat) || shape.perQuestion === 1;
    if (objectiveOnly) {
      for (const { format, count } of objectiveSplit(shape.marks, shape.formats)) {
        for (let left = count; left > 0; left -= MAX_PARTS) {
          const parts = Math.min(MAX_PARTS, left);
          items.push({ number: String(++number), format, marks: parts, parts, topics: [ANY_TOPIC], bloom: "Remember", difficulty: "Moderate" });
        }
      }
    } else {
      const answered = shape.choice?.answer ?? Math.max(1, Math.round(shape.marks / shape.perQuestion));
      const printed = shape.choice?.of ?? answered;
      const per = Math.max(1, Math.floor(shape.marks / answered));
      const extra = shape.choice ? 0 : shape.marks - per * answered;
      for (let i = 0; i < printed; i++) {
        const marks = per + (i < extra ? 1 : 0);
        items.push({ number: String(++number), format: writtenFormat(shape, marks, i), marks, parts: 0, topics: [ANY_TOPIC], bloom: "Apply", difficulty: "Moderate" });
      }
    }
    const choose = shape.choice && shape.choice.answer < items.length ? shape.choice.answer : undefined;
    return {
      name: kiswahili ? shape.name.replace("SECTION", "SEHEMU") : shape.name,
      instructions: sectionInstructions(choose, items.length, kiswahili),
      choose,
      note: shape.note,
      items,
    };
  });

  // A tiny paper can leave a section with no questions at all.
  for (let i = sections.length - 1; i >= 0; i--) if (!sections[i].items.length) sections.splice(i, 1);

  // 2. Make the paper total exact: optional sections round down, so the
  //    difference goes to the compulsory written questions.
  let drift = config.totalMarks - sections.reduce((n, s) => n + planSectionMarks(s), 0);
  const adjustable = sections.filter((s) => !s.choose).flatMap((s) => s.items.filter((i) => i.parts === 0));
  const fallback = sections.filter((s) => !s.choose).flatMap((s) => s.items);
  const pool = adjustable.length ? adjustable : fallback;
  for (let k = 0; drift !== 0 && pool.length && k < 400; k++) {
    const item = pool[k % pool.length];
    const step = drift > 0 ? 1 : -1;
    if (item.marks + step < 1) continue;
    item.marks += step;
    if (item.parts > 0) item.parts += step;
    drift -= step;
  }

  // 3. Topics: the biggest questions first, each from a different part of the syllabus.
  const topicPool = topicPoolFor(config);
  if (topicPool.length) {
    const order = spreadOrder(topicPool.length);
    let cursor = 0;
    const next = () => topicPool[order[cursor++ % order.length]];
    const byWeight = sections.flatMap((s) => s.items).sort((a, b) => b.marks - a.marks);
    for (const item of byWeight) {
      const want = item.parts > 0 ? Math.min(4, item.parts, topicPool.length) : 1;
      item.topics = [...new Set(Array.from({ length: want }, next))];
    }
  }

  // 4. Thinking level and difficulty.
  const shift = /very easy|^easy/i.test(config.difficulty) ? -1 : /difficult/i.test(config.difficulty) ? 1 : 0;
  for (const section of sections) {
    const levels = difficulties(section.items.length, config.difficulty);
    section.items.forEach((item, i) => {
      const ladder = item.format === "Essay" && aLevel ? A_LEVEL_ESSAY : BLOOM_LADDER[item.format] ?? ["Understand"];
      const base = ladder[i % ladder.length];
      item.bloom = item.parts > 0 ? base : shiftBloom(base, shift);
      // Optional questions are alternatives of equal standard.
      item.difficulty = section.choose ? "Moderate" : levels[i];
    });
  }

  const materials = official ? blueprint!.materials : blueprint?.materials ?? [];
  const useOfficialRubric = official && !kiswahili && config.totalMarks === 100 && blueprint!.rubric?.length;
  return {
    subject: config.subject,
    level: config.level,
    form: config.form,
    examType: config.examType,
    language: config.language,
    durationMinutes: config.durationMinutes,
    totalMarks: config.totalMarks,
    official,
    materials,
    rubric: useOfficialRubric ? blueprint!.rubric! : paperRubric(sections, materials, kiswahili),
    guidance: blueprint ? [...blueprint.guidance, ...blueprint.notes] : [],
    topicPool,
    sections,
  };
}

/**
 * Warnings about a plan a teacher has edited, before anything is written:
 * marks that no longer add up, an optional section with unequal choices, too
 * little time.
 */
export function planWarnings(plan: ExamPlan): string[] {
  const warnings: string[] = [];
  const total = planTotalMarks(plan);
  if (total !== plan.totalMarks) warnings.push(`The questions add up to ${total} marks, not ${plan.totalMarks}.`);
  for (const s of plan.sections) {
    if (s.choose && new Set(s.items.map((i) => i.marks)).size > 1) {
      warnings.push(`${s.name}: candidates choose questions, so every question should carry the same marks.`);
    }
  }
  const minutesPerMark = plan.durationMinutes / Math.max(1, plan.totalMarks);
  if (minutesPerMark < 0.9) {
    warnings.push(`${plan.durationMinutes} minutes for ${plan.totalMarks} marks is tight: national papers allow about 1.8 minutes a mark.`);
  }
  return warnings;
}
