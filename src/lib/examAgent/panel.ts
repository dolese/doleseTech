/**
 * The examining panel's model calls, made on the server. Each examiner is
 * one call; a busy provider or a dropped connection is tried again after a
 * pause, while limits, missing credit and bad keys are not — they will not
 * be different a moment later.
 */
import { complete } from "../aiComplete";
import { classifyAiError } from "../aiErrors";
import {
  applyRevisions,
  blindReply,
  cleanVerdicts,
  moderationReply,
  parseJson,
  pinQuestions,
  withoutSchemes,
} from "./assemble";
import type { ExamPlan } from "./plan";
import { draftPrompt, moderatePrompt, revisePrompt, solvePrompt } from "./prompts";
import { PanelError, type Panel } from "./run";

/** The examining panel's default: careful enough to moderate, fast enough to wait for. */
export const DEFAULT_AGENT_MODEL = "claude-sonnet-4-6";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function call(model: string, label: string, prompt: { system: string; user: string }, maxTokens: number): Promise<string> {
  let last: PanelError = new PanelError("the AI service did not answer", true);
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (attempt > 1) await pause(attempt === 2 ? 3000 : 8000);
    try {
      return await complete(model, prompt.system, prompt.user, maxTokens);
    } catch (err) {
      console.error(`Exam agent (${label}) error:`, err);
      const { message, retryable } = classifyAiError(err, "Exam generation");
      last = new PanelError(message, retryable);
      if (!retryable) break;
    }
  }
  throw last;
}

export function createPanel({ plan, model, instruction }: { plan: ExamPlan; model: string; instruction?: string }): Panel {
  return {
    async draft(section, numbers) {
      const raw = await call(model, "draft", draftPrompt(plan, section, numbers, instruction), 12000);
      const items = plan.sections[section].items.filter((i) => numbers.includes(i.number));
      const { questions, missing } = pinQuestions(items, raw);
      if (!questions.length) throw new PanelError("the questions could not be written", true);
      return { questions, missing };
    },

    async solve(exam, only) {
      // The marking scheme is removed here, so it can never reach this prompt.
      const questions = withoutSchemes(exam).filter((q) => !only || only.includes(q.number));
      const raw = await call(model, "solve", solvePrompt(plan, questions), 6000);
      return parseJson(raw, blindReply)?.answers ?? [];
    },

    async moderate(exam, blind, only) {
      const raw = await call(model, "moderate", moderatePrompt(plan, exam, new Map(Object.entries(blind)), only), 6000);
      const reply = parseJson(raw, moderationReply);
      // An unreadable review is not a pass: say so, and the run reports it.
      if (!reply) return { verdicts: [], summary: "", unreadable: true };
      const verdicts = cleanVerdicts(exam, reply.verdicts).filter((v) => !only || only.includes(v.number));
      return { verdicts, summary: reply.summary.slice(0, 1200) };
    },

    async revise(exam, requests) {
      const byNumber = new Map(exam.sections.flatMap((s) => s.questions).map((q) => [q.number, q]));
      const wanted = requests.filter((r) => byNumber.has(r.number));
      const raw = await call(
        model,
        "revise",
        revisePrompt(plan, wanted.map((r) => ({ question: byNumber.get(r.number)!, problems: r.problems, note: r.note, blind: r.blind })), instruction),
        10000,
      );
      return applyRevisions(exam, plan, raw, wanted.map((r) => r.number));
    },
  };
}
