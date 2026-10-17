import { test } from "node:test";
import assert from "node:assert/strict";

import { buildPlan, itemNumbers, type ExamPlan } from "../src/lib/examAgent/plan";
import { advance, expectedCalls, initialState, PanelError, parts, runToEnd, type Panel } from "../src/lib/examAgent/run";
import type { ExamConfig, ExamQuestion } from "../src/lib/exams";

const config: ExamConfig = {
  subject: "Biology",
  level: "O-Level",
  form: "Form II",
  examType: "Terminal Exam",
  durationMinutes: 120,
  totalMarks: 60,
  topics: [],
  formats: ["Multiple Choice", "Structured", "Essay"],
  difficulty: "Balanced",
  language: "English",
};

const STEMS = [
  "Which enzyme digests starch in the mouth",
  "Where does gaseous exchange occur in a fish",
  "What is the end product of anaerobic respiration in yeast",
  "Which food test uses iodine solution",
  "What carries oxygen in human blood",
  "Which vitamin prevents scurvy",
  "Name the main site of absorption of digested food",
  "What is the role of bile in digestion",
  "Which organ produces insulin",
  "What is the function of root hairs",
];
const WRITTEN = [
  "Explain how the small intestine is adapted for the absorption of digested food.",
  "Describe the role of the diaphragm and intercostal muscles during inhalation.",
  "A farmer in Morogoro feeds his cattle only maize stalks. Suggest two deficiency diseases they may develop.",
  "Compare aerobic and anaerobic respiration, giving one example of where each occurs.",
  "State three functions of the liver in digestion and metabolism.",
  "Outline an experiment to show that carbon dioxide is produced during respiration.",
  "Discuss five ways in which human activities pollute water sources in Tanzania.",
  "Explain why a balanced diet is important for a growing teenager.",
];

/** Questions for the plan's items `numbers` in `section`, as a setter would write them. */
function write(plan: ExamPlan, section: number, numbers: string[]): ExamQuestion[] {
  return plan.sections[section].items
    .filter((item) => numbers.includes(item.number))
    .flatMap((item) =>
      itemNumbers(item).map((n, k): ExamQuestion =>
        item.format === "Multiple Choice"
          ? {
              number: n, type: "Multiple Choice", marks: 1, bloom: "Understand", difficulty: "Moderate",
              text: `${STEMS[k % STEMS.length]}?`,
              options: [`stomach ${n}`, `liver ${n}`, `lungs ${n}`, `heart ${n}`],
              answer: "B. Because it is the right one.",
            }
          : {
              number: n, type: item.format, marks: item.marks, bloom: "Apply", difficulty: "Moderate",
              text: WRITTEN[Number(item.number) % WRITTEN.length],
              answer: "Points: one (1 mark), two (1 mark).",
            },
      ),
    );
}

/** A panel that answers like the real one, and counts its calls. */
function fakePanel(plan: ExamPlan, overrides: Partial<Panel> = {}) {
  const calls = { draft: 0, solve: 0, moderate: 0, revise: 0 };
  let moderations = 0;
  const panel: Panel = {
    async draft(section, numbers) {
      calls.draft++;
      return { questions: write(plan, section, numbers), missing: [] };
    },
    async solve(exam, only) {
      calls.solve++;
      return exam.sections
        .flatMap((s) => s.questions)
        .filter((q) => q.type === "Multiple Choice" && (!only || only.includes(q.number)))
        .map((q) => ({ number: q.number, answer: "B" }));
    },
    async moderate(exam) {
      calls.moderate++;
      moderations++;
      // The first review sends one written question back; the re-check passes it.
      const written = exam.sections.flatMap((s) => s.questions).find((q) => q.type !== "Multiple Choice")!;
      return moderations === 1
        ? { verdicts: [{ number: written.number, problems: ["CLARITY"], note: "Say how many points are wanted." }], summary: "A sound paper." }
        : { verdicts: [], summary: "" };
    },
    async revise(exam, requests) {
      calls.revise++;
      const wanted = requests.map((r) => r.number);
      return {
        exam: {
          ...exam,
          sections: exam.sections.map((s) => ({
            ...s,
            questions: s.questions.map((q) => (wanted.includes(q.number) ? { ...q, text: `${q.text} Give three points.` } : q)),
          })),
        },
        revised: wanted,
      };
    },
    ...overrides,
  };
  return { panel, calls };
}

test("a paper runs to the end through saved phases, and the report tells the story", async () => {
  const plan = buildPlan(config);
  const { panel, calls } = fakePanel(plan);
  const state = await runToEnd(plan, panel, { school: "Mwangaza Secondary School" });

  assert.equal(state.phase, "done");
  const result = state.result!;
  assert.equal(result.exam.totalMarks, 60);
  assert.equal(result.report.revised.length, 1);
  assert.deepEqual(result.report.unresolved, []);
  assert.deepEqual(result.report.incomplete, []);
  assert.equal(result.report.blind.agreed, result.report.blind.checked);
  assert.ok(result.report.blind.checked > 0);
  assert.match(result.exam.sections.flatMap((s) => s.questions).find((q) => q.type !== "Multiple Choice")!.text, /Give three points/);
  assert.deepEqual(state.steps.map((s) => s.state), ["done", "done", "done", "done", "done"]);
  // One call per part, blind answer + moderation, one revision, and its re-check.
  assert.deepEqual(calls, { draft: parts(plan).length, solve: 2, moderate: 2, revise: 1 });
  assert.equal(expectedCalls(plan), parts(plan).length + 5);
});

test("a busy writer costs only its own part: the rest is kept and the part is tried again", async () => {
  const plan = buildPlan(config);
  const { panel, calls } = fakePanel(plan);
  let failedOnce = false;
  const flaky: Panel = {
    ...panel,
    async draft(section, numbers) {
      if (section === 0 && !failedOnce) {
        failedOnce = true;
        calls.draft++;
        throw new PanelError("The AI provider is temporarily unavailable.", true);
      }
      return panel.draft(section, numbers);
    },
  };
  let state = await advance(plan, initialState(), flaky);
  assert.equal(state.phase, "write");
  assert.equal(Object.keys(state.written).length, parts(plan).length - 1);
  assert.equal(state.steps[0].state, "running");

  state = await advance(plan, JSON.parse(JSON.stringify(state)), flaky);
  assert.equal(state.phase, "solve");
  // Every part written once, plus the one failure.
  assert.equal(calls.draft, parts(plan).length + 1);
});

test("an account out of credit stops the job at once, with a plain message", async () => {
  const plan = buildPlan(config);
  const { panel } = fakePanel(plan, {
    async draft() {
      throw new PanelError("This AI model is unavailable right now. Please choose a different model, or try again later.", false);
    },
  });
  await assert.rejects(advance(plan, initialState(), panel), /choose a different model/);
});

test("once the paper exists, a check that cannot run is reported, never a lost paper", async () => {
  const plan = buildPlan(config);
  const { panel } = fakePanel(plan, {
    async moderate() {
      throw new PanelError("The AI provider is temporarily unavailable.", true);
    },
  });
  const state = await runToEnd(plan, panel);
  assert.equal(state.phase, "done");
  assert.equal(state.result!.report.reviewed, 0);
  assert.equal(state.result!.report.incomplete.length, 1);
  assert.match(state.result!.report.incomplete[0], /Moderation could not run/);
  assert.equal(state.steps.find((s) => s.key === "moderate")!.state, "failed");
});

test("a writer that keeps leaving questions out gives up after three tries", async () => {
  const plan = buildPlan(config);
  const { panel } = fakePanel(plan, {
    async draft(section, numbers) {
      const questions = write(plan, section, numbers);
      return { questions: questions.slice(1), missing: [questions[0].number] };
    },
  });
  let state = initialState();
  for (let i = 0; i < 2; i++) state = await advance(plan, state, panel);
  assert.equal(state.writeTries, 2);
  await assert.rejects(advance(plan, state, panel), /could not be written/);
});
