/**
 * Models offered by the /chat assistant and the /exams composer. Shared by the
 * UI (model picker) and the API routes (allowlist + provider routing).
 * Two providers: Anthropic (Claude) and Google (Gemini) — each with its own SDK
 * and API key (ANTHROPIC_API_KEY / GEMINI_API_KEY).
 */
export type Provider = "anthropic" | "google";

export interface ChatModel {
  id: string;
  label: string;
  tagline: string;
  provider: Provider;
  /** Supports adaptive extended thinking (the "Thinking" toggle — Anthropic only). */
  thinking: boolean;
}

export const CHAT_MODELS: ChatModel[] = [
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", tagline: "Fast & efficient", provider: "anthropic", thinking: false },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", tagline: "Balanced", provider: "anthropic", thinking: true },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8", tagline: "Most capable", provider: "anthropic", thinking: true },
  // Use Google's auto-updating aliases so these don't 404 when a specific
  // Gemini version is retired (e.g. gemini-2.5-flash was pulled for new users).
  { id: "gemini-flash-latest", label: "Gemini Flash", tagline: "Google · fast", provider: "google", thinking: false },
  { id: "gemini-pro-latest", label: "Gemini Pro", tagline: "Google · most capable", provider: "google", thinking: false },
];

// A website assistant defaults to the fast, low-cost model; users can switch up.
export const DEFAULT_MODEL = "claude-haiku-4-5";

export function isAllowedModel(id: string): boolean {
  return CHAT_MODELS.some((m) => m.id === id);
}

export function modelSupportsThinking(id: string): boolean {
  return CHAT_MODELS.find((m) => m.id === id)?.thinking ?? false;
}

export function modelProvider(id: string): Provider {
  return CHAT_MODELS.find((m) => m.id === id)?.provider ?? "anthropic";
}
