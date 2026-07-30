/**
 * Google Gemini helpers (server-only). Kept separate from the Anthropic path so
 * each provider uses its own official SDK. Reads GEMINI_API_KEY (or GOOGLE_API_KEY).
 */
import { GoogleGenerativeAI, type GenerateContentResponse } from "@google/generative-ai";

export function geminiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
}

export interface SimpleMessage {
  role: "user" | "assistant";
  content: string;
}

function client(): GoogleGenerativeAI {
  const key = geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI(key);
}

/**
 * Pull text out of a Gemini response WITHOUT letting response.text() throw.
 * The SDK helper throws when the top candidate has no text part (e.g. a 2.5
 * "thinking" model that hit MAX_TOKENS, or a SAFETY/RECITATION block). We read
 * the parts directly and surface a clear reason instead of a generic 500.
 */
function extractText(response: GenerateContentResponse): string {
  const candidate = response?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const text = parts
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join("")
    .trim();
  if (text) return text;

  const reason =
    candidate?.finishReason ||
    response?.promptFeedback?.blockReason ||
    "no content returned";
  throw new Error(`Gemini returned no text (${reason})`);
}

/** Stream assistant text chunks for a chat conversation. */
export async function* geminiStream(
  modelId: string,
  system: string,
  messages: SimpleMessage[],
): AsyncGenerator<string> {
  const model = client().getGenerativeModel({ model: modelId, systemInstruction: system });
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const result = await model.generateContentStream({
    contents,
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
  });
  for await (const chunk of result.stream) {
    const t = chunk.text();
    if (t) yield t;
  }
}

/**
 * One-shot completion — used by the exam generator. `json` requests strict JSON
 * output. A generous maxOutputTokens is essential for 2.5 models: they spend
 * output budget on internal reasoning, so a small/absent limit makes them finish
 * as MAX_TOKENS with an empty answer.
 */
export async function geminiComplete(
  modelId: string,
  system: string,
  userText: string,
  opts: { json?: boolean } = {},
): Promise<string> {
  const model = client().getGenerativeModel({ model: modelId, systemInstruction: system });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.6,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  });
  return extractText(result.response);
}
