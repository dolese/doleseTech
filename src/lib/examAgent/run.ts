/**
 * The examining panel at work, as a job the server runs in the background.
 *
 *   1. Write     every section to the approved plan (in parallel chunks)
 *   2. Answer    the paper blind, as an independent examiner
 *   3. Moderate  every question against the plan and the checklist
 *   4. Revise    what was sent back, then re-check it — at most twice
 *   5. Check     totals, numbering, duplicates and the answer key, in code
 *
 * The run is a series of phases over plain JSON state. After each phase the
 * server saves the state, so a run survives the teacher closing the page, a
 * server restart or a platform time limit: whichever request picks the job
 * up next carries on from the last saved phase. Nothing here talks to a
 * model directly — that is the `Panel`, so tests can stand in for it.
 */
import { normalizeExam, type Exam, type ExamIssue, type ExamQuestion } from "../exams";
import {
  assembleExam,
  balanceAnswerKey,
  compareObjective,
  examBloomShare,
  finalChecks,
  type AgentReport,
  type Disagreement,
  type Verdict,
} from "./assemble";
import { isObjectiveFormat, itemNumbers, type ExamPlan, type PlanItem } from "./plan";
import type { RevisionRequest } from "./prompts";

export type StepState = "waiting" | "running" | "done" | "skipped" | "failed";
export interface StepProgress {
  key: "write" | "solve" | "moderate" | "revise" | "check";
  label: string;
  state: StepState;
  detail?: string;
}

const STEPS: Pick<StepProgress, "key" | "label">[] = [
  { key: "write", label: "Writing the questions to the plan" },
  { key: "solve", label: "Answering the paper blind" },
  { key: "moderate", label: "Moderating every question" },
  { key: "revise", label: "Revising questions sent back" },
  { key: "check", label: "Final checks" },
];

/** Most questions sent back in one round; the rest are reported to the teacher. */
const MAX_REVISIONS = 12;
const ROUNDS = 2;
/** Times the writing phase is tried before the job gives up. */
const WRITE_TRIES = 3;
/** Problems that make a question wrong, not just weaker: revised first. */
const SERIOUS = ["KEY", "SYLLABUS", "CLARITY", "MARKS"];

/**
 * A failed model call. `retryable` is true for a busy provider or a dropped
 * connection — worth another try later — and false for what will not change
 * by waiting: no credit, no quota, a bad key.
 */
export class PanelError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
    this.name = "PanelError";
  }
}

/** The examiners: one model call each, already bound to the plan and model. */
export interface Panel {
  draft(section: number, numbers: string[]): Promise<{ questions: ExamQuestion[]; missing: string[] }>;
  solve(exam: Exam, only?: string[]): Promise<{ number: string; answer: string }[]>;
  moderate(exam: Exam, blind: Record<string, string>, only?: string[]): Promise<{ verdicts: Verdict[]; summary: string; unreadable?: boolean }>;
  revise(exam: Exam, requests: (Omit<RevisionRequest, "question"> & { number: string })[]): Promise<{ exam: Exam; revised: string[] }>;
}

export interface AgentResult {
  exam: Exam;
  issues: ExamIssue[];
  report: AgentReport;
}

export type Phase = "write" | "solve" | "moderate" | "revise" | "recheck" | "check" | "done";

/** Everything the run knows between phases. Plain JSON, saved after each one. */
export interface AgentState {
  phase: Phase;
  steps: StepProgress[];
  /** Written questions, by part of the paper (see `parts`). */
  written: Record<string, ExamQuestion[]>;
  writeTries: number;
  exam: Exam | null;
  total: number;
  /** The independent examiner's answers, by question number. */
  blind: Record<string, string>;
  firstCheck: { checked: number; disagreements: Disagreement[] };
  flagged: Verdict[];
  revised: Verdict[];
  recheck: string[];
  round: number;
  moderated: boolean;
  summary: string;
  incomplete: string[];
  log: string[];
  result: AgentResult | null;
}

/** Split a section into calls of a sensible size: ≤ 20 objective items, or ≤ 3 written questions. */
function chunks(items: PlanItem[]): PlanItem[][] {
  const out: PlanItem[][] = [];
  let current: PlanItem[] = [];
  let weight = 0;
  for (const item of items) {
    const w = isObjectiveFormat(item.format) ? item.parts / 20 : 1 / 3;
    if (current.length && weight + w > 1.0001) {
      out.push(current);
      current = [];
      weight = 0;
    }
    current.push(item);
    weight += w;
  }
  if (current.length) out.push(current);
  return out;
}

/** The parts of the paper written in parallel, in a fixed order. */
export function parts(plan: ExamPlan): { section: number; items: PlanItem[] }[] {
  return plan.sections.flatMap((s, section) => chunks(s.items).map((items) => ({ section, items })));
}

/** Model calls a run usually makes: one per part, then a blind answer, moderation and one revision round. */
export function expectedCalls(plan: ExamPlan): number {
  return parts(plan).length + 5;
}

function severity(v: Verdict): number {
  return v.problems.some((p) => SERIOUS.includes(p)) ? 0 : 1;
}

/** Turn blind-answer disagreements into verdicts the setter can act on. */
function keyVerdicts(disagreements: Disagreement[]): Verdict[] {
  return disagreements.map((d) => ({
    number: d.number,
    problems: ["KEY"],
    note: `An independent examiner answered "${d.blind}", but the marking scheme says "${d.key}". Make sure exactly one answer is right and the scheme gives it.`,
  }));
}

function merge(...lists: Verdict[][]): Verdict[] {
  const byNumber = new Map<string, Verdict>();
  for (const v of lists.flat()) {
    const known = byNumber.get(v.number);
    byNumber.set(
      v.number,
      known ? { number: v.number, problems: [...new Set([...known.problems, ...v.problems])], note: `${known.note} ${v.note}`.trim() } : v,
    );
  }
  return [...byNumber.values()];
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const reason = (err: unknown) => (err instanceof Error ? err.message : "the AI service did not answer");

export function initialState(): AgentState {
  return {
    phase: "write",
    steps: STEPS.map((s) => ({ ...s, state: "waiting" })),
    written: {},
    writeTries: 0,
    exam: null,
    total: 0,
    blind: {},
    firstCheck: { checked: 0, disagreements: [] },
    flagged: [],
    revised: [],
    recheck: [],
    round: 1,
    moderated: false,
    summary: "",
    incomplete: [],
    log: [],
    result: null,
  };
}

function set(state: AgentState, key: StepProgress["key"], value: StepState, detail?: string) {
  const step = state.steps.find((s) => s.key === key)!;
  step.state = value;
  if (detail !== undefined) step.detail = detail;
}

/**
 * Run the next phase and return the new state. Throws only when the paper
 * cannot be written at all; once it exists, a step that cannot run becomes a
 * note in the report rather than a lost paper.
 */
export async function advance(
  plan: ExamPlan,
  input: AgentState,
  panel: Panel,
  opts: { school?: string } = {},
): Promise<AgentState> {
  const state: AgentState = structuredClone(input);

  switch (state.phase) {
    case "write": {
      const all = parts(plan);
      const todo = all.map((p, i) => ({ ...p, i })).filter((p) => !state.written[p.i]);
      state.writeTries++;
      set(state, "write", "running", `${all.length - todo.length} of ${plural(all.length, "part")} written`);
      const results = await Promise.allSettled(
        todo.map(async ({ section, items, i }) => {
          let reply = await panel.draft(section, items.map((it) => it.number));
          // Anything the setter left out or got unusably wrong is asked for once more.
          if (reply.missing.length) {
            const again = items.filter((it) => itemNumbers(it).some((n) => reply.missing.includes(n))).map((it) => it.number);
            const retry = await panel.draft(section, again);
            const fixed = new Map(retry.questions.map((q) => [q.number, q]));
            const merged = items
              .flatMap(itemNumbers)
              .map((n) => reply.questions.find((q) => q.number === n) ?? fixed.get(n))
              .filter(Boolean) as ExamQuestion[];
            reply = { questions: merged, missing: retry.missing };
          }
          if (reply.missing.length) {
            throw new PanelError(`${reply.missing.length > 1 ? "questions" : "question"} ${reply.missing.join(", ")} could not be written`, true);
          }
          state.written[i] = reply.questions;
        }),
      );
      const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected").map((r) => r.reason);
      const done = Object.keys(state.written).length;
      if (failures.length) {
        const fatal = failures.find((e) => !(e instanceof PanelError && e.retryable));
        if (fatal || state.writeTries >= WRITE_TRIES) {
          set(state, "write", "failed", `${done} of ${plural(all.length, "part")} written`);
          throw fatal ?? failures[0];
        }
        set(state, "write", "running", `${done} of ${plural(all.length, "part")} written · trying the rest again`);
        return state;
      }
      const bySection = plan.sections.map((_, s) => all.flatMap((p, i) => (p.section === s ? state.written[i] : [])));
      state.exam = assembleExam(plan, bySection, opts.school);
      state.total = state.exam.sections.reduce((n, s) => n + s.questions.length, 0);
      state.written = {};
      set(state, "write", "done", `${state.total} questions written`);
      state.log.push(`Wrote ${state.total} questions to the plan.`);
      state.phase = "solve";
      return state;
    }

    case "solve": {
      const exam = state.exam!;
      set(state, "solve", "running");
      try {
        const answers = await panel.solve(exam);
        for (const a of answers) state.blind[a.number] = a.answer;
        state.firstCheck = compareObjective(exam, new Map(Object.entries(state.blind)));
        const { checked, disagreements } = state.firstCheck;
        set(state, "solve", "done", `${answers.length} answered · ${checked - disagreements.length} of ${checked} objective answers agree with the key`);
        state.log.push(`An independent examiner answered ${answers.length} questions without the marking scheme.`);
      } catch (err) {
        set(state, "solve", "failed", "Could not run this time");
        state.incomplete.push(`The blind answer check could not run (${reason(err)}). Check the multiple-choice key yourself.`);
      }
      state.phase = "moderate";
      return state;
    }

    case "moderate": {
      set(state, "moderate", "running");
      state.flagged = keyVerdicts(state.firstCheck.disagreements);
      try {
        const review = await moderateOnce(panel, state);
        state.summary = review.summary;
        state.flagged = merge(state.flagged, review.verdicts);
        state.moderated = true;
        const n = state.flagged.length;
        set(state, "moderate", "done", n ? `${plural(n, "question")} sent back` : "Every question passed");
        state.log.push(`The chief examiner moderated ${state.total} questions${n ? ` and sent back ${n}` : "; all passed"}.`);
      } catch (err) {
        set(state, "moderate", "failed", "Could not run this time");
        state.incomplete.push(`Moderation could not run (${reason(err)}). Read every question before printing, or write the paper again later.`);
      }
      if (!state.flagged.length) {
        set(state, "revise", "skipped", state.moderated ? "Nothing to revise" : "Skipped");
        state.phase = "check";
      } else {
        state.phase = "revise";
      }
      return state;
    }

    case "revise": {
      const batch = state.flagged.slice().sort((a, b) => severity(a) - severity(b)).slice(0, MAX_REVISIONS);
      set(state, "revise", "running", `Round ${state.round}: rewriting ${plural(batch.length, "question")}`);
      try {
        const result = await panel.revise(
          state.exam!,
          batch.map((v) => ({ number: v.number, problems: v.problems, note: v.note, blind: state.blind[v.number] })),
        );
        state.exam = result.exam;
        state.recheck = result.revised;
        // A question rewritten in both rounds is listed once, with every reason.
        state.revised = merge(state.revised, batch.filter((v) => result.revised.includes(v.number)));
      } catch (err) {
        state.incomplete.push(`Round ${state.round} of revisions could not run (${reason(err)}); the questions below are as first written.`);
        state.recheck = [];
      }
      if (state.recheck.length) {
        set(state, "revise", "running", `Round ${state.round}: checking ${plural(state.recheck.length, "revised question")}`);
        state.phase = "recheck";
      } else {
        finishRevising(state);
      }
      return state;
    }

    case "recheck": {
      const recheck = state.recheck;
      // Questions not rewritten this round keep their earlier verdict.
      const leftOver = state.flagged.filter((v) => !recheck.includes(v.number));
      try {
        for (const n of recheck) delete state.blind[n];
        const answers = await panel.solve(state.exam!, recheck);
        for (const a of answers) state.blind[a.number] = a.answer;
        const exam = state.exam!;
        const again = compareObjective(
          { ...exam, sections: exam.sections.map((s) => ({ ...s, questions: s.questions.filter((q) => recheck.includes(q.number)) })) },
          new Map(Object.entries(state.blind)),
        );
        const second = await moderateOnce(panel, state, recheck);
        state.flagged = merge(leftOver, keyVerdicts(again.disagreements), second.verdicts);
        state.log.push(`Round ${state.round}: rewrote ${plural(recheck.length, "question")}; ${state.flagged.length} still need attention.`);
      } catch (err) {
        // Rewritten but not checked again: the teacher looks at them.
        state.flagged = merge(
          leftOver,
          recheck.map((number) => ({ number, problems: ["CLARITY"], note: "Rewritten after moderation, but the second check could not run. Read it before printing." })),
        );
        state.incomplete.push(`The check after round ${state.round} could not run (${reason(err)}).`);
        finishRevising(state);
        return state;
      }
      state.recheck = [];
      if (state.flagged.length && state.round < ROUNDS) {
        state.round++;
        state.phase = "revise";
      } else {
        finishRevising(state);
      }
      return state;
    }

    case "check": {
      let exam = state.exam!;
      // Compared before the key is balanced: moving options changes the letters.
      const finalBlind = compareObjective(exam, new Map(Object.entries(state.blind)));
      const balanced = balanceAnswerKey(exam);
      const normalized = normalizeExam(balanced.exam);
      exam = normalized.exam;
      const checks = finalChecks(exam, plan);
      set(state, "check", "done", checks.length ? `${plural(checks.length, "note")} for you` : "Totals, numbering and answer key all correct");
      if (balanced.moved) state.log.push(`Spread the multiple-choice answer key across the letters (${balanced.moved} moved).`);
      state.log.push("Checked the totals, numbering, duplicates and answer key.");

      const report: AgentReport = {
        steps: state.log,
        reviewed: state.moderated ? state.total : 0,
        revised: state.revised,
        unresolved: state.flagged,
        blind: {
          checked: finalBlind.checked,
          agreed: finalBlind.checked - finalBlind.disagreements.length,
          disagreements: finalBlind.disagreements,
        },
        keyMoved: balanced.moved,
        summary: state.summary,
        incomplete: state.incomplete,
        checks,
        bloom: examBloomShare(exam),
      };
      state.result = { exam, issues: [...normalized.issues.filter((i) => i.level === "fixed"), ...checks], report };
      state.exam = exam;
      state.phase = "done";
      return state;
    }

    case "done":
      return state;
  }
}

/** One moderation call; an unreadable review is asked for once more, and is never a pass. */
async function moderateOnce(panel: Panel, state: AgentState, only?: string[]) {
  let reply = await panel.moderate(state.exam!, state.blind, only);
  if (reply.unreadable) reply = await panel.moderate(state.exam!, state.blind, only);
  if (reply.unreadable) throw new PanelError("the review could not be read", true);
  return reply;
}

function finishRevising(state: AgentState) {
  const n = state.flagged.length;
  if (state.revised.length) set(state, "revise", "done", `${plural(state.revised.length, "question")} improved${n ? `, ${n} for you to check` : ""}`);
  else if (n && state.moderated) set(state, "revise", "failed", `${n} for you to check`);
  else set(state, "revise", "skipped", "Nothing to revise");
  state.recheck = [];
  state.phase = "check";
}

/** Run every phase in turn, saving nothing: for tests and scripts. */
export async function runToEnd(plan: ExamPlan, panel: Panel, opts: { school?: string } = {}): Promise<AgentState> {
  let state = initialState();
  for (let guard = 0; state.phase !== "done" && guard < 20; guard++) {
    // Round-trip through JSON, as the server does between phases.
    state = JSON.parse(JSON.stringify(await advance(plan, state, panel, opts)));
  }
  return state;
}
