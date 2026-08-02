/**
 * One-shot completion against whichever provider a model belongs to.
 * Shared by the exam generator and the single-question regenerator so both
 * use identical provider routing, token budget and text extraction.
 */
import Anthropic from "@anthropic-ai/sdk";
import { modelProvider, type Provider } from "./chatModels";
import { geminiKey, geminiComplete } from "./gemini";

/** A full 100-mark paper carries its marking scheme inline, so it needs room. */
export const EXAM_MAX_TOKENS = 16000;
/** A single question is small; a tight budget keeps regeneration fast. */
export const QUESTION_MAX_TOKENS = 2000;

/** Returns an error message if the provider for `model` is not configured. */
export function providerConfigError(provider: Provider): string | null {
  if (provider === "google" && !geminiKey()) return "Gemini not configured. Set GEMINI_API_KEY.";
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY?.trim()) {
    return "AI service not configured. Set ANTHROPIC_API_KEY.";
  }
  return null;
}

export async function complete(
  model: string,
  system: string,
  user: string,
  maxTokens: number = EXAM_MAX_TOKENS,
): Promise<string> {
  if (modelProvider(model) === "google") {
    return geminiComplete(model, system, user, { json: true });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("AI service not configured. Set ANTHROPIC_API_KEY.");
  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const message = await stream.finalMessage();
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}
