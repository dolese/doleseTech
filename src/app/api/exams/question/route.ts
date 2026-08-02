import { NextRequest, NextResponse } from "next/server";
import { isAllowedModel, modelProvider } from "@/lib/chatModels";
import { complete, providerConfigError, QUESTION_MAX_TOKENS } from "@/lib/aiComplete";
import { buildQuestionPrompt, parseReplacementQuestion, questionRegenSchema } from "@/lib/exams";
import { classifyAiError } from "@/lib/aiErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_EXAM_MODEL = "claude-sonnet-4-6";

/**
 * Regenerate ONE question in place. The replacement keeps the original question
 * number and mark allocation, so swapping it can never break the paper's
 * section or overall totals — the teacher keeps every other question.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = questionRegenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const reqData = parsed.data;
  const model = reqData.model && isAllowedModel(reqData.model) ? reqData.model : DEFAULT_EXAM_MODEL;

  const configError = providerConfigError(modelProvider(model));
  if (configError) return NextResponse.json({ error: configError }, { status: 503 });

  try {
    const { system, user } = buildQuestionPrompt(reqData);
    let question = parseReplacementQuestion(
      await complete(model, system, user, QUESTION_MAX_TOKENS),
      reqData.question,
    );

    // One retry — a single question is cheap, and a malformed first attempt
    // (bad option count, missing scheme) is usually fixed by asking again.
    if (!question) {
      question = parseReplacementQuestion(
        await complete(model, system, `${user}\n\nYour previous attempt was invalid. Return ONLY a well-formed JSON object with a complete marking scheme.`, QUESTION_MAX_TOKENS),
        reqData.question,
      );
    }

    if (!question) {
      return NextResponse.json({ error: "The model did not return a usable question. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ question, model });
  } catch (err) {
    console.error("Question regeneration error:", err);
    const { status, message } = classifyAiError(err, "Question regeneration");
    return NextResponse.json({ error: message }, { status });
  }
}
