/**
 * Official NECTA/TIE paper blueprints + subject-family examining rules, for both
 * O-Level (CSEE) and A-Level (ACSEE).
 *
 * A maths paper is examined nothing like a language paper, which is examined
 * nothing like a book-keeping paper — and an A-Level paper is examined nothing
 * like the O-Level one. The generator used one generic prompt for all of them,
 * so papers came out structurally wrong. This module encodes:
 *
 *   1. Subject FAMILIES (mathematics, sciences, languages, humanities,
 *      business, general) — each with the section architecture (per level),
 *      permitted materials and the EXAMINING GUIDANCE that makes that family
 *      distinct (working shown vs. labelled diagrams vs. ledgers vs. essays).
 *   2. SPECIFIC blueprints for subjects whose real structure is authenticated
 *      (Basic Mathematics, Biology, English, Book-Keeping, Commerce, Advanced
 *      Mathematics), which override the family default.
 *
 * Confirmed CSEE (O-Level) structures:
 *  - Basic Mathematics (041): A = 10 × 6, B = 4 × 10, all compulsory, NO MCQ.
 *  - Biology (032): A objective (10 MCQ + 6 matching = 16), B = 6 × 9 (54),
 *    C essays answer 2 of 3 (30).
 *  - English Language (022): A objective 16, B language-use 6 × 9 (54),
 *    C composition + literature, answer 2 (30).
 *  - Book-Keeping (062): A = 15 MCQ + 5 matching (20), B = 4 × 10 (40),
 *    C = 3 structured × 20, answer 2 (40).
 *  - Commerce (061): A = 10 MCQ + 10 matching (20), B = 4 × 10 (40),
 *    C essays answer 2 (40).
 *
 * Confirmed ACSEE (A-Level) structure:
 *  - Advanced Mathematics (142): Paper 1 = 10 compulsory × 10; Paper 2 =
 *    Section A 4 × 15 (compulsory) + Section B 4 × 20 (answer 2). A-Level papers
 *    generally drop multiple-choice in favour of compulsory structured Section A
 *    plus an optional essay/structured Section B where candidates choose.
 */

export type SubjectFamily =
  | "mathematics"
  | "sciences"
  | "languages"
  | "humanities"
  | "business"
  | "general";

export interface BlueprintSection {
  name: string; // "SECTION A"
  /** Fraction of the paper's marks carried by this section (weights sum to 1). */
  marksShare: number;
  /** Canonical marks per question at the full 100-mark paper. */
  perQuestionMarks: number;
  /** Question formats authentic to this section, in the app's format vocabulary. */
  formats: string[];
  /** Answer-all vs a choice (e.g. "answer 2 of 4"). */
  choice?: { answer: number; of: number };
  /** One-line description of what candidates do in this section. */
  note: string;
}

export interface ExamBlueprint {
  subject: string;
  level: string;
  family: SubjectFamily;
  canonicalMarks: number;
  canonicalMinutes: number;
  sections: BlueprintSection[];
  materials: string[];
  /** Resolved examining guidance (family + level) shown to the model. */
  guidance: string[];
  /** Extra rubric notes specific to this exact subject. */
  notes: string[];
  /** Authentic candidate instructions to place in the paper's instructions[]. */
  rubric?: string[];
}

// ── Family profiles: how each subject family is examined ────────────
interface FamilyProfile {
  /** O-Level (CSEE) section architecture. */
  sections: BlueprintSection[];
  /** A-Level (ACSEE) section architecture, if it differs. */
  aLevelSections?: BlueprintSection[];
  materials: string[];
  /** The examining conventions + marking style that make this family distinct. */
  guidance: string[];
}

const OBJECTIVE_A: BlueprintSection = {
  name: "SECTION A",
  marksShare: 0.16,
  perQuestionMarks: 1,
  formats: ["Multiple Choice", "Matching"],
  note: "Objective items: one multiple-choice question (~10 items) and one matching question (~6 items), 1 mark each. Compulsory.",
};

/** Shared A-Level conventions appended to every family's guidance at A-Level. */
const A_LEVEL_GUIDANCE: string[] = [
  "This is an A-Level (ACSEE) paper: pitch it at Form V–VI standard with a strong emphasis on application, analysis and evaluation, not recall.",
  "A-Level papers rarely use multiple-choice — prefer structured and essay questions, with a compulsory Section A and an optional Section B where candidates choose which questions to answer.",
  "Many A-Level subjects are examined across two papers; produce one coherent, self-contained paper for the requested marks.",
];

const FAMILY: Record<SubjectFamily, FamilyProfile> = {
  mathematics: {
    sections: [
      { name: "SECTION A", marksShare: 0.6, perQuestionMarks: 6, formats: ["Short Answer", "Structured"], note: "Short/structured computation questions, all compulsory. Show full working." },
      { name: "SECTION B", marksShare: 0.4, perQuestionMarks: 10, formats: ["Structured"], note: "Longer multi-part structured problems, all compulsory." },
    ],
    aLevelSections: [
      { name: "SECTION A", marksShare: 0.6, perQuestionMarks: 15, formats: ["Structured"], note: "Compulsory structured questions, all answered." },
      { name: "SECTION B", marksShare: 0.4, perQuestionMarks: 20, formats: ["Structured"], choice: { answer: 2, of: 4 }, note: "Optional structured questions — set 4, candidates answer 2." },
    ],
    materials: ["Non-programmable calculator", "NECTA four-figure mathematical tables"],
    guidance: [
      "Mathematics is examined by problem-solving, not recall — every item requires computation with full working shown.",
      "There is NO multiple-choice or matching section in the national Mathematics paper; do not add one.",
      "Write ALL mathematics in LaTeX (fractions $\\frac{a}{b}$, powers $x^{2}$, roots $\\sqrt{x}$, $\\times$, $\\div$, $\\pm$, $\\leq$, $\\geq$). Never write maths as plain ASCII.",
      "Marking schemes MUST award method marks: give the step-by-step solution and mark each stage (correct substitution, correct manipulation, correct final answer with units).",
      "Assume a non-programmable calculator and NECTA four-figure mathematical tables are available.",
    ],
  },
  sciences: {
    sections: [
      OBJECTIVE_A,
      { name: "SECTION B", marksShare: 0.54, perQuestionMarks: 9, formats: ["Short Answer", "Structured"], note: "Short-answer/structured questions including labelled diagrams and experiments. Compulsory." },
      { name: "SECTION C", marksShare: 0.3, perQuestionMarks: 15, formats: ["Essay"], choice: { answer: 2, of: 3 }, note: "Extended essay questions — set 3, candidates answer 2." },
    ],
    aLevelSections: [
      { name: "SECTION A", marksShare: 0.4, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Compulsory structured questions covering the breadth of the syllabus." },
      { name: "SECTION B", marksShare: 0.6, perQuestionMarks: 20, formats: ["Structured", "Essay"], choice: { answer: 3, of: 5 }, note: "Optional in-depth structured/essay questions — set 5, candidates answer 3." },
    ],
    materials: [],
    guidance: [
      "Sciences use an objective Section A, a structured Section B and an essay Section C (O-Level); at A-Level, structured Section A and in-depth Section B with choice.",
      "Include labelled diagrams where relevant; state that diagrams are drawn in pencil and fully labelled with ruled lines.",
      "Require correct SI units, precise definitions of key terms and, where relevant, experimental procedure (apparatus, method, observation, conclusion).",
      "Balance recall with application and analysis; marking schemes list the acceptable points and the mark for each.",
    ],
  },
  languages: {
    sections: [
      OBJECTIVE_A,
      { name: "SECTION B", marksShare: 0.54, perQuestionMarks: 9, formats: ["Short Answer", "Structured"], note: "Comprehension, summary/note-making and grammar/language-use questions. Compulsory." },
      { name: "SECTION C", marksShare: 0.3, perQuestionMarks: 15, formats: ["Essay"], choice: { answer: 2, of: 3 }, note: "Extended writing: guided composition/essay and literature (set-book) questions — candidates choose." },
    ],
    aLevelSections: [
      { name: "SECTION A", marksShare: 0.4, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Compulsory comprehension and language-use questions." },
      { name: "SECTION B", marksShare: 0.6, perQuestionMarks: 20, formats: ["Essay"], choice: { answer: 3, of: 6 }, note: "Composition and literature/analysis essays — candidates choose." },
    ],
    materials: [],
    guidance: [
      "Language papers test comprehension, summary, grammar/language-use and composition — NOT numeric problem-solving.",
      "Section B (O-Level) covers comprehension passages, summary/note-making and grammar (tenses, articles, direct/indirect speech, active/passive).",
      "Extended writing and literature (set-book) questions are offered with candidate choice.",
      "Marking schemes describe expected content, organisation and language accuracy rather than a single correct answer.",
    ],
  },
  humanities: {
    sections: [
      { ...OBJECTIVE_A, marksShare: 0.2, note: "Objective items: multiple-choice (~10) and matching (~10), 1 mark each. Compulsory." },
      { name: "SECTION B", marksShare: 0.4, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Short-answer/structured questions. Compulsory." },
      { name: "SECTION C", marksShare: 0.4, perQuestionMarks: 20, formats: ["Essay"], choice: { answer: 2, of: 4 }, note: "Essay questions — set several, candidates answer two." },
    ],
    aLevelSections: [
      { name: "SECTION A", marksShare: 0.3, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Compulsory short/structured questions." },
      { name: "SECTION B", marksShare: 0.7, perQuestionMarks: 20, formats: ["Essay"], choice: { answer: 3, of: 6 }, note: "Analytical essays — set 6, candidates answer 3." },
    ],
    materials: [],
    guidance: [
      "History, Geography and Civics use an objective Section A, short-answer Section B and essay Section C (O-Level); essays dominate at A-Level.",
      "Essays must be structured with a clear introduction, well-argued points supported by examples, and a conclusion.",
      "Geography additionally requires map reading, sketch maps and simple statistics (graphs and calculations).",
      "Marking schemes credit relevant points and the use of evidence.",
    ],
  },
  business: {
    sections: [
      { ...OBJECTIVE_A, marksShare: 0.2, note: "Objective items: multiple-choice (~10-15) and matching (~5-10), 1 mark each. Compulsory." },
      { name: "SECTION B", marksShare: 0.4, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Short-answer/structured questions; at least one is a calculation or drawing. Compulsory." },
      { name: "SECTION C", marksShare: 0.4, perQuestionMarks: 20, formats: ["Structured", "Essay"], choice: { answer: 2, of: 3 }, note: "Longer structured/essay questions — candidates answer two." },
    ],
    aLevelSections: [
      { name: "SECTION A", marksShare: 0.4, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Compulsory short/structured questions including computations." },
      { name: "SECTION B", marksShare: 0.6, perQuestionMarks: 20, formats: ["Structured", "Essay"], choice: { answer: 3, of: 5 }, note: "Optional structured/essay questions — set 5, candidates answer 3." },
    ],
    materials: ["Non-programmable calculator"],
    guidance: [
      "Book-Keeping, Commerce, Accountancy and Economics require computations: ledger (T-)accounts, trial balance and final accounts (trading, profit & loss, balance sheet).",
      "Present accounts in correct format with dates, particulars, folio and amount columns; show all workings.",
      "Include at least one calculation or drawing question alongside short-answer or essay items.",
      "Marking schemes award marks for correct entries, correct totals and correct format.",
    ],
  },
  general: {
    sections: [
      { ...OBJECTIVE_A, marksShare: 0.2, note: "Objective items: multiple-choice and matching, 1 mark each. Compulsory." },
      { name: "SECTION B", marksShare: 0.5, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Short-answer/structured questions. Compulsory." },
      { name: "SECTION C", marksShare: 0.3, perQuestionMarks: 15, formats: ["Essay"], choice: { answer: 2, of: 3 }, note: "Essay questions — candidates answer two." },
    ],
    aLevelSections: [
      { name: "SECTION A", marksShare: 0.4, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Compulsory general-knowledge/structured questions." },
      { name: "SECTION B", marksShare: 0.6, perQuestionMarks: 20, formats: ["Essay"], choice: { answer: 3, of: 6 }, note: "Critical-thinking essays — candidates choose." },
    ],
    materials: [],
    guidance: [
      "Use a compulsory objective/short Section A and an essay Section C/B appropriate to the subject.",
      "Marking schemes list acceptable points with the mark for each.",
    ],
  },
};

// ── Subject → family map (covers the app's O- and A-Level subjects) ──
const SUBJECT_FAMILY: Record<string, SubjectFamily> = {
  "basic mathematics": "mathematics",
  "advanced mathematics": "mathematics",
  biology: "sciences",
  chemistry: "sciences",
  physics: "sciences",
  "english language": "languages",
  kiswahili: "languages",
  history: "humanities",
  geography: "humanities",
  civics: "humanities",
  "general studies": "general",
  commerce: "business",
  "book-keeping": "business",
  accountancy: "business",
  economics: "business",
  "information & computer studies": "general",
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function isALevel(level: string): boolean {
  return /a-?level|form\s*(v|vi|5|6)/i.test(level);
}

export function familyFor(subject: string): SubjectFamily | undefined {
  return SUBJECT_FAMILY[norm(subject)];
}

// ── Specific, authenticated blueprints (override the family default) ─
interface SpecificSpec {
  subject: string;
  level: string;
  family: SubjectFamily;
  sections: BlueprintSection[];
  materials?: string[];
  notes?: string[];
  rubric?: string[];
}

const SPECIFIC_SPECS: SpecificSpec[] = [
  {
    subject: "Basic Mathematics",
    level: "O-Level",
    family: "mathematics",
    sections: FAMILY.mathematics.sections,
    notes: ["State units where applicable and give answers to the required degree of accuracy."],
    rubric: [
      "This paper consists of two sections, A and B.",
      "Answer ALL questions in both sections.",
      "All necessary working and answers for each question must be shown clearly.",
      "Mathematical tables and graph papers may be used where necessary.",
      "Use $\\pi = \\frac{22}{7}$ and $R = 6370$ km where necessary.",
      "All communication devices and any unauthorised materials are not allowed in the examination room.",
    ],
  },
  {
    subject: "Biology",
    level: "O-Level",
    family: "sciences",
    sections: FAMILY.sciences.sections,
    notes: ["Biological diagrams must be large, drawn in pencil and fully labelled with straight ruled label lines."],
  },
  {
    subject: "English Language",
    level: "O-Level",
    family: "languages",
    sections: FAMILY.languages.sections,
    notes: ["Section C should offer a guided composition and a set-book literature question."],
  },
  {
    subject: "Book-Keeping",
    level: "O-Level",
    family: "business",
    sections: [
      { name: "SECTION A", marksShare: 0.2, perQuestionMarks: 1, formats: ["Multiple Choice", "Matching"], note: "Objective: ~15 multiple-choice + ~5 matching items, 1 mark each. Compulsory." },
      { name: "SECTION B", marksShare: 0.4, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Four short-answer/structured questions, all compulsory." },
      { name: "SECTION C", marksShare: 0.4, perQuestionMarks: 20, formats: ["Structured"], choice: { answer: 2, of: 3 }, note: "Three structured accounting questions (ledgers, trial balance, final accounts) — answer two." },
    ],
    materials: ["Non-programmable calculator"],
    notes: ["Present ledger accounts in correct T-account format; show the trial balance and final accounts where required."],
  },
  {
    subject: "Commerce",
    level: "O-Level",
    family: "business",
    sections: [
      { name: "SECTION A", marksShare: 0.2, perQuestionMarks: 1, formats: ["Multiple Choice", "Matching"], note: "Objective: ~10 multiple-choice + ~10 matching items, 1 mark each. Compulsory." },
      { name: "SECTION B", marksShare: 0.4, perQuestionMarks: 10, formats: ["Short Answer", "Structured"], note: "Four questions — one a calculation/drawing, three short-answer on commercial concepts. Compulsory." },
      { name: "SECTION C", marksShare: 0.4, perQuestionMarks: 20, formats: ["Essay"], choice: { answer: 2, of: 4 }, note: "Four essay questions — candidates answer two." },
    ],
  },
  {
    subject: "Advanced Mathematics",
    level: "A-Level",
    family: "mathematics",
    sections: [
      { name: "SECTION A", marksShare: 0.6, perQuestionMarks: 15, formats: ["Structured"], note: "Compulsory structured questions (Paper 2 style), all answered." },
      { name: "SECTION B", marksShare: 0.4, perQuestionMarks: 20, formats: ["Structured"], choice: { answer: 2, of: 4 }, note: "Optional structured questions — set 4, candidates answer 2." },
    ],
    materials: ["Non-programmable calculator", "NECTA mathematical tables"],
    notes: [
      "Paper 1 alternative is 10 compulsory questions of 10 marks each with no sections; Paper 2 uses the Section A/B structure above.",
      "Cover calculus (differentiation, integration), algebra, trigonometry, coordinate geometry, vectors, complex numbers, probability and statistics.",
    ],
  },
];

/** Exam types that mirror a full national paper (apply the blueprint strictly). */
const FULL_PAPER_TYPES = new Set(["Terminal Exam", "Mock Exam", "Pre-National Exam", "Final Examination"]);

export function isFullPaperType(examType: string): boolean {
  return FULL_PAPER_TYPES.has(examType);
}

function resolveGuidance(family: SubjectFamily, level: string): string[] {
  return isALevel(level) ? [...FAMILY[family].guidance, ...A_LEVEL_GUIDANCE] : FAMILY[family].guidance;
}

/**
 * The official blueprint for a subject/level: an authenticated specific paper if
 * one exists, otherwise one derived from the subject's family and level. Returns
 * undefined only for subjects outside the known catalogue.
 */
export function blueprintFor(subject: string, level: string): ExamBlueprint | undefined {
  const s = norm(subject);
  const l = norm(level);
  const aLevel = isALevel(level);

  const spec = SPECIFIC_SPECS.find((b) => norm(b.subject) === s && (!l || norm(b.level) === l));
  if (spec) {
    return {
      subject: spec.subject,
      level: spec.level,
      family: spec.family,
      canonicalMarks: 100,
      canonicalMinutes: 180,
      sections: spec.sections,
      materials: spec.materials ?? FAMILY[spec.family].materials,
      guidance: resolveGuidance(spec.family, spec.level),
      notes: spec.notes ?? [],
      rubric: spec.rubric,
    };
  }

  const fam = familyFor(subject);
  if (!fam) return undefined;
  const p = FAMILY[fam];
  const sections = aLevel && p.aLevelSections ? p.aLevelSections : p.sections;
  return {
    subject,
    level,
    family: fam,
    canonicalMarks: 100,
    canonicalMinutes: 180,
    sections,
    materials: p.materials,
    guidance: resolveGuidance(fam, level),
    notes: [],
  };
}

/** True when the blueprint should govern the paper's structure and formats. */
export function examStructureGoverned(subject: string, level: string, examType: string): boolean {
  return Boolean(blueprintFor(subject, level)) && isFullPaperType(examType);
}

export interface ScaledSection extends BlueprintSection {
  marks: number;
  approxQuestions: number;
}

/**
 * Scale a blueprint's section weights to the requested total marks and reconcile
 * rounding so section marks sum exactly to `totalMarks`.
 */
export function scaleSections(blueprint: ExamBlueprint, totalMarks: number): ScaledSection[] {
  const scaled = blueprint.sections.map((sec) => ({
    ...sec,
    marks: Math.round(totalMarks * sec.marksShare),
    approxQuestions: 0,
  }));

  const drift = totalMarks - scaled.reduce((n, s) => n + s.marks, 0);
  if (drift !== 0) {
    const largest = scaled.reduce((a, b) => (b.marks > a.marks ? b : a));
    largest.marks += drift;
  }
  for (const s of scaled) s.approxQuestions = Math.max(1, Math.round(s.marks / s.perQuestionMarks));
  return scaled;
}

/**
 * Render the blueprint + subject-family examining guidance as a prompt block.
 * Strict (full national paper) instructs the model to reproduce the structure
 * exactly; otherwise it is passed as authentic house style to imitate.
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

  if (blueprint.materials.length) lines.push(`Permitted materials: ${blueprint.materials.join(", ")}.`);

  if (blueprint.rubric?.length) {
    lines.push("", "Use these exact candidate instructions as the paper's instructions[] (the rubric):");
    for (const r of blueprint.rubric) lines.push(`- ${r}`);
  }

  lines.push("", `SUBJECT-SPECIFIC EXAMINING GUIDANCE (${blueprint.family}${isALevel(level) ? ", A-Level" : ""}):`);
  for (const g of blueprint.guidance) lines.push(`- ${g}`);
  for (const n of blueprint.notes) lines.push(`- ${n}`);

  lines.push(
    "",
    strict
      ? `Keep these exact sections and question types. Scale the number of questions per section so section marks sum to ${totalMarks}, preserving the relative weighting above. For sections where candidates choose, SET the stated number of questions but weight the section by the marks a candidate actually earns.`
      : `Where the requested formats and marks allow, mirror this section layout and these conventions.`,
  );

  return lines.join("\n");
}
