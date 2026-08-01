/**
 * Official NECTA/TIE paper blueprints for the flagship subjects.
 *
 * The exam generator's prompt used to invent its own section layout, so a
 * "Final Examination" for Basic Mathematics or Biology looked nothing like the
 * real national paper. These blueprints encode the authentic CSEE structure —
 * section architecture, marks weighting, question types and answer rules — taken
 * from the approved NECTA CSEE formats and recent past papers, and are fed into
 * the prompt so generated papers mirror the real exam.
 *
 * Sources (CSEE):
 *  - Basic Mathematics (041): Section A = 10 × 6 marks, Section B = 4 × 10 marks,
 *    all compulsory, 3 hours, 100 marks, calculator + NECTA tables allowed.
 *  - Biology (032): Section A objective (10 multiple-choice + 6 matching = 16),
 *    Section B = 6 short-answer/structured (54), Section C = essays, answer 2 of
 *    3 (30), 3 hours, 100 marks.
 */

export interface BlueprintSection {
  name: string; // "SECTION A"
  /** Fraction of the paper's marks carried by this section (weights sum to 1). */
  marksShare: number;
  /** Canonical marks per question at the full 100-mark paper. */
  perQuestionMarks: number;
  /** Question formats authentic to this section, in the app's format vocabulary. */
  formats: string[];
  /** Answer-all vs a choice (e.g. "answer 2 of 3"). */
  choice?: { answer: number; of: number };
  /** One-line description of what candidates do in this section. */
  note: string;
}

export interface ExamBlueprint {
  subject: string;
  level: string;
  canonicalMarks: number;
  canonicalMinutes: number;
  sections: BlueprintSection[];
  materials: string[];
  notes: string[];
}

const BASIC_MATHEMATICS: ExamBlueprint = {
  subject: "Basic Mathematics",
  level: "O-Level",
  canonicalMarks: 100,
  canonicalMinutes: 180,
  sections: [
    {
      name: "SECTION A",
      marksShare: 0.6,
      perQuestionMarks: 6,
      formats: ["Short Answer", "Structured"],
      note: "Short/structured computation questions, all compulsory. Show full working.",
    },
    {
      name: "SECTION B",
      marksShare: 0.4,
      perQuestionMarks: 10,
      formats: ["Structured"],
      note: "Longer structured problems (often multi-part a/b/c), all compulsory.",
    },
  ],
  materials: ["Non-programmable calculator", "NECTA four-figure mathematical tables"],
  notes: [
    "The real CSEE Basic Mathematics paper has NO multiple-choice section — every item requires shown working.",
    "All working must be clearly shown; award method marks in the scheme, not just the final answer.",
    "State units where applicable and give answers to the required degree of accuracy.",
  ],
};

const BIOLOGY: ExamBlueprint = {
  subject: "Biology",
  level: "O-Level",
  canonicalMarks: 100,
  canonicalMinutes: 180,
  sections: [
    {
      name: "SECTION A",
      marksShare: 0.16,
      perQuestionMarks: 1,
      formats: ["Multiple Choice", "Matching"],
      note: "Objective items: one multiple-choice question of ~10 items and one matching question of ~6 items, 1 mark each. Compulsory.",
    },
    {
      name: "SECTION B",
      marksShare: 0.54,
      perQuestionMarks: 9,
      formats: ["Short Answer", "Structured"],
      note: "Short-answer/structured questions including labelled biological diagrams. Compulsory.",
    },
    {
      name: "SECTION C",
      marksShare: 0.3,
      perQuestionMarks: 15,
      formats: ["Essay"],
      choice: { answer: 2, of: 3 },
      note: "Extended essay questions — set 3, candidates answer 2 (15 marks each).",
    },
  ],
  materials: [],
  notes: [
    "Biological diagrams must be large, drawn with a pencil, and fully labelled with straight ruled label lines.",
    "Essays should be structured with an introduction, well-developed points and a conclusion.",
  ],
};

const BLUEPRINTS: ExamBlueprint[] = [BASIC_MATHEMATICS, BIOLOGY];

/** Exam types that mirror a full national paper (apply the blueprint strictly). */
const FULL_PAPER_TYPES = new Set([
  "Terminal Exam",
  "Mock Exam",
  "Pre-National Exam",
  "Final Examination",
]);

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** Find the official blueprint for a subject/level, if one is authored. */
export function blueprintFor(subject: string, level: string): ExamBlueprint | undefined {
  const s = norm(subject);
  const l = norm(level);
  return BLUEPRINTS.find((b) => norm(b.subject) === s && (!l || norm(b.level) === l));
}

export function isFullPaperType(examType: string): boolean {
  return FULL_PAPER_TYPES.has(examType);
}

export interface ScaledSection extends BlueprintSection {
  /** Marks for this section scaled to the requested total (reconciled to sum). */
  marks: number;
  /** Approximate number of questions to set to hit the section marks. */
  approxQuestions: number;
}

/**
 * Scale a blueprint's section weights to the requested total marks and reconcile
 * rounding so section marks sum exactly to `totalMarks`.
 */
export function scaleSections(blueprint: ExamBlueprint, totalMarks: number): ScaledSection[] {
  const raw = blueprint.sections.map((sec) => ({ sec, exact: totalMarks * sec.marksShare }));
  const scaled = raw.map(({ sec, exact }) => ({ ...sec, marks: Math.round(exact), approxQuestions: 0 }));

  // Reconcile rounding drift onto the largest section so marks sum to total.
  const drift = totalMarks - scaled.reduce((n, s) => n + s.marks, 0);
  if (drift !== 0) {
    const largest = scaled.reduce((a, b) => (b.marks > a.marks ? b : a));
    largest.marks += drift;
  }

  for (const s of scaled) {
    s.approxQuestions = Math.max(1, Math.round(s.marks / s.perQuestionMarks));
  }
  return scaled;
}

/**
 * Render the blueprint as a prompt block. When the exam type is a full national
 * paper we instruct the model to follow the structure exactly; otherwise we pass
 * it as authentic house style to imitate where it fits the requested setup.
 */
export function blueprintPromptBlock(
  subject: string,
  level: string,
  examType: string,
  totalMarks: number,
): string | null {
  const blueprint = blueprintFor(subject, level);
  if (!blueprint) return null;

  const strict = isFullPaperType(examType);
  const scaled = scaleSections(blueprint, totalMarks);

  const lines: string[] = [];
  lines.push(
    strict
      ? `OFFICIAL NECTA PAPER STRUCTURE for ${blueprint.subject} (${blueprint.level}) — REPRODUCE THIS EXACTLY:`
      : `AUTHENTIC NECTA PAPER STRUCTURE for ${blueprint.subject} (${blueprint.level}) — follow this house style as closely as the requested setup allows:`,
  );

  for (const s of scaled) {
    const choice = s.choice ? ` (set ${s.choice.of} questions, candidates answer ${s.choice.answer})` : " (all compulsory)";
    lines.push(
      `- ${s.name}: ${s.marks} marks — about ${s.approxQuestions} question(s) of ~${s.perQuestionMarks} marks each${choice}. ` +
        `Question type(s): ${s.formats.join(", ")}. ${s.note}`,
    );
  }

  if (blueprint.materials.length) {
    lines.push(`Permitted materials: ${blueprint.materials.join(", ")}.`);
  }
  for (const n of blueprint.notes) lines.push(`- ${n}`);

  lines.push(
    strict
      ? `Keep these exact sections and question types. Scale the number of questions per section to make section marks sum to ${totalMarks}, preserving the relative weighting above.`
      : `Where the requested formats and marks allow, mirror this section layout and these conventions.`,
  );

  return lines.join("\n");
}
