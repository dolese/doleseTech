"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";
import type { QuizQuestion } from "@/lib/programming";
import RichText from "./RichText";

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [chosen, setChosen] = useState<(number | undefined)[]>(() => questions.map(() => undefined));
  const [checked, setChecked] = useState(false);

  const answered = chosen.filter((c) => c !== undefined).length;
  const score = questions.reduce((n, q, i) => n + (chosen[i] === q.answer ? 1 : 0), 0);

  const choose = (qi: number, oi: number) => {
    if (checked) return;
    setChosen((prev) => prev.map((c, i) => (i === qi ? oi : c)));
  };

  const reset = () => {
    setChosen(questions.map(() => undefined));
    setChecked(false);
  };

  return (
    <section className="prog-quiz" aria-labelledby="quiz-title">
      <h2 id="quiz-title">Check your understanding</h2>
      <ol className="prog-quiz-list">
        {questions.map((q, qi) => (
          <li key={qi} className="prog-quiz-q">
            <p className="prog-quiz-question">
              <RichText text={q.question} />
            </p>
            <div className="prog-quiz-options" role="radiogroup" aria-label={`Question ${qi + 1}`}>
              {q.options.map((opt, oi) => {
                const state = !checked
                  ? chosen[qi] === oi
                    ? "is-chosen"
                    : ""
                  : oi === q.answer
                    ? "is-correct"
                    : chosen[qi] === oi
                      ? "is-wrong"
                      : "";
                return (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={chosen[qi] === oi}
                    className={`prog-quiz-option ${state}`}
                    onClick={() => choose(qi, oi)}
                    disabled={checked}
                  >
                    <span className="prog-quiz-letter">{String.fromCharCode(65 + oi)}</span>
                    <span>
                      <RichText text={opt} />
                    </span>
                  </button>
                );
              })}
            </div>
            {checked && (
              <p className={`prog-quiz-explain ${chosen[qi] === q.answer ? "is-correct" : "is-wrong"}`}>
                <strong>{chosen[qi] === q.answer ? "Correct. " : "Not quite. "}</strong>
                <RichText text={q.explanation} />
              </p>
            )}
          </li>
        ))}
      </ol>
      <div className="prog-quiz-actions">
        {checked ? (
          <>
            <p className="prog-quiz-score" role="status">
              You scored {score} / {questions.length}
              {score === questions.length ? " — excellent!" : ""}
            </p>
            <button type="button" className="btn-outline" onClick={reset}>
              Try again
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              setChecked(true);
              track("Quiz checked", { page: window.location.pathname, score, total: questions.length });
            }}
            disabled={answered < questions.length}
          >
            {answered < questions.length ? `Answer all ${questions.length} questions` : "Check answers"}
          </button>
        )}
      </div>
    </section>
  );
}
