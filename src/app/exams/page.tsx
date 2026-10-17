"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTzs, getProduct } from "@/lib/catalog";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MathText from "@/components/MathText";
import ExamFigure from "@/components/exams/Figure";
import PlanEditor from "@/components/exams/PlanEditor";
import AgentProgress from "@/components/exams/AgentProgress";
import QualityReport from "@/components/exams/QualityReport";
import type { ExamPlan } from "@/lib/examAgent/plan";
import type { AgentReport } from "@/lib/examAgent/assemble";
import type { StepProgress } from "@/lib/examAgent/run";
import type { JobView } from "@/lib/examAgent/jobs";
import { addJob, listJobs, removeJob, type PendingJob } from "@/lib/examJobs";
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
import { analyzeExam, moderateExam, type Dist } from "@/lib/examAnalytics";
import {
  listPapers,
  savePaper,
  getPaper,
  deletePaper,
  readDraft,
  writeDraft,
  clearDraft,
  type SavedPaper,
} from "@/lib/examLibrary";

const DEFAULT_FORMATS = ["Multiple Choice", "Short Answer", "Structured"];

function Bars({ list }: { list: Dist[] }) {
  const max = Math.max(1, ...list.map((d) => d.marks));
  return (
    <div className="ea-bars">
      {list.map((d) => (
        <div className="ea-bar-row" key={d.label}>
          <span className="ea-bar-label">{d.label}</span>
          <div className="ea-bar"><div className="ea-bar-fill" style={{ width: `${(d.marks / max) * 100}%` }} /></div>
          <span className="ea-bar-val">{d.marks}</span>
        </div>
      ))}
    </div>
  );
}

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
  const [issues, setIssues] = useState<{ level: string; message: string }[]>([]);
  const [showScheme, setShowScheme] = useState(false);
  const [refine, setRefine] = useState("");
  // ── The examining panel ──────────────────────────────────────
  const [plan, setPlan] = useState<ExamPlan | null>(null);
  const [planning, setPlanning] = useState(false);
  const [view, setView] = useState<"paper" | "plan" | "running">("paper");
  const [agentSteps, setAgentSteps] = useState<StepProgress[]>([]);
  const [report, setReport] = useState<AgentReport | null>(null);
  const [planKey, setPlanKey] = useState("");
  // ── Papers being written in the background ───────────────────
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingJob[]>([]);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notice, setNotice] = useState("");
  const viewRef = useRef(view);
  viewRef.current = view;
  // What the plan depends on; if any of it changes, the plan is out of date.
  const settingsKey = JSON.stringify([subjectSlugValue, form, examType, duration, totalMarks, topics, formats, difficulty, language]);
  const [watermark, setWatermark] = useState("");

  // ── Library / draft ──────────────────────────────────────────
  const [hydrated, setHydrated] = useState(false);
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [libOpen, setLibOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [restored, setRestored] = useState(false);

  // ── Account: who may write papers, and how many are left ─────
  const [selling, setSelling] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [allowance, setAllowance] = useState<{ freeLeft: number; freePerMonth: number; credits: number } | null>(null);
  const [paywall, setPaywall] = useState<"sign-in" | "buy" | null>(null);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((data) => {
        setSelling(Boolean(data.selling));
        setSignedIn(Boolean(data.teacher));
        if (data.selling && data.teacher) {
          return fetch("/api/account/summary")
            .then((r) => (r.ok ? r.json() : null))
            .then((summary) => summary && setAllowance(summary.papers));
        }
      })
      .catch(() => {});
  }, []);

  // ── Per-question regeneration ────────────────────────────────
  const [regenAt, setRegenAt] = useState<{ si: number; qi: number } | null>(null);
  const [regenText, setRegenText] = useState("");
  const [regenBusy, setRegenBusy] = useState<string | null>(null);

  /** A finished paper joins the library at once, so it is never only on the server. */
  const receive = useCallback((job: JobView, show: boolean) => {
    removeJob(job.id);
    setPending(listJobs());
    if (!job.result) return;
    const paper = savePaper(job.result.exam);
    setPapers(listPapers());
    if (!show) {
      setNotice(`“${job.title}” is ready. Open it from My papers.`);
      return;
    }
    setExam(job.result.exam);
    setIssues(job.result.issues);
    setReport(job.result.report);
    setSavedId(paper?.id ?? null);
    setRefine("");
    setRestored(false);
    setRegenAt(null);
    setView("paper");
  }, []);

  // Restore the last working paper so a refresh never loses work, and pick
  // up any paper the panel was writing — from this device, or an email link.
  useEffect(() => {
    setPapers(listPapers());
    const draft = readDraft();
    if (draft) {
      setExam(draft.exam);
      setSavedId(draft.savedId ?? null);
      setRestored(true);
    }
    setHydrated(true);

    const linked = new URLSearchParams(window.location.search).get("job");
    if (linked) {
      addJob({ id: linked, title: "Exam paper", createdAt: new Date().toISOString() });
      window.history.replaceState(null, "", window.location.pathname);
    }
    const jobs = listJobs();
    setPending(jobs);
    const resume = linked ?? jobs[0]?.id;
    if (resume) {
      setActiveJob(resume);
      setView("running");
    }
  }, []);

  // Follow the paper being written. The server does the work; this only asks
  // how it is going — closing the page stops nothing.
  useEffect(() => {
    if (!activeJob) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const res = await fetch(`/api/exams/jobs/${activeJob}`, { cache: "no-store" });
        const json = await res.json();
        if (stopped) return;
        if (res.status === 404) {
          removeJob(activeJob);
          setPending(listJobs());
          setActiveJob(null);
          setError(json.error ?? "That paper could not be found.");
          setView("paper");
          return;
        }
        if (res.ok) {
          const job = json as JobView;
          setAgentSteps(job.steps);
          // A paper opened from an email link learns its real title here.
          if (listJobs().some((j) => j.id === job.id && j.title !== job.title)) {
            addJob({ id: job.id, title: job.title, createdAt: job.createdAt });
            setPending(listJobs());
          }
          if (job.status === "done") {
            receive(job, viewRef.current === "running");
            setActiveJob(null);
            return;
          }
          if (job.status === "failed") {
            removeJob(job.id);
            setPending(listJobs());
            setActiveJob(null);
            setError(job.error ?? "The paper could not be written.");
            if (viewRef.current === "running") {
              setPlan(job.plan);
              setView("plan");
            }
            return;
          }
        }
      } catch {
        /* offline for a moment: keep asking */
      }
      if (!stopped) timer = setTimeout(tick, document.hidden ? 15000 : 3000);
    };
    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [activeJob, receive]);

  // Other papers this device started: any that finished while away go into the library.
  useEffect(() => {
    if (!hydrated) return;
    for (const job of pending) {
      if (job.id === activeJob) continue;
      fetch(`/api/exams/jobs/${job.id}`, { cache: "no-store" })
        .then(async (res) => {
          if (res.status === 404) {
            removeJob(job.id);
            setPending(listJobs());
            return;
          }
          const view = (await res.json()) as JobView;
          if (view.status === "done") receive(view, false);
          else if (view.status === "failed") {
            removeJob(job.id);
            setPending(listJobs());
          }
        })
        .catch(() => {});
    }
    // Checked on arrival and when the library is opened, not on every change.
  }, [hydrated, libOpen]);

  // Keep the draft in step with whatever is on screen.
  useEffect(() => {
    if (!hydrated) return;
    if (exam) writeDraft(exam, savedId ?? undefined);
    else clearDraft();
  }, [exam, savedId, hydrated]);

  function saveToLibrary() {
    if (!exam) return;
    const paper = savePaper(exam, savedId ?? undefined);
    if (!paper) {
      setSaveMsg("Storage full");
      setTimeout(() => setSaveMsg(""), 2500);
      return;
    }
    setSavedId(paper.id);
    setPapers(listPapers());
    setSaveMsg("Saved ✓");
    setTimeout(() => setSaveMsg(""), 1800);
  }

  function openPaper(id: string) {
    const paper = getPaper(id);
    if (!paper) return;
    setExam(paper.exam);
    setSavedId(paper.id);
    setIssues([]);
    setReport(null);
    setView("paper");
    setError("");
    setRegenAt(null);
    setLibOpen(false);
    setRestored(false);
  }

  function removePaper(id: string) {
    deletePaper(id);
    setPapers(listPapers());
    if (savedId === id) setSavedId(null);
  }

  /**
   * Replace a single question in place. The API pins the replacement's number
   * and marks to the original, so the rest of the paper — and its totals —
   * survive untouched.
   */
  async function regenerateQuestion(si: number, qi: number, instruction?: string) {
    if (!exam) return;
    const section = exam.sections[si];
    const question = section?.questions[qi];
    if (!question) return;

    setRegenBusy(`${si}:${qi}`);
    setError("");
    try {
      const avoid = exam.sections.flatMap((s, i) =>
        s.questions.filter((_, j) => !(i === si && j === qi)).map((q) => q.text),
      );
      const res = await fetch("/api/exams/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: exam.subject || subject.name,
          level: exam.level || subject.level,
          form: exam.form || form,
          language: exam.language === "Kiswahili" ? "Kiswahili" : "English",
          difficulty,
          sectionName: section.name,
          sectionInstructions: section.instructions ?? "",
          question,
          avoid,
          instruction,
          model,
        }),
      });
      const json = await res.json();
      if (res.status === 401) setPaywall("sign-in");
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

      setExam({
        ...exam,
        sections: exam.sections.map((s, i) =>
          i !== si ? s : { ...s, questions: s.questions.map((q, j) => (j === qi ? json.question : q)) },
        ),
      });
      setRegenAt(null);
      setRegenText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not regenerate that question.");
    } finally {
      setRegenBusy(null);
    }
  }

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

  function paperSettings() {
    return {
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
    };
  }

  /** Step 1: the examiner's plan, for the teacher to check and adjust. */
  async function requestPlan(): Promise<ExamPlan | null> {
    if (formats.length === 0) {
      setError("Pick at least one question format.");
      return null;
    }
    setPlanning(true);
    setError("");
    try {
      const res = await fetch("/api/exams/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paperSettings()),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      return json.plan as ExamPlan;
    } catch (e) {
      setError(e instanceof Error ? e.message : "The plan could not be made.");
      return null;
    } finally {
      setPlanning(false);
    }
  }

  async function makePlan() {
    const next = await requestPlan();
    if (next) {
      setPlan(next);
      setPlanKey(settingsKey);
      setView("plan");
    }
  }

  /** Step 2: the panel writes, answers blind, moderates and revises the paper. */
  async function writePaper(instruction?: string) {
    // Planning is free for anyone; writing a paper takes one from the allowance.
    if (selling && !signedIn) {
      setPaywall("sign-in");
      return;
    }
    const approved = plan ?? (await requestPlan());
    if (!approved) return;
    setPlan(approved);
    setLoading(true);
    setError("");
    setNotice("");
    setPaywall(null);
    try {
      const res = await fetch("/api/exams/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: approved, model, school: school || undefined, instruction, email: notifyEmail.trim() || undefined }),
      });
      const json = await res.json();
      if (res.status === 401 && json.code === "SIGN_IN") setPaywall("sign-in");
      if (res.status === 402) setPaywall("buy");
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      if (json.allowance) setAllowance(json.allowance);
      addJob({
        id: json.id,
        title: [school, `${approved.form} ${approved.subject} ${approved.examType}`].filter(Boolean).join(" — "),
        createdAt: new Date().toISOString(),
      });
      setPending(listJobs());
      setAgentSteps([]);
      setView("running");
      setActiveJob(json.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The paper could not be started.");
    } finally {
      setLoading(false);
    }
  }

  function openJob(id: string) {
    setAgentSteps([]);
    setError("");
    setView("running");
    setActiveJob(id);
    setLibOpen(false);
  }

  async function download(version?: string) {
    if (!exam) return;
    const res = await fetch("/api/exams/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam, includeScheme: true, version, watermark: watermark || undefined }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const suffix = version && version !== "A" ? `-version-${version.toLowerCase()}` : "";
    a.download = `${(exam.title || "exam").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}${suffix}.docx`;
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
            <div className="exam-library">
              <button
                type="button"
                className="exam-library-toggle"
                onClick={() => setLibOpen((v) => !v)}
                aria-expanded={libOpen}
              >
                <span>📚 My papers</span>
                <span className="exam-library-count">{papers.length + pending.length}</span>
              </button>

              {libOpen && pending.length > 0 && (
                <ul className="exam-library-list exam-library-pending">
                  {pending.map((j) => (
                    <li key={j.id} className={j.id === activeJob ? "on" : ""}>
                      <button type="button" className="exam-library-open" onClick={() => openJob(j.id)}>
                        <span className="exam-library-name">{j.title}</span>
                        <span className="exam-library-meta">Being written by the panel · see progress</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {libOpen && (
                papers.length === 0 ? (
                  <p className="exam-library-empty">
                    No saved papers yet. Generate a paper, then click <strong>Save</strong> to keep it here.
                  </p>
                ) : (
                  <>
                    <ul className="exam-library-list">
                      {papers.map((p) => (
                        <li key={p.id} className={p.id === savedId ? "on" : ""}>
                          <button type="button" className="exam-library-open" onClick={() => openPaper(p.id)}>
                            <span className="exam-library-name">{p.title}</span>
                            <span className="exam-library-meta">
                              {[p.subject, p.form, p.examType].filter(Boolean).join(" · ")} — {p.totalMarks} marks
                            </span>
                          </button>
                          <button
                            type="button"
                            className="exam-library-del"
                            onClick={() => removePaper(p.id)}
                            title={`Delete “${p.title}”`}
                            aria-label={`Delete ${p.title}`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="exam-library-note">Saved on this device only.</p>
                  </>
                )
              )}
            </div>

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

            {selling && (
              <div className="exam-allowance">
                {!signedIn ? (
                  <p>
                    <a href="/account/sign-in?next=/exams">Sign in</a> to write papers. It&apos;s free, with 2 papers
                    every month.
                  </p>
                ) : allowance ? (
                  <p>
                    <strong>{allowance.freeLeft}</strong> of {allowance.freePerMonth} free papers left this month
                    {allowance.credits > 0 && (
                      <>
                        {" · "}
                        <strong>{allowance.credits}</strong> bought
                      </>
                    )}
                    {" · "}
                    <a href="/checkout?product=papers-10">Buy more</a>
                  </p>
                ) : null}
              </div>
            )}

            {paywall === "sign-in" && !error && <div className="exam-error">Sign in to write papers.</div>}
            {error && <div className="exam-error">{error}</div>}
            {paywall && (
              <a
                className="btn-outline exam-paywall-link"
                href={paywall === "buy" ? "/checkout?product=papers-10" : "/account/sign-in?next=/exams"}
              >
                {paywall === "buy" ? `Buy 10 papers for ${formatTzs(getProduct("papers-10")?.price ?? 0)}` : "Sign in, it's free"}
              </a>
            )}

            <button className="btn-filled exam-generate" onClick={makePlan} disabled={loading || planning}>
              {planning ? "Planning…" : loading ? "Starting the panel…" : exam ? "Plan a new paper" : "Plan the paper"}
            </button>
          </aside>

          {/* ── Preview panel ── */}
          <div className="exam-preview">
            {notice && (
              <div className="exam-restored">
                {notice}
                <button type="button" onClick={() => setNotice("")} aria-label="Dismiss">×</button>
              </div>
            )}
            {view === "running" ? (
              <>
                <AgentProgress steps={agentSteps} emailed={Boolean(notifyEmail.trim())} />
                {exam && (
                  <button type="button" className="account-link plan-back" onClick={() => setView("paper")}>
                    ← Back to the current paper
                  </button>
                )}
              </>
            ) : view === "plan" && plan ? (
              <>
                {planKey !== settingsKey && (
                  <div className="plan-stale">
                    Your settings have changed since this plan was made.
                    <button type="button" className="btn-outline" onClick={makePlan} disabled={planning}>
                      Plan again
                    </button>
                  </div>
                )}
                {(paywall || error) && (
                  <div className="plan-stale">
                    {error || "Sign in to write papers. It's free, with 2 papers every month."}
                    {paywall && (
                      <a
                        className="btn-outline"
                        href={paywall === "buy" ? "/checkout?product=papers-10" : "/account/sign-in?next=/exams"}
                      >
                        {paywall === "buy" ? "Buy more papers" : "Sign in"}
                      </a>
                    )}
                  </div>
                )}
                <PlanEditor
                  plan={plan}
                  onChange={setPlan}
                  onApprove={() => writePaper()}
                  busy={loading}
                  email={notifyEmail}
                  onEmailChange={setNotifyEmail}
                />
                {exam && (
                  <button type="button" className="account-link plan-back" onClick={() => setView("paper")}>
                    ← Back to the current paper
                  </button>
                )}
              </>
            ) : !exam ? (
              <div className="exam-empty">
                <div className="exam-empty-icon">📝</div>
                <h3>Your paper will appear here</h3>
                <p>
                  Set up the paper on the left and click <strong>Plan the paper</strong>. You&apos;ll check the
                  examiner&apos;s plan, then a panel writes, answers, moderates and revises every question.
                </p>
              </div>
            ) : (
              <>
                {restored && (
                  <div className="exam-restored">
                    Restored the paper you were working on.
                    <button type="button" onClick={() => setRestored(false)} aria-label="Dismiss">×</button>
                  </div>
                )}

                <div className="exam-preview-bar">
                  <label className="exam-toggle">
                    <input type="checkbox" checked={showScheme} onChange={(e) => setShowScheme(e.target.checked)} />
                    Show marking scheme
                  </label>
                  <div className="exam-actions">
                    <button className="btn-outline" onClick={saveToLibrary}>
                      {saveMsg || (savedId ? "Update saved" : "Save")}
                    </button>
                    <button className="btn-outline" onClick={() => window.print()}>Print / PDF</button>
                    <button className="btn-filled" onClick={() => download()}>Download .docx</button>
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
                            <strong>{q.number}.</strong> <MathText>{q.text}</MathText>
                            <span className="exam-q-marks">[{q.marks}]</span>
                          </p>
                          {q.figure && <ExamFigure figure={q.figure} />}
                          {q.options && q.options.length > 0 && (
                            <ol className="exam-q-options">
                              {q.options.map((o, oi) => <li key={oi}><MathText>{o}</MathText></li>)}
                            </ol>
                          )}
                          {showScheme && (
                            <div className="exam-q-answer">
                              <span className="exam-q-answer-label">Answer · {q.bloom}</span>
                              <MathText>{q.answer}</MathText>
                            </div>
                          )}

                          <div className="exam-q-tools">
                            <button
                              type="button"
                              className="exam-q-regen"
                              disabled={regenBusy !== null}
                              onClick={() => {
                                const open = regenAt?.si === si && regenAt?.qi === qi;
                                setRegenAt(open ? null : { si, qi });
                                setRegenText("");
                              }}
                            >
                              {regenBusy === `${si}:${qi}` ? "Regenerating…" : "↻ Regenerate this question"}
                            </button>
                          </div>

                          {regenAt?.si === si && regenAt?.qi === qi && (
                            <div className="exam-q-regen-panel">
                              <input
                                type="text"
                                value={regenText}
                                autoFocus
                                placeholder='Optional — how should it change? e.g. "use larger numbers", "test Sets instead"'
                                onChange={(e) => setRegenText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") regenerateQuestion(si, qi, regenText.trim() || undefined);
                                  if (e.key === "Escape") setRegenAt(null);
                                }}
                                disabled={regenBusy !== null}
                              />
                              <button
                                className="btn-filled"
                                disabled={regenBusy !== null}
                                onClick={() => regenerateQuestion(si, qi, regenText.trim() || undefined)}
                              >
                                Replace
                              </button>
                              <button className="btn-outline" disabled={regenBusy !== null} onClick={() => setRegenAt(null)}>
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </article>

                {report && <QualityReport report={report} />}

                {issues.length > 0 && (
                  <div className="exam-quality">
                    <strong>Quality check</strong>
                    <ul>
                      {issues.map((it, i) => (
                        <li key={i} className={it.level}>
                          <span className="ea-mod-icon">{it.level === "fixed" ? "✎" : "!"}</span>
                          {it.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(() => {
                  const a = analyzeExam(exam);
                  const mod = moderateExam(exam);
                  return (
                    <details className="exam-analytics" open>
                      <summary>Analytics &amp; moderation</summary>
                      <div className="ea-stats">
                        <span><strong>{a.questionCount}</strong> questions</span>
                        <span><strong>{a.computedMarks}</strong> marks</span>
                        <span>~<strong>{a.estimatedMinutes}</strong> min est.</span>
                        <span><strong>{a.hotsPercent}%</strong> higher-order</span>
                      </div>
                      <div className="ea-grid">
                        <div className="ea-block"><h4>Bloom&apos;s taxonomy</h4><Bars list={a.bloom} /></div>
                        <div className="ea-block"><h4>Question types</h4><Bars list={a.types} /></div>
                        <div className="ea-block"><h4>Difficulty</h4><Bars list={a.difficulty} /></div>
                      </div>
                      <div className="ea-moderation">
                        <h4>Moderation</h4>
                        <ul>
                          {mod.map((m, i) => (
                            <li key={i} className={m.level}>
                              <span className="ea-mod-icon">{m.level === "ok" ? "✓" : "!"}</span>
                              {m.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  );
                })()}

                <div className="exam-versions">
                  <div className="exam-versions-head">
                    <strong>Exam security</strong>
                    <span>Shuffled versions + watermark for anti-cheating</span>
                  </div>
                  <div className="exam-versions-row">
                    <input
                      type="text"
                      className="exam-watermark"
                      placeholder="Watermark / footer text (optional) — e.g. school name, term"
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value)}
                    />
                    <div className="exam-version-btns">
                      {["A", "B", "C", "D"].map((v) => (
                        <button key={v} className="exam-version-btn" onClick={() => download(v)} title={`Download Version ${v}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="exam-refine">
                  <input
                    type="text"
                    placeholder='Rewrite to the same plan — e.g. "use farming examples", "simpler English". To change the structure, plan a new paper.'
                    value={refine}
                    onChange={(e) => setRefine(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && refine.trim()) writePaper(refine.trim()); }}
                    disabled={loading}
                  />
                  <button className="btn-outline" onClick={() => refine.trim() && writePaper(refine.trim())} disabled={loading || !refine.trim()}>
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
