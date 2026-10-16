import { test } from "node:test";
import assert from "node:assert/strict";

import { buildPlan, itemNumbers, planTotalMarks, planWarnings, ANY_TOPIC } from "../src/lib/examAgent/plan";
import type { ExamConfig } from "../src/lib/exams";

const base: ExamConfig = {
  subject: "Biology",
  level: "O-Level",
  form: "Form IV",
  examType: "Terminal Exam",
  durationMinutes: 180,
  totalMarks: 100,
  topics: [],
  formats: ["Multiple Choice", "Short Answer", "Essay"],
  difficulty: "Balanced",
  language: "English",
};

test("a full Biology paper follows the NECTA structure: 16 objective, 6 x 9, answer 2 of 3 essays", () => {
  const plan = buildPlan(base);
  assert.equal(plan.official, true);
  assert.deepEqual(plan.sections.map((s) => s.name), ["SECTION A", "SECTION B", "SECTION C"]);
  const [a, b, c] = plan.sections;
  assert.deepEqual(a.items.map((i) => [i.format, i.parts]), [["Multiple Choice", 10], ["Matching", 6]]);
  assert.deepEqual(b.items.map((i) => i.marks), [9, 9, 9, 9, 9, 9]);
  assert.equal(c.choose, 2);
  assert.deepEqual(c.items.map((i) => i.marks), [15, 15, 15]);
  assert.equal(planTotalMarks(plan), 100);
  assert.deepEqual(planWarnings(plan), []);
  assert.deepEqual(plan.sections.flatMap((s) => s.items).map((i) => i.number), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]);
  assert.deepEqual(itemNumbers(a.items[0]).slice(0, 3), ["1 (i)", "1 (ii)", "1 (iii)"]);
});

test("a full Basic Mathematics paper has no objective section: 10 x 6 then 4 x 10", () => {
  const plan = buildPlan({ ...base, subject: "Basic Mathematics" });
  assert.deepEqual(plan.sections.map((s) => s.items.map((i) => i.marks)), [Array(10).fill(6), Array(4).fill(10)]);
  assert.ok(plan.sections.flatMap((s) => s.items).every((i) => i.parts === 0));
});

test("a Form IV mock examines Forms I to IV; a monthly test only its own form", () => {
  const mock = buildPlan({ ...base, examType: "Mock Exam" });
  assert.ok(mock.topicPool.includes("Cell Structure & Organisation") && mock.topicPool.includes("Genetics"));
  const monthly = buildPlan({ ...base, examType: "Monthly Test", totalMarks: 50, durationMinutes: 90 });
  assert.deepEqual(monthly.topicPool, ["Genetics", "Evolution", "Ecology", "Human Reproductive Health"]);
  assert.ok(monthly.sections.flatMap((s) => s.items).every((i) => i.topics[0] !== ANY_TOPIC));
});

test("every plan adds up exactly, whatever the total and formats", () => {
  const formatSets = [
    ["Multiple Choice"],
    ["Short Answer"],
    ["Essay"],
    ["Multiple Choice", "Matching", "True/False", "Fill in the Blanks"],
    ["Multiple Choice", "Structured", "Essay"],
    ["Short Answer", "Structured"],
  ];
  for (const totalMarks of [5, 10, 17, 20, 37, 50, 63, 80, 100, 150, 200]) {
    for (const formats of formatSets) {
      for (const examType of ["Quiz", "Terminal Exam"]) {
        for (const subject of ["Biology", "Basic Mathematics", "History", "Book-Keeping", "Kiswahili"]) {
          const plan = buildPlan({ ...base, subject, totalMarks, formats, examType, durationMinutes: 120 });
          const label = `${subject} ${examType} ${totalMarks} ${formats.join("+")}`;
          assert.equal(planTotalMarks(plan), totalMarks, label);
          for (const s of plan.sections) {
            assert.ok(s.items.length > 0, label);
            if (s.choose) assert.equal(new Set(s.items.map((i) => i.marks)).size, 1, `${label}: equal choices`);
            for (const i of s.items) assert.ok(i.marks >= 1 && i.parts <= 20, label);
          }
        }
      }
    }
  }
});

test("a Kiswahili paper is laid out in Kiswahili", () => {
  const plan = buildPlan({ ...base, language: "Kiswahili" });
  assert.equal(plan.sections[0].name, "SEHEMU A");
  assert.equal(plan.sections[2].instructions, "Jibu maswali mawili (2) kati ya 3 katika sehemu hii.");
  assert.match(plan.rubric[1], /sehemu A na B, na maswali mawili \(2\) kutoka sehemu C/);
});

test("an edited plan that no longer adds up is flagged before anything is written", () => {
  const plan = buildPlan(base);
  plan.sections[1].items[0].marks = 12;
  assert.match(planWarnings(plan)[0], /add up to 103 marks, not 100/);
});
