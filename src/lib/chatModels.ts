/**
 * Models offered by the /chat assistant. Shared by the chat UI (model picker)
 * and the /api/chat route (allowlist + default). Claude family only — the
 * Anthropic SDK is already wired in; other providers would need their own SDK
 * and API key.
 */
export interface ChatModel {
  id: string;
  label: string;
  tagline: string;
  /** Supports adaptive extended thinking (the "Thinking" toggle). */
  thinking: boolean;
}

export const CHAT_MODELS: ChatModel[] = [
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", tagline: "Fast & efficient", thinking: false },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", tagline: "Balanced", thinking: true },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8", tagline: "Most capable", thinking: true },
];

// A website assistant defaults to the fast, low-cost model; users can switch up.
export const DEFAULT_MODEL = "claude-haiku-4-5";

export function isAllowedModel(id: string): boolean {
  return CHAT_MODELS.some((m) => m.id === id);
}

export function modelSupportsThinking(id: string): boolean {
  return CHAT_MODELS.find((m) => m.id === id)?.thinking ?? false;
}
