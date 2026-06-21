"use client";

import { useState, useRef, useEffect } from "react";
import Nav from "@/components/Nav";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What services does Dolese Tech offer?",
  "Tell me about cloud infrastructure pricing",
  "How does the education portal work?",
  "What technologies do you specialise in?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }

  async function send(text: string = input.trim()) {
    if (!text || streaming) return;
    setError("");
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMessage: Message = { role: "user", content: text };
    const next = [...messages, userMessage];
    setMessages(next);
    setStreaming(true);

    let assistantContent = "";
    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
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
            if (evt.content) {
              assistantContent += evt.content;
              setMessages([...next, { role: "assistant", content: assistantContent }]);
            }
          } catch {
            /* ignore non-JSON keep-alive lines */
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setMessages(next);
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat-root">
      <Nav />
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-brand">
            <div className="chat-sidebar-dot" />
            <span>Dolese Tech AI</span>
          </div>
          <button
            className="chat-new-btn"
            onClick={() => {
              setMessages([]);
              setError("");
            }}
          >
            + New chat
          </button>
          <div className="chat-sidebar-divider" />
          <p className="chat-sidebar-hint">
            Ask anything about our services, technologies, or the education portal.
          </p>
        </aside>

        <div className="chat-main">
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
                    <button key={s} className="chat-suggestion" onClick={() => send(s)}>
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
                  <div className={`chat-bubble ${m.role}`}>
                    {m.content === "" && m.role === "assistant" ? (
                      <span className="chat-typing">
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : (
                      <span className="chat-text">{m.content}</span>
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
                onChange={(e) => {
                  setInput(e.target.value);
                  autoGrow();
                }}
                onKeyDown={handleKey}
                disabled={streaming}
                rows={1}
              />
              <button
                className={`chat-send-btn ${streaming || !input.trim() ? "disabled" : ""}`}
                onClick={() => send()}
                disabled={streaming || !input.trim()}
                aria-label="Send"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="chat-disclaimer">AI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
