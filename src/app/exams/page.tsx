import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ContinuePaper from "@/components/exams/ContinuePaper";
import { FREE_PAPERS_PER_MONTH } from "@/lib/catalog";
import { sellingEnabled } from "@/lib/entitlements";
import { topQuestions } from "@/lib/faq";
import { TESTIMONIALS } from "@/lib/testimonials";
import "./landing.css";

export const metadata: Metadata = {
  title: "Exams Composer — exam papers set like an examination panel | Dolese Tech",
  description:
    "Complete NECTA-format exam papers for Tanzanian secondary schools, with marking schemes. Planned to a table of specifications, answered blind, moderated and revised before you see them.",
  alternates: { canonical: "/exams" },
};

// Prices in the copy follow whether papers are sold yet; an hour is fresh enough.
export const revalidate = 3600;

const WRITE = "/exams/write";

const PAINS = [
  "Typing and formatting a paper late into the night, the week exams begin.",
  "Reusing last year's questions, when the students already have the answers.",
  "No one to answer your paper before the students do: a wrong key, two right options, marks that do not add up.",
];

const FIXES = [
  {
    n: "01",
    title: "Planned to the NECTA format",
    body: "A table of specifications first: sections, marks, topics, thinking levels and difficulty. Terminal, mock and final papers follow the official layout for the subject. You check it and change anything before a question is written.",
  },
  {
    n: "02",
    title: "Written to the plan",
    body: "Every question is written to its line in the plan, with its marks and a marking scheme, in English or Kiswahili.",
  },
  {
    n: "03",
    title: "Answered blind",
    body: "A second examiner sits the paper without the marking scheme. Where their answer and the key disagree, the question goes back.",
  },
  {
    n: "04",
    title: "Moderated and revised",
    body: "A chief examiner checks every question against nine points: syllabus, level, clarity, the key, the wrong options, marks, the scheme, context and repeats. Questions that fall short are rewritten and checked again.",
  },
  {
    n: "05",
    title: "Ready to print",
    body: "An editable Word document with the marking scheme, shuffled versions A to D, your watermark, and an examiner's report saying what was checked and changed.",
  },
];

const WHO = [
  { title: "Subject teachers", body: "Weekly tests, monthly tests and terminal papers without the late nights." },
  { title: "Heads of department", body: "One standard for every paper the department sets." },
  { title: "Academic masters and mistresses", body: "Mock and pre-national papers in the official format, on time." },
  { title: "Private school owners", body: "A full exam timetable's papers without hiring setters." },
  { title: "Tutors and tuition centres", body: "Fresh practice papers for every form and subject." },
  { title: "Kiswahili-medium teaching", body: "Papers and marking schemes written in Kiswahili." },
];

const START = [
  {
    title: "Choose the paper",
    body: "Subject, form, exam type, marks and time. Pick topics if you want them; otherwise the whole syllabus for the form is used.",
  },
  {
    title: "Check the plan",
    body: "The examiner's plan appears at once. Change any question's topic, thinking level, difficulty or marks, then approve it.",
  },
  {
    title: "Get your paper",
    body: "The panel writes and checks it in a few minutes. Close the page if you like: it waits under My papers, and we can email you when it is ready.",
  },
];

/** A picture of what comes back with every paper; the numbers are an example. */
function ReportPreview() {
  const steps = [
    ["Written to the plan", "14 questions"],
    ["Answered blind", "10 of 10 objective answers agree"],
    ["Moderated", "3 questions sent back"],
    ["Revised", "3 questions improved"],
    ["Final checks", "Totals, numbering and key correct"],
  ];
  return (
    <figure className="xl-report" aria-label="Example of an examiner's report">
      <div className="xl-report-head">
        <span className="xl-report-kicker">Examiner&apos;s report</span>
        <strong>Form II Biology · Terminal Exam</strong>
        <span className="xl-report-meta">60 marks · 2 hours</span>
      </div>
      <ol>
        {steps.map(([title, detail]) => (
          <li key={title}>
            <span className="xl-report-tick" aria-hidden="true">✓</span>
            <span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
          </li>
        ))}
      </ol>
      <figcaption>Example. Every paper comes with its own report.</figcaption>
    </figure>
  );
}

export default function ExamsPage() {
  const selling = sellingEnabled();
  const questions = topQuestions(selling);
  const freeLine = selling
    ? `${FREE_PAPERS_PER_MONTH} papers free every month with a free account.`
    : "Free while in pilot. No account needed.";

  return (
    <>
      <Nav />
      <main className="xl">
        {/* 1. The promise */}
        <section className="xl-hero">
          <div className="xl-hero-copy">
            <div className="tag">Dolese AI · Exams Composer</div>
            <h1>
              Exam papers set the way <strong>examiners</strong> set them
            </h1>
            <p className="xl-hero-sub">
              Planned to the NECTA format, written to the plan, answered blind, moderated and revised: a complete
              paper with its marking scheme, while you get on with teaching.
            </p>
            <div className="hero-actions">
              <a href={WRITE} className="btn-filled">Plan a paper</a>
              <a href="#how" className="btn-outline">See how it works</a>
            </div>
            <p className="xl-hero-note">{freeLine} O-Level and A-Level, 22 subjects, English or Kiswahili.</p>
            <ContinuePaper />
          </div>
          <ReportPreview />
        </section>

        {/* 2. The problem */}
        <section className="xl-section xl-pain">
          <h2>Tired of setting papers at midnight?</h2>
          <p className="xl-lead">It is not that you cannot set a good paper. It is that you are setting it alone.</p>
          <ul className="xl-pain-list">
            {PAINS.map((p) => (
              <li key={p} className="reveal">{p}</li>
            ))}
          </ul>
        </section>

        {/* 3. The bigger picture */}
        <section className="xl-section xl-story">
          <h2>When one teacher is the whole exam board</h2>
          <p>
            A national examination is planned against a table of specifications, written by one examiner, answered
            by another and moderated by a third before a candidate sees it. A school paper is usually set, answered
            and checked by the same tired teacher. Students feel the difference: questions off the syllabus, a key
            that is wrong, a paper too long for the time.
          </p>
        </section>

        {/* 4. The fix */}
        <section className="xl-section" id="how">
          <h2>The Exams Composer gives you the panel</h2>
          <p className="xl-lead">Five steps, every paper, the way an examination panel works.</p>
          <ol className="xl-fixes">
            {FIXES.map((f) => (
              <li key={f.n} className="xl-fix reveal">
                <span className="xl-fix-n">{f.n}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 5. Who it's for */}
        <section className="xl-section xl-who">
          <h2>Who it&apos;s for</h2>
          <p className="xl-lead">Anyone who sets papers for Tanzanian secondary school students.</p>
          <div className="xl-who-grid">
            {WHO.map((w) => (
              <div key={w.title} className="xl-who-card reveal">
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Why it matters */}
        <section className="xl-section xl-why">
          <h2>Why it matters</h2>
          <p>
            A paper is how a student finds out what they know, and how a school finds out what it has taught. A
            careless paper wastes both. A paper that has been planned, answered and moderated tells everyone the
            truth, and gives you back the evening you would have spent typing it.
          </p>
        </section>

        {/* 7. How to start */}
        <section className="xl-section">
          <h2>Your first paper in three steps</h2>
          <ol className="xl-start">
            {START.map((s, i) => (
              <li key={s.title} className="reveal">
                <span className="xl-start-n">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 8. Teachers' words — only once there are real ones */}
        {TESTIMONIALS.length > 0 && (
          <section className="xl-section">
            <h2>What teachers say</h2>
            <div className="xl-quotes">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="xl-quote reveal">
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* 9. Questions */}
        <section className="xl-section xl-faq">
          <h2>Questions</h2>
          <div className="faq-list">
            {questions.map((f) => (
              <details key={f.id} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <a href="/faq" className="xl-more">All questions →</a>
        </section>

        {/* 10. The call */}
        <section className="svc-cta">
          <h2>Your next paper, planned in a minute</h2>
          <p>{freeLine}</p>
          <div className="hero-actions">
            <a href={WRITE} className="btn-filled">Plan a paper</a>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
