import { test } from "node:test";
import assert from "node:assert/strict";

import {
  sectionEffectiveMarks,
  examEffectiveMarks,
  normalizeExam,
  validateExam,
  latexToPlain,
  extractExamJson,
  makeVariant,
  type Exam,
  type ExamSection,
} from "../src/lib/exams";
import {
  blueprintFor,
  scaleSections,
  examStructureGoverned,
  isFullPaperType,
} from "../src/lib/examBlueprints";
import { analyzeExam, moderateExam } from "../src/lib/examAnalytics";
import { renderFigurePng } from "../src/lib/figureImage";

// ── helpers ─────────────────────────────────────────────────────────
function q(number: string, marks: number, extra: Record<string, unknown> = {}) {
  return { number, type: "Structured", marks, bloom: "Understand", difficulty: "Medium", text: `Q${number}`, answer: "A full model answer with a mark breakdown.", ...extra } as Exam["sections"][number]["questions"][number];
}
function section(name: string, questions: ReturnType<typeof q>[], extra: Partial<ExamSection> = {}): ExamSection {
  return { name, instructions: "", marks: 0, questions, ...extra } as ExamSection;
}
function exam(sections: ExamSection[], overrides: Partial<Exam> = {}): Exam {
  return {
    title: "Test Paper", subject: "History", level: "A-Level", form: "Form VI", examType: "Mock Exam",
    durationMinutes: 180, totalMarks: 100, language: "English", instructions: [], sections, ...overrides,
  } as Exam;
}

// ── effective marks ─────────────────────────────────────────────────
test("compulsory section is worth the sum of its questions", () => {
  const s = section("A", [q("1", 10), q("2", 10), q("3", 10)]);
  assert.equal(sectionEffectiveMarks(s), 30);
});

test("choice section is worth its best `choose` questions, not the printed sum", () => {
  const s = section("B", [q("1", 20), q("2", 20), q("3", 20), q("4", 20)], { choose: 2, instructions: "Answer any two." });
  assert.equal(sectionEffectiveMarks(s), 40);
});

test("examEffectiveMarks sums sections choice-aware", () => {
  const e = exam([
    section("A", [q("1", 10), q("2", 10), q("3", 10)]),
    section("B", [q("4", 20), q("5", 20), q("6", 20), q("7", 20), q("8", 20), q("9", 20)], { choose: 3, instructions: "Answer any three." }),
  ]);
  assert.equal(examEffectiveMarks(e), 30 + 60);
});

// ── normalizeExam ───────────────────────────────────────────────────
test("normalizeExam recomputes compulsory section marks and the paper total", () => {
  const e = exam([section("A", [q("1", 30), q("2", 28)], { marks: 60 })], { totalMarks: 100 });
  const { exam: fixed, issues } = normalizeExam(e);
  assert.equal(fixed.sections[0].marks, 58);
  assert.equal(fixed.totalMarks, 58);
  assert.ok(issues.some((i) => i.level === "fixed" && /58/.test(i.message)));
});

test("normalizeExam keeps a choice section at its earned total and reports no false mismatch", () => {
  const e = exam([
    section("A", [q("1", 10), q("2", 10), q("3", 10)], { marks: 30, instructions: "Answer all." }),
    section("B", [q("4", 20), q("5", 20), q("6", 20), q("7", 20)], { choose: 3, marks: 60, instructions: "Answer any three." }),
  ], { totalMarks: 90 });
  const { exam: fixed, issues } = normalizeExam(e);
  assert.equal(fixed.sections[1].marks, 60);
  assert.equal(fixed.totalMarks, 90);
  assert.equal(issues.filter((i) => i.level === "fixed").length, 0);
});

// ── validateExam (not-answerable guard) ─────────────────────────────
test("validateExam flags MCQs without exactly 4 options, blank options and missing schemes", () => {
  const e = exam([section("A", [
    q("1", 1, { type: "Multiple Choice", options: ["a", "b"], answer: "A" }),
    q("2", 1, { type: "Multiple Choice", options: ["a", "b", "c", ""], answer: "B" }),
    q("3", 9, { type: "Essay", answer: "" }),
    q("4", 9, { type: "Essay", answer: "ok" }),
  ])]);
  const msgs = validateExam(e).map((i) => i.message).join(" | ");
  assert.match(msgs, /do not have exactly 4 options/);
  assert.match(msgs, /blank answer option/);
  assert.match(msgs, /missing or placeholder marking scheme/);
  assert.match(msgs, /very short marking scheme/);
});

test("validateExam passes a clean paper and exempts short objective answers", () => {
  const e = exam([section("A", [
    q("1", 1, { type: "Multiple Choice", options: ["a", "b", "c", "d"], answer: "C" }),
    q("2", 1, { type: "True/False", answer: "True" }),
    q("3", 10, { type: "Structured", answer: "Step-by-step model answer worth ten marks." }),
  ])]);
  assert.equal(validateExam(e).length, 0);
});

// ── latexToPlain ────────────────────────────────────────────────────
test("latexToPlain preserves functions and never leaves a stray backslash", () => {
  const out = latexToPlain("$\\sin\\theta + \\cos\\theta = \\frac{1}{2}$");
  assert.match(out, /sin/);
  assert.match(out, /cos/);
  assert.match(out, /θ/);
  assert.ok(out.includes("(1)/(2)"));
  assert.ok(!out.includes("\\"));
});

test("latexToPlain keeps matrix contents instead of deleting them", () => {
  const out = latexToPlain("$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$");
  assert.match(out, /1/);
  assert.match(out, /4/);
  assert.ok(!out.includes("\\"));
});

// ── extractExamJson ─────────────────────────────────────────────────
test("extractExamJson handles code fences and surrounding prose", () => {
  assert.deepEqual(extractExamJson("```json\n{\"a\":1}\n```"), { a: 1 });
  assert.deepEqual(extractExamJson("Here you go: {\"b\":2} — done."), { b: 2 });
});

// ── makeVariant ─────────────────────────────────────────────────────
test("makeVariant A is identity; B renumbers continuously and preserves question count", () => {
  const e = exam([
    section("A", [q("1", 10), q("2", 10)]),
    section("B", [q("3", 10), q("4", 10)]),
  ]);
  assert.equal(makeVariant(e, "A"), e);
  const b = makeVariant(e, "B");
  const nums = b.sections.flatMap((s) => s.questions.map((x) => x.number));
  assert.deepEqual(nums, ["1", "2", "3", "4"]);
  assert.equal(b.sections.flatMap((s) => s.questions).length, 4);
});

// ── blueprints ──────────────────────────────────────────────────────
test("Basic Mathematics blueprint has no multiple-choice section", () => {
  const bp = blueprintFor("Basic Mathematics", "O-Level");
  assert.ok(bp);
  assert.equal(bp!.family, "mathematics");
  const formats = bp!.sections.flatMap((s) => s.formats).join(",");
  assert.ok(!/Multiple Choice/.test(formats));
});

test("Basic Mathematics carries the authentic CSEE rubric (working shown, tables/graphs, constants)", () => {
  const bp = blueprintFor("Basic Mathematics", "O-Level", "Form IV");
  assert.ok(bp);
  const rubric = (bp!.rubric ?? []).join(" ");
  assert.match(rubric, /working/i);
  assert.match(rubric, /graph papers/i);
  assert.match(rubric, /22\}\{7\}|22.?7/); // pi = 22/7
});

test("A-Level Advanced Mathematics has a compulsory section and an optional (choice) section", () => {
  const bp = blueprintFor("Advanced Mathematics", "A-Level");
  assert.ok(bp);
  assert.equal(bp!.level, "A-Level");
  assert.ok(bp!.sections.some((s) => s.choice));
});

test("unknown subject has no blueprint", () => {
  assert.equal(blueprintFor("Underwater Basket Weaving", "O-Level"), undefined);
});

test("scaleSections always reconciles section marks to the requested total", () => {
  for (const subject of ["Biology", "Basic Mathematics", "History"]) {
    for (const total of [30, 47, 50, 90, 100, 133]) {
      const bp = blueprintFor(subject, subject === "Basic Mathematics" ? "O-Level" : "A-Level")!;
      const sum = scaleSections(bp, total).reduce((n, s) => n + s.marks, 0);
      assert.equal(sum, total, `${subject} @ ${total}`);
    }
  }
});

test("examStructureGoverned only for full-paper exam types on known subjects", () => {
  assert.ok(isFullPaperType("Final Examination"));
  assert.ok(!isFullPaperType("Quiz"));
  assert.ok(examStructureGoverned("Biology", "O-Level", "Final Examination"));
  assert.ok(!examStructureGoverned("Biology", "O-Level", "Quiz"));
  assert.ok(!examStructureGoverned("Unknown Subject", "O-Level", "Final Examination"));
});

// ── analytics / moderation (choice-aware) ───────────────────────────
test("analyzeExam reports effective marks and keeps HOTS% at or below 100", () => {
  const e = exam([
    section("A", [q("1", 10, { bloom: "Apply" }), q("2", 10, { bloom: "Apply" }), q("3", 10, { bloom: "Apply" })], { instructions: "Answer all." }),
    section("B", [q("4", 20, { bloom: "Evaluate" }), q("5", 20, { bloom: "Evaluate" }), q("6", 20, { bloom: "Evaluate" }), q("7", 20, { bloom: "Evaluate" }), q("8", 20, { bloom: "Evaluate" }), q("9", 20, { bloom: "Evaluate" })], { choose: 3, instructions: "Answer any three." }),
  ], { totalMarks: 90 });
  const a = analyzeExam(normalizeExam(e).exam);
  assert.equal(a.computedMarks, 90);
  assert.equal(a.printedMarks, 150);
  assert.ok(a.hotsPercent <= 100);
});

test("moderateExam raises no marks-mismatch warning on a well-formed choice paper", () => {
  const e = exam([
    section("A", [q("1", 10), q("2", 10), q("3", 10)], { instructions: "Answer all." }),
    section("B", [q("4", 20), q("5", 20), q("6", 20), q("7", 20)], { choose: 3, instructions: "Answer any three." }),
  ], { totalMarks: 90 });
  const mod = moderateExam(normalizeExam(e).exam);
  assert.ok(!mod.some((m) => m.level === "warn" && /don't match|declares/.test(m.message)));
});

// ── figure rasteriser ───────────────────────────────────────────────
test("renderFigurePng produces a valid PNG for a bar chart and null for a table", () => {
  const png = renderFigurePng({ type: "barchart", caption: "x", labels: ["A", "B"], values: [3, 7] });
  assert.ok(png);
  assert.equal(png!.data[0], 0x89);
  assert.equal(png!.data[1], 0x50);
  assert.ok(png!.data.length > 100);
  assert.equal(renderFigurePng({ type: "table", caption: "", headers: ["a"], rows: [["1"]] }), null);
});
