"use client";

import { PROBLEM_LABELS, type AgentReport } from "@/lib/examAgent/assemble";
import { PLAN_BLOOMS } from "@/lib/examAgent/plan";

/** What the examining panel checked, changed, and left for the teacher. */
export default function QualityReport({ report }: { report: AgentReport }) {
  const { blind } = report;
  return (
    <details className="quality-report" open>
      <summary>
        Examiner&apos;s report
        <span className={report.unresolved.length || report.incomplete.length ? "qr-badge is-warn" : "qr-badge"}>
          {report.unresolved.length ? `${report.unresolved.length} to check` : report.incomplete.length ? "Partly checked" : "Moderated"}
        </span>
      </summary>

      <div className="qr-stats">
        <span><strong>{report.reviewed}</strong> questions moderated</span>
        <span><strong>{report.revised.length}</strong> revised</span>
        {blind.checked > 0 && (
          <span>
            <strong>{blind.agreed}/{blind.checked}</strong> objective answers confirmed blind
          </span>
        )}
        {report.keyMoved > 0 && <span><strong>{report.keyMoved}</strong> key letters spread</span>}
      </div>

      {report.summary && <blockquote className="qr-summary">{report.summary}</blockquote>}

      {report.incomplete.length > 0 && (
        <div className="qr-block qr-warn">
          <h4>Not every check could run</h4>
          <ul>
            {report.incomplete.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {report.unresolved.length > 0 && (
        <div className="qr-block qr-warn">
          <h4>Please check these before printing</h4>
          <ul>
            {report.unresolved.map((v) => (
              <li key={v.number}>
                <strong>Question {v.number}</strong> — {v.problems.map((p) => PROBLEM_LABELS[p]).join(", ")}. {v.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.revised.length > 0 && (
        <div className="qr-block">
          <h4>Sent back and rewritten</h4>
          <ul>
            {report.revised.map((v) => (
              <li key={v.number}>
                <strong>Question {v.number}</strong> — {v.problems.map((p) => PROBLEM_LABELS[p]).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.checks.length > 0 && (
        <div className="qr-block qr-warn">
          <h4>Final checks</h4>
          <ul>
            {report.checks.map((c) => (
              <li key={c.message}>{c.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="qr-block">
        <h4>Thinking levels in the paper, by marks</h4>
        <div className="plan-balance">
          {PLAN_BLOOMS.filter((b) => report.bloom[b] > 0).map((b) => (
            <span key={b} className="plan-chip">
              {b} {Math.round(report.bloom[b] * 100)}%
            </span>
          ))}
        </div>
      </div>

      <div className="qr-block">
        <h4>What the panel did</h4>
        <ol className="qr-steps">
          {report.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>
    </details>
  );
}
