/**
 * The examining panel at work, run from the teacher's browser: one short API
 * request per step, so the teacher sees each step happen and no request runs
 * near the server's time limit.
 *
 *   1. Write     every section to the approved plan (in parallel chunks)
 *   2. Answer    the paper blind, as an independent examiner
 *   3. Moderate  every question against the plan and the checklist
 *   4. Revise    what was sent back, then re-check it — at most twice
 *   5. Check     totals, numbering, duplicates and the answer key, in code
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
/** Problems that make a question wrong, not just weaker: revised first. */
const SERIOUS = ["KEY", "SYLLABUS", "CLARITY", "MARKS"];

async function post<T>(url: string, body: unknown, attempts = 2): Promise<T> {
  let lastError: Error = new Error("Request failed.");
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return json as T;
      lastError = new Error(json.error ?? `HTTP ${res.status}`);
      // Limits and bad requests will not be different a second later.
      if (res.status === 429 || res.status === 422 || res.status === 503 || res.status === 400) break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError;
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

export interface AgentResult {
  exam: Exam;
  issues: ExamIssue[];
  report: AgentReport;
}

export async function runExamAgent(opts: {
  plan: ExamPlan;
  model: string;
  school?: string;
  instruction?: string;
  onProgress: (steps: StepProgress[]) => void;
}): Promise<AgentResult> {
  const { plan, model, instruction } = opts;
  const steps: StepProgress[] = STEPS.map((s) => ({ ...s, state: "waiting" }));
  const set = (key: StepProgress["key"], state: StepState, detail?: string) => {
    const step = steps.find((s) => s.key === key)!;
    step.state = state;
    if (detail !== undefined) step.detail = detail;
    opts.onProgress(steps.map((s) => ({ ...s })));
  };
  const log: string[] = [];

  // 1. Write.
  const jobs = plan.sections.flatMap((section, index) => chunks(section.items).map((items) => ({ index, items })));
  set("write", "running", `${jobs.length} part${jobs.length === 1 ? "" : "s"} of the paper, written in parallel`);
  let done = 0;
  const written = await Promise.all(
    jobs.map(async ({ index, items }) => {
      const numbers = items.map((i) => i.number);
      let reply = await post<{ questions: ExamQuestion[]; missing: string[] }>("/api/exams/agent/draft", {
        plan, section: index, numbers, instruction, model,
      });
      // Anything the setter left out or got unusably wrong is asked for once more.
      if (reply.missing.length) {
        const again = items.filter((i) => itemNumbers(i).some((n) => reply.missing.includes(n))).map((i) => i.number);
        const retry = await post<{ questions: ExamQuestion[]; missing: string[] }>("/api/exams/agent/draft", {
          plan, section: index, numbers: again, instruction, model,
        });
        const fixed = new Map(retry.questions.map((q) => [q.number, q]));
        const merged = items.flatMap(itemNumbers).map((n) => reply.questions.find((q) => q.number === n) ?? fixed.get(n)).filter(Boolean) as ExamQuestion[];
        reply = { questions: merged, missing: retry.missing };
      }
      done++;
      set("write", "running", `${done} of ${jobs.length} parts written`);
      return { index, questions: reply.questions, missing: reply.missing };
    }),
  );
  const missing = written.flatMap((w) => w.missing);
  if (missing.length) throw new Error(`Question${missing.length > 1 ? "s" : ""} ${missing.join(", ")} could not be written. Please try again.`);
  const bySection = plan.sections.map((_, i) => written.filter((w) => w.index === i).flatMap((w) => w.questions));
  let exam = assembleExam(plan, bySection, opts.school);
  const total = exam.sections.reduce((n, s) => n + s.questions.length, 0);
  set("write", "done", `${total} questions written`);
  log.push(`Wrote ${total} questions to the plan.`);

  // 2. Answer blind.
  set("solve", "running");
  const blind = new Map<string, string>();
  const solve = async (only?: string[]) => {
    const { answers } = await post<{ answers: { number: string; answer: string }[] }>("/api/exams/agent/solve", { plan, exam, only, model });
    for (const a of answers) blind.set(a.number, a.answer);
  };
  await solve();
  const firstCheck = compareObjective(exam, blind);
  set("solve", "done", `${blind.size} answered · ${firstCheck.checked - firstCheck.disagreements.length} of ${firstCheck.checked} objective answers agree with the key`);
  log.push(`An independent examiner answered ${blind.size} questions without the marking scheme.`);

  // 3. Moderate.
  set("moderate", "running");
  const moderate = async (only?: string[]) =>
    post<{ verdicts: Verdict[]; summary: string; unreadable?: boolean }>("/api/exams/agent/moderate", {
      plan, exam, blind: Object.fromEntries(blind), only, model,
    });
  let review = await moderate();
  if (review.unreadable) review = await moderate();
  const summary = review.summary;
  let flagged = merge(keyVerdicts(firstCheck.disagreements), review.verdicts);
  set("moderate", "done", flagged.length ? `${flagged.length} question${flagged.length === 1 ? "" : "s"} sent back` : "Every question passed");
  log.push(`The chief examiner moderated ${total} questions${flagged.length ? ` and sent back ${flagged.length}` : "; all passed"}.`);

  // 4. Revise and re-check.
  const revised: Verdict[] = [];
  if (!flagged.length) set("revise", "skipped", "Nothing to revise");
  for (let round = 1; round <= ROUNDS && flagged.length; round++) {
    const batch = flagged.slice().sort((a, b) => severity(a) - severity(b)).slice(0, MAX_REVISIONS);
    set("revise", "running", `Round ${round}: rewriting ${batch.length} question${batch.length === 1 ? "" : "s"}`);
    const result = await post<{ exam: Exam; revised: string[] }>("/api/exams/agent/revise", {
      plan,
      exam,
      instruction,
      model,
      requests: batch.map((v) => ({ number: v.number, problems: v.problems, note: v.note, blind: blind.get(v.number) })),
    });
    exam = result.exam;
    revised.push(...batch.filter((v) => result.revised.includes(v.number)));
    const recheck = result.revised;
    if (!recheck.length) break;

    set("revise", "running", `Round ${round}: checking ${recheck.length} revised question${recheck.length === 1 ? "" : "s"}`);
    for (const n of recheck) blind.delete(n);
    await solve(recheck);
    const again = compareObjective(
      { ...exam, sections: exam.sections.map((s) => ({ ...s, questions: s.questions.filter((q) => recheck.includes(q.number)) })) },
      blind,
    );
    const second = await moderate(recheck);
    // Questions not revised this round keep their earlier verdict.
    const leftOver = flagged.filter((v) => !batch.includes(v) || !result.revised.includes(v.number));
    flagged = merge(leftOver, keyVerdicts(again.disagreements), second.verdicts);
    log.push(`Round ${round}: rewrote ${recheck.length} question${recheck.length === 1 ? "" : "s"}; ${flagged.length} still need attention.`);
  }
  if (revised.length) set("revise", "done", `${revised.length} question${revised.length === 1 ? "" : "s"} improved${flagged.length ? `, ${flagged.length} for you to check` : ""}`);

  // 5. Final checks, in code.
  set("check", "running");
  // Compared before the key is balanced: moving options changes the letters.
  const finalBlind = compareObjective(exam, blind);
  const balanced = balanceAnswerKey(exam);
  exam = balanced.exam;
  const normalized = normalizeExam(exam);
  exam = normalized.exam;
  const checks = finalChecks(exam, plan);
  set("check", "done", checks.length ? `${checks.length} note${checks.length === 1 ? "" : "s"} for you` : "Totals, numbering and answer key all correct");
  if (balanced.moved) log.push(`Spread the multiple-choice answer key across the letters (${balanced.moved} moved).`);
  log.push("Checked the totals, numbering, duplicates and answer key.");

  const report: AgentReport = {
    steps: log,
    reviewed: total,
    revised,
    unresolved: flagged,
    blind: {
      checked: finalBlind.checked,
      agreed: finalBlind.checked - finalBlind.disagreements.length,
      disagreements: finalBlind.disagreements,
    },
    keyMoved: balanced.moved,
    summary,
    checks,
    bloom: examBloomShare(exam),
  };
  return { exam, issues: [...normalized.issues.filter((i) => i.level === "fixed"), ...checks], report };
}
