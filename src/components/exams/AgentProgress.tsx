"use client";

import type { StepProgress } from "@/lib/examAgent/run";

const ICON: Record<StepProgress["state"], string> = {
  waiting: "",
  running: "",
  done: "✓",
  skipped: "–",
  failed: "!",
};

/** The examining panel at work, step by step. */
export default function AgentProgress({ steps }: { steps: StepProgress[] }) {
  return (
    <div className="agent-progress" role="status" aria-live="polite">
      <span className="plan-kicker">Step 2 of 2 · The examining panel</span>
      <h3>Writing and checking your paper</h3>
      <ol>
        {steps.map((s) => (
          <li key={s.key} className={`agent-step is-${s.state}`}>
            <span className="agent-step-icon" aria-hidden="true">
              {s.state === "running" ? <span className="agent-spinner" /> : ICON[s.state]}
            </span>
            <span>
              <strong>{s.label}</strong>
              {s.detail && <small>{s.detail}</small>}
            </span>
          </li>
        ))}
      </ol>
      <p className="agent-note">Keep this page open. Each step is a separate examiner checking the one before.</p>
    </div>
  );
}
