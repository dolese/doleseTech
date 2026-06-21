"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Nav from "@/components/Nav";
import { CHAT_MODELS, DEFAULT_MODEL, modelSupportsThinking } from "@/lib/chatModels";

interface Message {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
}
interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
}

const STORAGE_KEY = "dolese_chat_conversations_v1";
const THINK_KEY = "dolese_chat_thinking";

const SUGGESTIONS = [
  "What services does Dolese Tech offer?",
  "Tell me about cloud infrastructure pricing",
  "How does the education portal work?",
  "What technologies do you specialise in?",
];

function newConversation(): Conversation {
  return {
    id: crypto?.randomUUID?.() ?? String(Date.now()),
    title: "New chat",
    model: DEFAULT_MODEL,
    messages: [],
  };
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [thinkingOn, setThinkingOn] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const active = conversations.find((c) => c.id === activeId);
  const messages = active?.messages ?? [];
  const canThink = modelSupportsThinking(active?.model ?? DEFAULT_MODEL);
  const activeModel = CHAT_MODELS.find((m) => m.id === active?.model);

  // ── Load / persist ──────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved: Conversation[] = raw ? JSON.parse(raw) : [];
      if (saved.length) {
        setConversations(saved);
        setActiveId(saved[0].id);
      } else {
        const c = newConversation();
        setConversations([c]);
        setActiveId(c.id);
      }
      setThinkingOn(localStorage.getItem(THINK_KEY) === "1");
    } catch {
      const c = newConversation();
      setConversations([c]);
      setActiveId(c.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(THINK_KEY, thinkingOn ? "1" : "0");
  }, [thinkingOn, hydrated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // ── Conversation helpers ────────────────────────────────────
  const patchActive = useCallback(
    (fn: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === activeId ? fn(c) : c)));
    },
    [activeId],
  );

  function startNewChat() {
    const c = newConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    setError("");
  }

  function deleteConversation(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const c = newConversation();
        setActiveId(c.id);
        return [c];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }

  function setModel(model: string) {
    patchActive((c) => ({ ...c, model }));
  }

  function beginRename(c: Conversation) {
    setEditingId(c.id);
    setEditTitle(c.title);
  }
  function commitRename() {
    if (editingId) {
      const t = editTitle.trim();
      setConversations((prev) => prev.map((c) => (c.id === editingId ? { ...c, title: t || "Untitled" } : c)));
    }
    setEditingId(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [conversations, search]);

  // ── Streaming ───────────────────────────────────────────────
  async function streamAssistant(history: Message[], model: string) {
    setError("");
    setStreaming(true);
    patchActive((c) => ({ ...c, messages: [...history, { role: "assistant", content: "", thinking: "" }] }));

    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";
    let think = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model, thinking: thinkingOn }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.startsWith("data: ") ? part.slice(6) : part;
          try {
            const evt = JSON.parse(line);
            if (evt.error) throw new Error(evt.error);
            if (evt.thinking) think += evt.thinking;
            if (evt.content) answer += evt.content;
            if (evt.thinking || evt.content) {
              patchActive((c) => {
                const msgs = c.messages.slice();
                msgs[msgs.length - 1] = { role: "assistant", content: answer, thinking: think };
                return { ...c, messages: msgs };
              });
            }
          } catch {
            /* ignore non-JSON keep-alive lines */
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        patchActive((c) => ({
          ...c,
          messages: c.messages.filter(
            (m, i) => !(i === c.messages.length - 1 && m.role === "assistant" && m.content === ""),
          ),
        }));
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        patchActive((c) => ({ ...c, messages: history }));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  async function send(text: string = input.trim()) {
    if (!text || streaming || !active) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const history = [...active.messages, { role: "user" as const, content: text }];
    const isFirst = active.messages.length === 0;
    patchActive((c) => ({ ...c, title: isFirst ? text.slice(0, 42) : c.title, messages: history }));
    await streamAssistant(history, active.model);
  }

  function regenerate() {
    if (streaming || !active) return;
    const msgs = active.messages.slice();
    if (msgs.length && msgs[msgs.length - 1].role === "assistant") msgs.pop();
    if (!msgs.length) return;
    patchActive((c) => ({ ...c, messages: msgs }));
    streamAssistant(msgs, active.model);
  }

  function stop() {
    abortRef.current?.abort();
  }
  function copy(text: string) {
    navigator.clipboard?.writeText(text);
  }
  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }
  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "assistant") return i;
    return -1;
  })();

  return (
    <div className="chat-root">
      <Nav />
      <div className="chat-layout">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-brand">
            <div className="chat-sidebar-dot" />
            <span>Dolese Tech AI</span>
          </div>
          <button className="chat-new-btn" onClick={startNewChat}>+ New chat</button>

          <div className="chat-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="search"
              placeholder="Search chats…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search chats"
            />
          </div>

          <div className="chat-convos">
            {filtered.length === 0 ? (
              <p className="chat-convos-empty">No chats found.</p>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  className={`chat-convo ${c.id === activeId ? "active" : ""}`}
                  onClick={() => setActiveId(c.id)}
                >
                  {editingId === c.id ? (
                    <input
                      className="chat-convo-edit"
                      value={editTitle}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <>
                      <span className="chat-convo-title">{c.title}</span>
                      <span className="chat-convo-actions">
                        <button aria-label="Rename" onClick={(e) => { e.stopPropagation(); beginRename(c); }}>✎</button>
                        <button aria-label="Delete" onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}>×</button>
                      </span>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="chat-model-picker">
            <label htmlFor="chat-model">Model</label>
            <select
              id="chat-model"
              value={active?.model ?? DEFAULT_MODEL}
              onChange={(e) => setModel(e.target.value)}
              disabled={streaming}
            >
              {CHAT_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label} — {m.tagline}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main */}
        <div className="chat-main">
          <div className="chat-topbar">
            <div className="chat-topbar-model">
              <span className="chat-topbar-dot" />
              {activeModel?.label ?? "Claude"}
              <span className="chat-topbar-tagline">{activeModel?.tagline}</span>
            </div>
            <button
              className={`chat-think-toggle ${thinkingOn ? "on" : ""}`}
              onClick={() => setThinkingOn((v) => !v)}
              disabled={!canThink}
              title={canThink ? "Show the model's reasoning" : "Not available on this model"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
              </svg>
              Thinking
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-logo">
                  <svg viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="#16235B" />
                    <path d="M12 20h16M20 12v16" stroke="#1E9E48" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="chat-welcome-title">How can I help you?</h2>
                <p className="chat-welcome-sub">
                  I&apos;m Dolese Tech&apos;s AI assistant. Ask me about services, pricing,
                  technologies, or anything else.
                </p>
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chat-suggestion" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`chat-message-row ${m.role}`}>
                  {m.role === "assistant" && (
                    <div className="chat-avatar">
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#16235B" />
                        <path d="M8 12h8M12 8v8" stroke="#1E9E48" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                  <div className="chat-bubble-wrap">
                    {m.role === "assistant" && m.thinking ? (
                      <details className="chat-thinking">
                        <summary>💭 Thinking</summary>
                        <div className="chat-thinking-body">{m.thinking}</div>
                      </details>
                    ) : null}
                    <div className={`chat-bubble ${m.role}`}>
                      {m.content === "" && m.role === "assistant" ? (
                        <span className="chat-typing"><span /><span /><span /></span>
                      ) : m.role === "assistant" ? (
                        <div className="chat-md">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <span className="chat-text">{m.content}</span>
                      )}
                    </div>
                    {m.role === "assistant" && m.content !== "" && !streaming && (
                      <div className="chat-msg-actions">
                        <button onClick={() => copy(m.content)}>Copy</button>
                        {i === lastAssistantIdx && <button onClick={regenerate}>Regenerate</button>}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {error && <div className="chat-error-banner">{error}</div>}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <div className="chat-input-box">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Message Dolese Tech AI…"
                value={input}
                onChange={(e) => { setInput(e.target.value); autoGrow(); }}
                onKeyDown={handleKey}
                disabled={streaming}
                rows={1}
              />
              {streaming ? (
                <button className="chat-stop-btn" onClick={stop} aria-label="Stop">
                  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2" /></svg>
                </button>
              ) : (
                <button
                  className={`chat-send-btn ${!input.trim() ? "disabled" : ""}`}
                  onClick={() => send()}
                  disabled={!input.trim()}
                  aria-label="Send"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              )}
            </div>
            <p className="chat-disclaimer">
              {activeModel?.label ?? "Claude"} · AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
