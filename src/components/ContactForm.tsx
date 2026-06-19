"use client";

import { useState } from "react";

type FieldErrors = Partial<Record<"name" | "email" | "company" | "message", string[]>>;
type Status = { kind: "idle" | "submitting" | "success" | "error"; message?: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setStatus({ kind: "submitting" });

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        form.reset();
        setStatus({
          kind: "success",
          message: "Thanks — your message is in. We'll be in touch shortly.",
        });
        return;
      }

      const payload = await res.json().catch(() => null);
      if (res.status === 422 && payload?.issues) {
        setErrors(payload.issues as FieldErrors);
        setStatus({ kind: "error", message: "Please fix the highlighted fields." });
      } else {
        setStatus({
          kind: "error",
          message: payload?.error ?? "Something went wrong. Please try again.",
        });
      }
    } catch {
      setStatus({ kind: "error", message: "Network error. Please try again." });
    }
  }

  const submitting = status.kind === "submitting";

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-row">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" placeholder="Jane Doe" autoComplete="name" />
          {errors.name && <span className="field-error">{errors.name[0]}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="jane@company.com" autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email[0]}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="company">Company <span style={{ opacity: 0.5 }}>(optional)</span></label>
        <input id="company" name="company" type="text" placeholder="Acme Inc" autoComplete="organization" />
        {errors.company && <span className="field-error">{errors.company[0]}</span>}
      </div>

      <div className="field">
        <label htmlFor="message">What are you working on?</label>
        <textarea id="message" name="message" placeholder="Even a rough idea is a good place to start…" />
        {errors.message && <span className="field-error">{errors.message[0]}</span>}
      </div>

      {/* Honeypot: hidden from humans, tempting for bots. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status.message && (
        <div className={`form-status ${status.kind === "success" ? "success" : "error"}`}>
          {status.message}
        </div>
      )}

      <button type="submit" className="btn-filled contact-submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send us a message"}
      </button>
    </form>
  );
}
