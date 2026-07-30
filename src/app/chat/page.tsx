"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
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

function CodeBlock({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match && typeof children === "string" && !children.includes("\n");

  if (isInline) {
    return <code className={className} {...props}>{children}</code>;
  }

  const text = String(children).replace(/\n$/, "");

  function handleCopy() {
    navigator.clipboard?.writeText(text);
  }

  return (
    <div className="chat-code-block">
      <div className="chat-code-header">
        <span className="chat-code-lang">{match?.[1] ?? "code"}</span>
        <button type="button" className="chat-code-copy" onClick={handleCopy}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </button>
      </div>
      <pre><code className={className}>{text}</code></pre>
    </div>
  );
}

function TableWrapper({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="chat-table-scroll">
      <table {...props}>{children}</table>
    </div>
  );
}

const mdComponents: Components = {
  code: CodeBlock as Components["code"],
  table: TableWrapper as Components["table"],
};

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

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
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streaming, isNearBottom]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const threshold = 120;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setIsNearBottom(atBottom);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };

    if (window.innerWidth <= 768) {
      document.body.style.overflow = "hidden";
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [sidebarOpen]);

  // Mobile viewport height fix for keyboard
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    function onResize() {
      document.documentElement.style.setProperty(
        "--chat-vh",
        `${vv!.height}px`
      );
    }
    onResize();
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

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
    setTimeout(() => textareaRef.current?.focus(), 50);
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
    setIsNearBottom(true);
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
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }
  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function activateConversation(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
    setIsNearBottom(true);
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
        <aside
          id="chat-sidebar"
          className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}
          aria-label="Chat conversations"
        >
          <div className="chat-sidebar-head">
            <div className="chat-sidebar-brand">
              <div className="chat-sidebar-dot" />
              <span>Dolese Tech AI</span>
            </div>
            <button
              type="button"
              className="chat-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close chat list"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <button
            className="chat-new-btn"
            onClick={() => {
              startNewChat();
              setSidebarOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>

          <div className="chat-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="search"
              placeholder="Search chats..."
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
                  onClick={() => activateConversation(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      activateConversation(c.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={c.id === activeId}
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
                        <button aria-label="Rename" onClick={(e) => { e.stopPropagation(); beginRename(c); }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                        </button>
                        <button aria-label="Delete" onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
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

        {sidebarOpen && <div className="chat-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <div className="chat-main">
          <div className="chat-topbar">
            <div className="chat-topbar-left">
              <button
                className="chat-menu-btn"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-expanded={sidebarOpen}
                aria-controls="chat-sidebar"
                aria-label="Toggle chat list"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="chat-topbar-model">
                <span className="chat-topbar-dot" />
                <span className="chat-topbar-name">{activeModel?.label ?? "Claude"}</span>
                <span className="chat-topbar-tagline">{activeModel?.tagline}</span>
              </div>
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
              <span className="chat-think-label">Thinking</span>
            </button>
          </div>

          <div className="chat-messages" ref={messagesRef}>
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
                    <button key={s} className="chat-suggestion" onClick={() => send(s)}>
                      <svg className="chat-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {s}
                    </button>
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
                        <summary>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="chat-thinking-icon">
                            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
                          </svg>
                          Thinking
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="chat-thinking-chevron">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </summary>
                        <div className="chat-thinking-body">{m.thinking}</div>
                      </details>
                    ) : null}
                    <div className={`chat-bubble ${m.role}`}>
                      {m.content === "" && m.role === "assistant" ? (
                        <span className="chat-typing"><span /><span /><span /></span>
                      ) : m.role === "assistant" ? (
                        <div className="chat-md">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <span className="chat-text">{m.content}</span>
                      )}
                    </div>
                    {m.role === "assistant" && m.content !== "" && !streaming && (
                      <div className="chat-msg-actions">
                        <button onClick={() => copy(m.content)} title="Copy message">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Copy
                        </button>
                        {i === lastAssistantIdx && (
                          <button onClick={regenerate} title="Regenerate response">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1 4 1 10 7 10" />
                              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                            Retry
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {error && (
              <div className="chat-error-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
                <button onClick={() => setError("")} aria-label="Dismiss error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {!isNearBottom && messages.length > 0 && (
            <button
              className="chat-scroll-bottom"
              onClick={() => {
                setIsNearBottom(true);
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              aria-label="Scroll to bottom"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}

          <div className="chat-input-area">
            <div className="chat-input-box">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Message Dolese Tech AI..."
                value={input}
                onChange={(e) => { setInput(e.target.value); autoGrow(); }}
                onKeyDown={handleKey}
                disabled={streaming}
                rows={1}
              />
              <div className="chat-input-right">
                {streaming ? (
                  <button className="chat-stop-btn" onClick={stop} aria-label="Stop generating">
                    <svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2" /></svg>
                  </button>
                ) : (
                  <button
                    className={`chat-send-btn ${!input.trim() ? "disabled" : ""}`}
                    onClick={() => send()}
                    disabled={!input.trim()}
                    aria-label="Send message"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <p className="chat-disclaimer">
              {activeModel?.label ?? "Claude"} can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
