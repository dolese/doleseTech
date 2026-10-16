/**
 * Translate raw provider SDK errors (Anthropic / Google Gemini) into a short,
 * actionable message and an appropriate HTTP status, instead of surfacing a wall
 * of provider JSON to the user.
 */
export interface AiErrorResult {
  status: number;
  message: string;
}

function statusOf(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const s = (err as { status?: unknown }).status;
    if (typeof s === "number") return s;
  }
  return undefined;
}

export function classifyAiError(err: unknown, action = "Generation"): AiErrorResult {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const status = statusOf(err);
  const has = (re: RegExp) => re.test(raw);

  // Quota / rate limit (e.g. Gemini Pro has no free-tier quota; daily cap hit).
  if (status === 429 || has(/\b429\b|too many requests|quota|rate.?limit|RESOURCE_EXHAUSTED/i)) {
    return {
      status: 429,
      message:
        "The AI provider's quota or rate limit was reached for this model. Try a faster model (Gemini Flash or Claude Haiku), switch provider, or check the API plan and billing — Gemini Pro often has no free-tier quota.",
    };
  }

  // Model missing / retired.
  if (status === 404 || has(/\b404\b|not found|no longer available/i)) {
    return { status: 502, message: "The selected AI model is unavailable. Please choose a different model and try again." };
  }

  // Auth / key problems.
  if (status === 401 || status === 403 || has(/\b401\b|\b403\b|api key|permission denied|unauthenticated|invalid.*key/i)) {
    return { status: 502, message: "AI service authentication failed. Please check the API key configuration." };
  }

  // The provider account has run out of credit: nothing the teacher can fix,
  // but another provider's model may still work. The details are in the logs.
  if (status === 402 || has(/credit balance|billing|payment required|insufficient.?(funds|credit)/i)) {
    return { status: 503, message: "This AI model is unavailable right now. Please choose a different model, or try again later." };
  }

  // Provider overloaded / transient.
  if (status === 503 || status === 529 || has(/\b503\b|\b529\b|overloaded|unavailable|timeout/i)) {
    return { status: 503, message: "The AI provider is temporarily unavailable. Please try again in a moment." };
  }

  // Anything else: the provider's own message stays in the server log, where
  // the callers write it; teachers get a plain one.
  return { status: 500, message: `${action} failed. Please try again.` };
}
