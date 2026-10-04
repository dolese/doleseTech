import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import {
  LANGUAGES,
  LEVELS,
  LEVEL_LABELS,
  getLanguage,
  getLevel,
  isAvailable,
  lessonHref,
} from "@/lib/programming";

interface Params {
  params: { lang: string; level: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGUAGES.filter(isAvailable).flatMap((l) => LEVELS.map((level) => ({ lang: l.slug, level })));
}

export function generateMetadata({ params }: Params): Metadata {
  const lang = getLanguage(params.lang);
  const track = getLevel(params.lang, params.level);
  if (!lang || !track) return { title: "Lessons not found — Dolese Tech" };
  const label = LEVEL_LABELS[params.level as keyof typeof LEVEL_LABELS];
  return {
    title: `${lang.name} ${label} Lessons (${lang.runtime}) | Dolese Tech`,
    description: track.intro,
  };
}

export default function LevelPage({ params }: Params) {
  const lang = getLanguage(params.lang);
  const track = getLevel(params.lang, params.level);
  if (!lang || !track) notFound();

  const levelIndex = LEVELS.indexOf(params.level as (typeof LEVELS)[number]);
  const level = LEVELS[levelIndex];
  const prev = LEVELS[levelIndex - 1];
  const next = LEVELS[levelIndex + 1];

  return (
    <>
      <Nav />
      <main>
        <section className="subj-detail-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/programming">Programming</a>
            <span>/</span>
            <a href={`/programming/${lang.slug}`}>{lang.name}</a>
            <span>/</span>
            <span aria-current="page">{LEVEL_LABELS[level]}</span>
          </nav>

          <div className="subj-detail-head">
            <span className="subj-code subj-code-lg" style={{ background: lang.color }}>
              {lang.code}
            </span>
            <div>
              <h1>
                {lang.name} — {LEVEL_LABELS[level]}
              </h1>
              <p className="subj-detail-meta">
                <span className={`prog-level-badge is-${level}`}>{LEVEL_LABELS[level]}</span>
                {lang.runtime} · {track.lessons.length} lessons
              </p>
            </div>
          </div>
          <p className="prog-lang-desc">{track.intro}</p>
        </section>

        <section className="detail-section">
          <h2 className="detail-h2">Lessons</h2>
          <ol className="prog-lesson-cards">
            {track.lessons.map((lesson, i) => (
              <li key={lesson.slug} id={lesson.slug} className="reveal">
                <a className="prog-lesson-card" href={lessonHref(lang.slug, level, lesson.slug)}>
                  <span className="prog-lesson-card-num">{i + 1}</span>
                  <span className="prog-lesson-card-body">
                    <span className="prog-lesson-card-title">{lesson.title}</span>
                    <span className="prog-lesson-card-summary">{lesson.summary}</span>
                    {lesson.practice && (
                      <span className="prog-lesson-card-tags">
                        <span>Solution</span>
                        <span>{lesson.practice.quiz.length}-question quiz</span>
                      </span>
                    )}
                  </span>
                  <span className="prog-lesson-card-go" aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ol>

          <a href={lessonHref(lang.slug, level, track.lessons[0].slug)} className="btn-outline prog-level-cta">
            Start with lesson 1 →
          </a>
        </section>

        <section className="detail-back">
          <nav className="prog-level-nav" aria-label="Other levels">
            {prev ? (
              <a href={`/programming/${lang.slug}/${prev}`} className="btn-outline">
                ← {LEVEL_LABELS[prev]}
              </a>
            ) : (
              <a href={`/programming/${lang.slug}`} className="btn-outline">← {lang.name} overview</a>
            )}
            {next ? (
              <a href={`/programming/${lang.slug}/${next}`} className="btn-outline">
                Next: {LEVEL_LABELS[next]} →
              </a>
            ) : (
              <a href="/programming" className="btn-outline">All languages →</a>
            )}
          </nav>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
