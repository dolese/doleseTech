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
  buildQuestionPrompt,
  parseReplacementQuestion,
  type Exam,
  type ExamSection,
  type ExamQuestion,
} from "../src/lib/exams";
import {
  blueprintFor,
  scaleSections,
  examStructureGoverned,
  isFullPaperType,
} from "../src/lib/examBlueprints";
import { analyzeExam, moderateExam } from "../src/lib/examAnalytics";
import { renderFigurePng } from "../src/lib/figureImage";
import { CHAT_MODELS, isAllowedModel, modelProvider } from "../src/lib/chatModels";
import { classifyAiError } from "../src/lib/aiErrors";

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
test("validateExam flags MCQs with too few/many options, blank options and missing schemes", () => {
  const e = exam([section("A", [
    q("1", 1, { type: "Multiple Choice", options: ["a", "b"], answer: "A" }),
    q("2", 1, { type: "Multiple Choice", options: ["a", "b", "c", ""], answer: "B" }),
    q("3", 9, { type: "Essay", answer: "" }),
    q("4", 9, { type: "Essay", answer: "ok" }),
  ])]);
  const msgs = validateExam(e).map((i) => i.message).join(" | ");
  assert.match(msgs, /do not have 4 or 5 options/);
  assert.match(msgs, /blank answer option/);
  assert.match(msgs, /missing or placeholder marking scheme/);
  assert.match(msgs, /very short marking scheme/);
});

test("validateExam accepts NECTA 4-option (A–D) and 5-option (A–E) MCQs", () => {
  const e = exam([section("A", [
    q("1", 1, { type: "Multiple Choice", options: ["a", "b", "c", "d"], answer: "C" }),
    q("2", 1, { type: "Multiple Choice", options: ["a", "b", "c", "d", "e"], answer: "E" }),
    q("3", 1, { type: "True/False", answer: "True" }),
    q("4", 10, { type: "Structured", answer: "Step-by-step model answer worth ten marks." }),
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
  const bp = blueprintFor("Basic Mathematics", "O-Level");
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

const hasMcq = (bp: NonNullable<ReturnType<typeof blueprintFor>>) => bp.sections.flatMap((s) => s.formats).includes("Multiple Choice");

test("Geography (O-Level) follows the CSEE 16/54/30 template with an objective Section A", () => {
  const bp = blueprintFor("Geography", "O-Level");
  assert.ok(bp);
  const scaled = scaleSections(bp!, 100).map((s) => s.marks);
  assert.deepEqual(scaled, [16, 54, 30]);
  assert.ok(hasMcq(bp!), "Geography Section A is objective (MCQ + matching)");
  assert.ok(bp!.sections.some((s) => s.choice && s.choice.answer === 2 && s.choice.of === 3), "Section C is answer 2 of 3");
  assert.match((bp!.rubric ?? []).join(" "), /eleven \(11\) questions/i);
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

// ── single-question regeneration ────────────────────────────────────
function regenReq(over: Record<string, unknown> = {}) {
  return {
    subject: "Basic Mathematics", level: "O-Level", form: "Form II",
    language: "English" as const, difficulty: "Balanced",
    sectionName: "SECTION A", sectionInstructions: "Answer all questions.",
    question: q("4", 6, { type: "Structured", text: "Solve x + 1 = 3." }),
    avoid: ["Solve x + 1 = 3.", "Factorize 2x^2 - 8."],
    ...over,
  };
}

test("buildQuestionPrompt pins the marks and number, and lists questions to avoid", () => {
  const { system, user } = buildQuestionPrompt(regenReq() as never);
  assert.match(system, /EXACTLY 6 mark/);
  assert.match(system, /"4"/);
  assert.match(user, /do NOT duplicate/i);
  assert.match(user, /Factorize 2x\^2 - 8/);
  // Maths family guidance must ride along so a replacement keeps house style.
  assert.match(system, /no multiple-choice/i);
});

test("buildQuestionPrompt carries an explicit change request", () => {
  const { user } = buildQuestionPrompt(regenReq({ instruction: "use larger numbers" }) as never);
  assert.match(user, /Change request: use larger numbers/);
});

test("parseReplacementQuestion pins number and marks to the original", () => {
  const original = q("7", 9, { type: "Structured" });
  const raw = JSON.stringify({
    number: "99", type: "Structured", marks: 42, bloom: "Apply", difficulty: "Medium",
    text: "A new question.", answer: "A full model answer with breakdown.",
  });
  const out = parseReplacementQuestion(raw, original);
  assert.ok(out);
  assert.equal(out!.number, "7", "number is pinned");
  assert.equal(out!.marks, 9, "marks are pinned");
  assert.equal(out!.text, "A new question.");
});

test("parseReplacementQuestion rejects unusable replacements", () => {
  const original = q("1", 1, { type: "Multiple Choice", options: ["a", "b", "c", "d"] });
  const bad = [
    "not json at all",
    JSON.stringify({ number: "1", type: "Structured", marks: 1, text: "Q", answer: "" }),      // no scheme
    JSON.stringify({ number: "1", type: "Structured", marks: 1, text: "Q", answer: "N/A" }),   // placeholder
    JSON.stringify({ number: "1", type: "Multiple Choice", marks: 1, text: "Q", answer: "B", options: ["a", "b"] }), // too few options
    JSON.stringify({ number: "1", type: "Multiple Choice", marks: 1, text: "Q", answer: "B", options: ["a", "b", "c", " "] }), // blank option
  ];
  for (const raw of bad) assert.equal(parseReplacementQuestion(raw, original), null, raw.slice(0, 40));
});

test("swapping a regenerated question in place leaves the paper's totals untouched", () => {
  const e = exam([
    section("A", [q("1", 10), q("2", 10), q("3", 10)], { marks: 30, instructions: "Answer all." }),
    section("B", [q("4", 20), q("5", 20), q("6", 20), q("7", 20)], { choose: 2, marks: 40, instructions: "Answer any two." }),
  ], { totalMarks: 70 });
  const before = normalizeExam(e).exam;

  const replacement = parseReplacementQuestion(
    JSON.stringify({ number: "zzz", type: "Structured", marks: 999, text: "Replaced.", answer: "Model answer with breakdown." }),
    before.sections[0].questions[1],
  ) as ExamQuestion;

  const after = normalizeExam({
    ...before,
    sections: before.sections.map((s, i) =>
      i !== 0 ? s : { ...s, questions: s.questions.map((x, j) => (j === 1 ? replacement : x)) },
    ),
  }).exam;

  assert.equal(after.totalMarks, before.totalMarks);
  assert.deepEqual(after.sections.map((s) => s.marks), before.sections.map((s) => s.marks));
  assert.equal(after.sections[0].questions[1].text, "Replaced.");
});

// ── model IDs ───────────────────────────────────────────────────────
test("Gemini models use auto-updating -latest aliases, not pinned versions", () => {
  const gemini = CHAT_MODELS.filter((m) => m.provider === "google");
  assert.ok(gemini.length > 0, "there should be Gemini models");
  for (const m of gemini) {
    assert.ok(m.id.endsWith("-latest"), `${m.id} should be a -latest alias`);
    assert.ok(!/\d/.test(m.id), `${m.id} should not pin a version number (it will 404 when retired)`);
    assert.ok(isAllowedModel(m.id));
    assert.equal(modelProvider(m.id), "google");
  }
});

// ── AI error classification ─────────────────────────────────────────
test("a Gemini quota error becomes a short, actionable 429 message", () => {
  const raw = new Error(
    "[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. * Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.5-pro",
  );
  const out = classifyAiError(raw, "Exam generation");
  assert.equal(out.status, 429);
  assert.match(out.message, /quota or rate limit/i);
  assert.ok(!out.message.includes("googleapis.com"), "must not leak the raw provider URL/JSON");
  assert.ok(out.message.length < 400, "message should be short");
});

test("retired-model, auth and overload errors are classified distinctly", () => {
  assert.match(classifyAiError(new Error("[404 Not Found] models/gemini-2.5-flash is no longer available")).message, /model is unavailable/i);
  assert.match(classifyAiError(new Error("[401] invalid api key")).message, /authentication failed/i);
  assert.match(classifyAiError(new Error("[503] model is overloaded")).message, /temporarily unavailable/i);
  assert.equal(classifyAiError(new Error("[503] overloaded")).status, 503);
});

test("an unrecognised error keeps its detail and a 500", () => {
  const out = classifyAiError(new Error("something odd broke"), "Exam generation");
  assert.equal(out.status, 500);
  assert.match(out.message, /Exam generation failed: something odd broke/);
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
