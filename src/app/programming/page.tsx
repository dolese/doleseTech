import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { LANGUAGES, LEVELS, LEVEL_LABELS, isAvailable } from "@/lib/programming";

export const metadata: Metadata = {
  title: "Programming — Dolese Tech | Learn Programming Languages",
  description:
    "Learn programming languages step by step — beginner, intermediate and advanced tracks with explanations, runnable code and exercises, starting with TypeScript on Node.js.",
};

const LEVEL_BLURBS = {
  beginner: "No experience needed. Set up your tools and learn the fundamentals every program is built from.",
  intermediate: "Model real data, write async code, handle errors, build an HTTP API and test it.",
  advanced: "Master the type system, performance, architecture and shipping services to production.",
};

export default function ProgrammingPage() {
  const available = LANGUAGES.filter(isAvailable);
  const lessons = available.reduce(
    (sum, lang) => sum + LEVELS.reduce((n, lvl) => n + lang.levels[lvl].lessons.length, 0),
    0,
  );

  return (
    <>
      <Nav />
      <main>
        <section className="edu-hero">
          <div className="tag">Programming · Learn to code</div>
          <h1>
            Learn programming languages <strong>step by step</strong>
          </h1>
          <p className="edu-hero-sub">
            Structured tracks from beginner to advanced — clear explanations, runnable code you can
            copy, key points and a hands-on exercise in every lesson.
          </p>
          <div className="edu-hero-stats">
            <div><strong>{available.length}</strong><span>Live tracks</span></div>
            <div className="hsb-divider" />
            <div><strong>{LEVELS.length}</strong><span>Levels per language</span></div>
            <div className="hsb-divider" />
            <div><strong>{lessons}</strong><span>Lessons</span></div>
          </div>
        </section>

        <section className="edu-types">
          <div className="edu-types-grid">
            {LEVELS.map((lvl) => (
              <div className="edu-type-card reveal" key={lvl}>
                <span className={`prog-level-badge is-${lvl}`}>{LEVEL_LABELS[lvl]}</span>
                <p>{LEVEL_BLURBS[lvl]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="edu-library">
          <div className="edu-section-head">
            <div className="tag">Languages</div>
            <h2 className="section-title">
              Choose a <strong>language</strong>
            </h2>
            <p className="section-sub">
              Start with TypeScript on Node.js. More languages are being written and will appear here.
            </p>
          </div>

          <div className="subject-grid">
            {LANGUAGES.map((lang) => {
              const live = isAvailable(lang);
              const Card = live ? "a" : "div";
              return (
                <Card
                  key={lang.slug}
                  className={`subject-card prog-lang-card reveal${live ? "" : " is-soon"}`}
                  {...(live ? { href: `/programming/${lang.slug}` } : {})}
                >
                  <div className="subject-card-top">
                    <span className="subj-code" style={{ background: lang.color }}>{lang.code}</span>
                    {live ? (
                      <span className="subj-level">Available</span>
                    ) : (
                      <span className="prog-soon">Coming soon</span>
                    )}
                  </div>
                  <h3 className="subj-name">{lang.name}</h3>
                  <p className="subj-meta">{lang.runtime}</p>
                  <p className="prog-lang-tagline">{lang.tagline}</p>
                  {live && (
                    <ul className="subj-materials">
                      {LEVELS.map((lvl) => (
                        <li key={lvl}>
                          <span className="subj-dot" />
                          {LEVEL_LABELS[lvl]} · {lang.levels[lvl].lessons.length} lessons
                        </li>
                      ))}
                    </ul>
                  )}
                  {live && <span className="subj-link">Start learning →</span>}
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
