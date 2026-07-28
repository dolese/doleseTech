"use client";

import { useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SUBJECTS, SUBJECT_TOPICS, subjectSlug } from "@/lib/education";
import { CHAT_MODELS } from "@/lib/chatModels";
import {
  EXAM_TYPES,
  QUESTION_FORMATS,
  DIFFICULTIES,
  LANGUAGES,
  DURATIONS,
  type Exam,
} from "@/lib/exams";

const DEFAULT_FORMATS = ["Multiple Choice", "Short Answer", "Structured"];

export default function ExamsPage() {
  const [subjectSlugValue, setSubjectSlugValue] = useState(subjectSlug(SUBJECTS[0]));
  const subject = useMemo(
    () => SUBJECTS.find((s) => subjectSlug(s) === subjectSlugValue) ?? SUBJECTS[0],
    [subjectSlugValue],
  );
  const outline = SUBJECT_TOPICS[subjectSlugValue] ?? [];
  const formOptions = outline.length
    ? outline.map((f) => f.form)
    : subject.level === "A-Level"
      ? ["Form V", "Form VI"]
      : ["Form I", "Form II", "Form III", "Form IV"];

  const [form, setForm] = useState(formOptions[0]);
  const [examType, setExamType] = useState<string>("Monthly Test");
  const [duration, setDuration] = useState(90);
  const [totalMarks, setTotalMarks] = useState(50);
  const [difficulty, setDifficulty] = useState<string>("Balanced");
  const [language, setLanguage] = useState<string>("English");
  const [school, setSchool] = useState("");
  const [formats, setFormats] = useState<string[]>(DEFAULT_FORMATS);
  const [topics, setTopics] = useState<string[]>([]);
  const [model, setModel] = useState("claude-sonnet-4-6");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exam, setExam] = useState<Exam | null>(null);
  const [showScheme, setShowScheme] = useState(false);
  const [refine, setRefine] = useState("");

  const topicChoices = outline.find((f) => f.form === form)?.topics ?? [];

  function toggle(list: string[], v: string, set: (x: string[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  function onSubjectChange(slug: string) {
    setSubjectSlugValue(slug);
    const o = SUBJECT_TOPICS[slug] ?? [];
    const forms = o.length
      ? o.map((f) => f.form)
      : (SUBJECTS.find((s) => subjectSlug(s) === slug)?.level === "A-Level"
          ? ["Form V", "Form VI"]
          : ["Form I", "Form II", "Form III", "Form IV"]);
    setForm(forms[0]);
    setTopics([]);
  }

  async function generate(instruction?: string) {
    if (formats.length === 0) {
      setError("Pick at least one question format.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/exams/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.name,
          level: subject.level,
          form,
          examType,
          durationMinutes: duration,
          totalMarks,
          topics,
          formats,
          difficulty,
          language,
          school: school || undefined,
          model,
          instruction,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setExam(json.exam);
      setRefine("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    if (!exam) return;
    const res = await fetch("/api/exams/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam, includeScheme: true }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(exam.title || "exam").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Nav />
      <main>
        <section className="exam-hero">
          <div className="tag">Dolese AI · Exams Composer</div>
          <h1>
            Generate a full exam <strong>in seconds</strong>
          </h1>
          <p className="exam-hero-sub">
            NECTA-standard, competence-based papers with balanced Bloom&apos;s levels, marks and a
            marking scheme — aligned to the Tanzania TIE syllabus. Configure, generate, export to Word.
          </p>
        </section>

        <section className="exam-workspace">
          {/* ── Config panel ── */}
          <aside className="exam-config">
            <h2 className="exam-config-title">Paper setup</h2>

            <label className="exam-field">
              <span>Subject</span>
              <select value={subjectSlugValue} onChange={(e) => onSubjectChange(e.target.value)}>
                {SUBJECTS.map((s) => (
                  <option key={subjectSlug(s)} value={subjectSlug(s)}>{s.name} — {s.level}</option>
                ))}
              </select>
            </label>

            <div className="exam-row">
              <label className="exam-field">
                <span>Form</span>
                <select value={form} onChange={(e) => { setForm(e.target.value); setTopics([]); }}>
                  {formOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <label className="exam-field">
                <span>Exam type</span>
                <select value={examType} onChange={(e) => setExamType(e.target.value)}>
                  {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>

            <div className="exam-row">
              <label className="exam-field">
                <span>Duration (min)</span>
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="exam-field">
                <span>Total marks</span>
                <input type="number" min={5} max={200} value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} />
              </label>
            </div>

            <div className="exam-row">
              <label className="exam-field">
                <span>Difficulty</span>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="exam-field">
                <span>Language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            </div>

            <div className="exam-field">
              <span>Question formats</span>
              <div className="exam-chips">
                {QUESTION_FORMATS.map((f) => (
                  <button
                    type="button"
                    key={f}
                    className={`exam-chip ${formats.includes(f) ? "on" : ""}`}
                    onClick={() => toggle(formats, f, setFormats)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {topicChoices.length > 0 && (
              <div className="exam-field">
                <span>Topics <em>(optional — all if none picked)</em></span>
                <div className="exam-chips exam-chips-scroll">
                  {topicChoices.map((t) => (
                    <button
                      type="button"
                      key={t}
                      className={`exam-chip ${topics.includes(t) ? "on" : ""}`}
                      onClick={() => toggle(topics, t, setTopics)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="exam-row">
              <label className="exam-field">
                <span>School (optional)</span>
                <input type="text" value={school} placeholder="e.g. Bonde Secondary" onChange={(e) => setSchool(e.target.value)} />
              </label>
              <label className="exam-field">
                <span>AI model</span>
                <select value={model} onChange={(e) => setModel(e.target.value)}>
                  {CHAT_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </label>
            </div>

            {error && <div className="exam-error">{error}</div>}

            <button className="btn-filled exam-generate" onClick={() => generate()} disabled={loading}>
              {loading ? "Generating…" : exam ? "Regenerate" : "Generate exam"}
            </button>
          </aside>

          {/* ── Preview panel ── */}
          <div className="exam-preview">
            {!exam ? (
              <div className="exam-empty">
                <div className="exam-empty-icon">📝</div>
                <h3>Your paper will appear here</h3>
                <p>Set up the paper on the left and click <strong>Generate exam</strong>.</p>
              </div>
            ) : (
              <>
                <div className="exam-preview-bar">
                  <label className="exam-toggle">
                    <input type="checkbox" checked={showScheme} onChange={(e) => setShowScheme(e.target.checked)} />
                    Show marking scheme
                  </label>
                  <div className="exam-actions">
                    <button className="btn-outline" onClick={() => window.print()}>Print / PDF</button>
                    <button className="btn-filled" onClick={download}>Download .docx</button>
                  </div>
                </div>

                <article className="exam-paper">
                  <header className="exam-paper-head">
                    <h2>{exam.title}</h2>
                    <p>{[exam.subject, exam.level, exam.form].filter(Boolean).join(" · ")}</p>
                    <p className="exam-paper-meta">
                      {exam.examType} · {exam.durationMinutes} min · {exam.totalMarks} marks
                    </p>
                  </header>

                  {exam.instructions?.length > 0 && (
                    <div className="exam-instructions">
                      <strong>Instructions</strong>
                      <ul>{exam.instructions.map((i, k) => <li key={k}>{i}</li>)}</ul>
                    </div>
                  )}

                  {exam.sections.map((s, si) => (
                    <div className="exam-section" key={si}>
                      <h3>{s.name} {s.marks ? <span className="exam-section-marks">({s.marks} marks)</span> : null}</h3>
                      {s.instructions && <p className="exam-section-instr">{s.instructions}</p>}
                      {s.questions.map((q, qi) => (
                        <div className="exam-q" key={qi}>
                          <p className="exam-q-text">
                            <strong>{q.number}.</strong> {q.text}
                            <span className="exam-q-marks">[{q.marks}]</span>
                          </p>
                          {q.options && q.options.length > 0 && (
                            <ol className="exam-q-options">
                              {q.options.map((o, oi) => <li key={oi}>{o}</li>)}
                            </ol>
                          )}
                          {showScheme && (
                            <div className="exam-q-answer">
                              <span className="exam-q-answer-label">Answer · {q.bloom}</span>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </article>

                <div className="exam-refine">
                  <input
                    type="text"
                    placeholder='Refine — e.g. "increase difficulty", "add 2 essay questions", "translate to Kiswahili"'
                    value={refine}
                    onChange={(e) => setRefine(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && refine.trim()) generate(refine.trim()); }}
                    disabled={loading}
                  />
                  <button className="btn-outline" onClick={() => refine.trim() && generate(refine.trim())} disabled={loading || !refine.trim()}>
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
