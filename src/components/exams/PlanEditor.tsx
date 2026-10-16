"use client";

import {
  ANY_TOPIC,
  PLAN_BLOOMS,
  PLAN_DIFFICULTIES,
  isObjectiveFormat,
  planBloomShare,
  planSectionMarks,
  planTotalMarks,
  planWarnings,
  type Bloom,
  type ExamPlan,
  type ItemDifficulty,
  type PlanItem,
} from "@/lib/examAgent/plan";

/**
 * The examiner's plan — the table of specifications — for the teacher to
 * check and adjust before a single question is written.
 */
export default function PlanEditor({
  plan,
  onChange,
  onApprove,
  busy,
}: {
  plan: ExamPlan;
  onChange: (plan: ExamPlan) => void;
  onApprove: () => void;
  busy: boolean;
}) {
  const warnings = planWarnings(plan);
  const blocking = planTotalMarks(plan) !== plan.totalMarks;
  const bloom = planBloomShare(plan);
  const topicChoices = [...plan.topicPool, ANY_TOPIC];

  function update(si: number, ii: number, patch: Partial<PlanItem>) {
    const next: ExamPlan = structuredClone(plan);
    const item = next.sections[si].items[ii];
    Object.assign(item, patch);
    // Objective questions: one mark per item.
    if (patch.marks !== undefined && isObjectiveFormat(item.format)) item.parts = item.marks;
    // Optional questions are alternatives: they keep equal marks.
    if (patch.marks !== undefined && next.sections[si].choose) {
      for (const other of next.sections[si].items) other.marks = item.marks;
    }
    onChange(next);
  }

  return (
    <div className="plan">
      <header className="plan-head">
        <div>
          <span className="plan-kicker">Step 1 of 2 · The examiner&apos;s plan</span>
          <h3>Table of specifications</h3>
          <p>
            {plan.official
              ? `Official NECTA structure for ${plan.subject} (${plan.level}).`
              : `Laid out from the question formats you chose.`}{" "}
            Check the topics, thinking levels and difficulty, change anything you like, then let the panel write the paper.
          </p>
        </div>
        <div className="plan-total">
          <strong>{planTotalMarks(plan)}</strong>
          <span>of {plan.totalMarks} marks</span>
        </div>
      </header>

      {plan.sections.map((section, si) => (
        <div className="plan-section" key={section.name}>
          <div className="plan-section-head">
            <strong>{section.name}</strong>
            <span>{planSectionMarks(section)} marks · {section.instructions}</span>
          </div>
          <div className="table-scroll">
            <table className="plan-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Format</th>
                  <th className="num">Marks</th>
                  <th>Topic</th>
                  <th>Thinking level</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item, ii) => (
                  <tr key={item.number}>
                    <td>{item.number}</td>
                    <td>
                      {item.format}
                      {item.parts > 0 && <small> · {item.parts} items</small>}
                    </td>
                    <td className="num">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={item.marks}
                        aria-label={`Marks for question ${item.number}`}
                        onChange={(e) => update(si, ii, { marks: Math.max(1, Number(e.target.value) || 1) })}
                        disabled={busy}
                      />
                    </td>
                    <td>
                      {item.topics.length > 1 ? (
                        <span className="plan-topics">{item.topics.join(" · ")}</span>
                      ) : (
                        <select
                          value={item.topics[0]}
                          aria-label={`Topic for question ${item.number}`}
                          onChange={(e) => update(si, ii, { topics: [e.target.value] })}
                          disabled={busy}
                        >
                          {topicChoices.includes(item.topics[0]) ? null : <option>{item.topics[0]}</option>}
                          {topicChoices.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <select
                        value={item.bloom}
                        aria-label={`Thinking level for question ${item.number}`}
                        onChange={(e) => update(si, ii, { bloom: e.target.value as Bloom })}
                        disabled={busy}
                      >
                        {PLAN_BLOOMS.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={item.difficulty}
                        aria-label={`Difficulty for question ${item.number}`}
                        onChange={(e) => update(si, ii, { difficulty: e.target.value as ItemDifficulty })}
                        disabled={busy}
                      >
                        {PLAN_DIFFICULTIES.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="plan-balance">
        <span>Thinking levels, by marks:</span>
        {PLAN_BLOOMS.filter((b) => bloom[b] > 0).map((b) => (
          <span key={b} className="plan-chip">
            {b} {Math.round(bloom[b] * 100)}%
          </span>
        ))}
      </div>

      {warnings.length > 0 && (
        <ul className="plan-warnings">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <div className="plan-actions">
        <button className="btn-filled" onClick={onApprove} disabled={busy || blocking}>
          Approve the plan and write the paper
        </button>
        <p>
          The panel writes every question, answers the paper blind, moderates each question and revises any that
          fall short. It usually takes one to three minutes.
        </p>
      </div>
    </div>
  );
}
