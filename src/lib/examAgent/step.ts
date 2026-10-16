import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { complete, providerConfigError } from "../aiComplete";
import { classifyAiError } from "../aiErrors";
import { isAllowedModel, modelProvider } from "../chatModels";
import { guardAi } from "../limits";

/** The examining panel's default: careful enough to moderate, fast enough to wait for. */
export const DEFAULT_AGENT_MODEL = "claude-sonnet-4-6";

/**
 * One step of the examining panel as an API route: read and check the body,
 * pick the model, charge the AI budget, make one model call, and hand the
 * reply to `finish`. Each step is one short request, so no request runs near
 * the platform's time limit, and a slow step can be retried on its own.
 */
export async function runStep<S extends z.ZodTypeAny>(
  req: NextRequest,
  schema: S,
  label: string,
  prompt: (body: z.infer<S>) => { system: string; user: string; maxTokens: number } | NextResponse,
  finish: (raw: string, body: z.infer<S>) => unknown,
): Promise<NextResponse> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const body = parsed.data as z.infer<S> & { model?: string };
  const model = body.model && isAllowedModel(body.model) ? body.model : DEFAULT_AGENT_MODEL;
  const configError = providerConfigError(modelProvider(model));
  if (configError) return NextResponse.json({ error: configError }, { status: 503 });

  const built = prompt(body);
  if (built instanceof NextResponse) return built;

  const denied = await guardAi(req, "exams", model);
  if (denied) return denied;

  try {
    const raw = await complete(model, built.system, built.user, built.maxTokens);
    const result = finish(raw, body);
    return result instanceof NextResponse ? result : NextResponse.json(result);
  } catch (err) {
    console.error(`Exam agent (${label}) error:`, err);
    const { status, message } = classifyAiError(err, "Exam generation");
    return NextResponse.json({ error: message }, { status });
  }
}
