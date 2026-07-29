/**
 * Google Gemini helpers (server-only). Kept separate from the Anthropic path so
 * each provider uses its own official SDK. Reads GEMINI_API_KEY (or GOOGLE_API_KEY).
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const result = await model.generateContentStream({ contents });
  for await (const chunk of result.stream) {
    const t = chunk.text();
    if (t) yield t;
  }
}

/** One-shot completion — used by the exam generator. */
export async function geminiComplete(modelId: string, system: string, userText: string): Promise<string> {
  const model = client().getGenerativeModel({ model: modelId, systemInstruction: system });
  const result = await model.generateContent(userText);
  return result.response.text();
}
