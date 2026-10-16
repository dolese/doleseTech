import { test } from "node:test";
import assert from "node:assert/strict";

import { buildPlan, itemNumbers, type ExamPlan } from "../src/lib/examAgent/plan";
import {
  applyRevisions,
  assembleExam,
  balanceAnswerKey,
  cleanVerdicts,
  compareObjective,
  finalChecks,
  keyLetter,
  nearDuplicates,
  pinQuestions,
  withoutSchemes,
} from "../src/lib/examAgent/assemble";
import { draftPrompt, moderatePrompt, solvePrompt } from "../src/lib/examAgent/prompts";
import type { ExamConfig, ExamQuestion } from "../src/lib/exams";

const config: ExamConfig = {
  subject: "Biology",
  level: "O-Level",
  form: "Form II",
  examType: "Monthly Test",
  durationMinutes: 60,
  totalMarks: 20,
  topics: ["Nutrition", "Gaseous Exchange & Respiration"],
  formats: ["Multiple Choice", "Short Answer"],
  difficulty: "Balanced",
  language: "English",
};

const LETTERS = ["A", "B", "C", "D", "E"];
const mcq = (number: string, key: string, stem = `Which organ is described in item ${number}?`): ExamQuestion => ({
  number,
  type: "Multiple Choice",
  marks: 1,
  bloom: "Understand",
  difficulty: "Moderate",
  text: stem,
  options: [`stomach ${number}`, `liver ${number}`, `lungs ${number}`, `heart ${number}`],
  answer: `${key}. Because it is the right organ.`,
});
const written = (number: string, marks: number, text: string): ExamQuestion => ({
  number,
  type: "Short Answer",
  marks,
  bloom: "Apply",
  difficulty: "Moderate",
  text,
  answer: "Points: one (1 mark), two (1 mark).",
});

const WRITTEN = [
  "Explain how the small intestine is adapted for the absorption of digested food.",
  "Describe the role of the diaphragm and intercostal muscles during inhalation.",
  "A farmer in Morogoro feeds his cattle only maize stalks. Suggest two deficiency diseases they may develop.",
  "Compare aerobic and anaerobic respiration, giving one example of where each occurs.",
  "State three functions of the liver in digestion and metabolism.",
  "Outline an experiment to show that carbon dioxide is produced during respiration.",
];

/** A setter's reply for the whole plan, as a model would send it. */
function fullReply(plan: ExamPlan): ExamQuestion[][] {
  return plan.sections.map((s) =>
    s.items.flatMap((item) =>
      itemNumbers(item).map((n, k) =>
        item.format === "Multiple Choice"
          ? mcq(n, "B", `Item ${k}: ${["Which enzyme digests starch", "Where does gaseous exchange occur", "What is respiration", "Which food test uses iodine", "What carries oxygen in blood", "Which vitamin prevents scurvy", "Name the site of absorption", "What is the role of bile"][k % 8]}?`)
          : written(n, item.marks, WRITTEN[Number(item.number) % WRITTEN.length]),
      ),
    ),
  );
}

test("a setter's reply is held to the plan: numbers, formats and marks pinned; bad items refused", () => {
  const plan = buildPlan(config);
  const section = plan.sections[0];
  const reply = fullReply(plan)[0].map((q) => ({ ...q, number: q.number.replace(" ", ""), marks: 5, type: "MCQ" }));
  // One item has only three options, another no answer letter: both refused.
  reply[1] = { ...reply[1], options: reply[1].options!.slice(0, 3) };
  reply[2] = { ...reply[2], answer: "The stomach" };
  const { questions, missing } = pinQuestions(section.items, JSON.stringify({ questions: reply }));
  assert.deepEqual(missing, [itemNumbers(section.items[0])[1], itemNumbers(section.items[0])[2]]);
  assert.ok(questions.every((q) => q.marks === 1 && q.type === "Multiple Choice" && / \(/.test(q.number)));
  assert.equal(pinQuestions(section.items, "not json").missing.length, section.items[0].parts);
});

test("the paper is assembled to the plan's total, with the plan's rubric", () => {
  const plan = buildPlan(config);
  const exam = assembleExam(plan, fullReply(plan), "Mwangaza Secondary School");
  assert.equal(exam.totalMarks, 20);
  assert.equal(exam.title, "Mwangaza Secondary School — Form II Biology Monthly Test");
  assert.deepEqual(exam.instructions, plan.rubric);
  assert.deepEqual(finalChecks(exam, plan), []);
});

test("the blind examiner sees no marking scheme and no essays", () => {
  const plan = buildPlan({ ...config, formats: ["Multiple Choice", "Essay"], examType: "Terminal Exam", totalMarks: 50 });
  const exam = assembleExam(plan, fullReply(plan));
  const shown = withoutSchemes(exam);
  assert.ok(shown.every((q) => q.answer === "" && q.type !== "Essay"));
  assert.doesNotMatch(solvePrompt(plan, shown).user, /Because it is the right organ/);
});

test("blind answers that disagree with the key are found", () => {
  const plan = buildPlan(config);
  const exam = assembleExam(plan, fullReply(plan));
  const first = exam.sections[0].questions;
  const blind = new Map([
    [first[0].number, "B"],
    [first[1].number, "D"],
    [first[2].number, "PROBLEM: two options are correct"],
  ]);
  const { checked, disagreements } = compareObjective(exam, blind);
  assert.equal(checked, 3);
  assert.deepEqual(disagreements.map((d) => d.number), [first[1].number, first[2].number]);
  assert.equal(keyLetter("(c) because"), "C");
});

test("moderation verdicts are held to real questions and known problem codes", () => {
  const plan = buildPlan(config);
  const exam = assembleExam(plan, fullReply(plan));
  const n = exam.sections[0].questions[3].number;
  const verdicts = cleanVerdicts(exam, [
    { number: n.replace(" ", ""), problems: ["key", "made-up"], note: "Option B is also correct." },
    { number: "99", problems: ["KEY"], note: "No such question." },
  ]);
  assert.deepEqual(verdicts, [{ number: n, problems: ["KEY"], note: "Option B is also correct." }]);
  assert.match(moderatePrompt(plan, exam, new Map([[n, "C"]])).user, /INDEPENDENT EXAMINER: C/);
});

test("revisions replace only the questions sent back, keeping numbers and marks", () => {
  const plan = buildPlan(config);
  const exam = assembleExam(plan, fullReply(plan));
  const target = exam.sections[1].questions[0];
  const reply = JSON.stringify({ questions: [{ ...target, number: target.number, marks: 99, text: "A better question about digestion." }] });
  const { exam: after, revised } = applyRevisions(exam, plan, reply, [target.number]);
  assert.deepEqual(revised, [target.number]);
  const now = after.sections[1].questions[0];
  assert.equal(now.text, "A better question about digestion.");
  assert.equal(now.marks, target.marks);
  assert.deepEqual(after.sections[0], exam.sections[0]);
});

test("a lopsided answer key is spread across the letters without changing any correct answer", () => {
  const questions = Array.from({ length: 10 }, (_, i) => mcq(`1 (${i + 1})`, "B"));
  const exam = { title: "t", subject: "Biology", level: "", form: "", examType: "", durationMinutes: 0, totalMarks: 10, language: "English", instructions: [], sections: [{ name: "SECTION A", instructions: "", marks: 10, questions }] };
  const { exam: balanced, moved } = balanceAnswerKey(exam);
  assert.ok(moved > 0);
  const keys = balanced.sections[0].questions.map((q) => keyLetter(q.answer)!);
  assert.ok(Math.max(...LETTERS.map((l) => keys.filter((k) => k === l).length)) <= 4);
  balanced.sections[0].questions.forEach((q, i) => {
    const correct = q.options![LETTERS.indexOf(keyLetter(q.answer)!)];
    assert.equal(correct, `liver 1 (${i + 1})`, "the correct option text is unchanged");
  });
});

test("near-duplicate questions are reported", () => {
  const plan = buildPlan(config);
  const exam = assembleExam(plan, fullReply(plan));
  const q = exam.sections[1].questions;
  q[1] = { ...q[1], text: `${q[0].text} Give two examples.` };
  assert.equal(nearDuplicates(exam).length, 1);
});

test("the setter is told the plan for its questions and what the rest of the paper covers", () => {
  const plan = buildPlan({ ...config, examType: "Terminal Exam", totalMarks: 100, durationMinutes: 180, topics: [] });
  const { system, user } = draftPrompt(plan, 1, ["3", "4"], "Use examples from farming.");
  assert.match(system, /NECTA-style examining panel/);
  assert.match(user, /Question 3: Structured, numbered "3", 9 marks\. Topic: /);
  assert.match(user, /Other questions in the paper/);
  assert.match(user, /The teacher asks: Use examples from farming\./);
  assert.doesNotMatch(user, /- Question 3 \(/);
});
