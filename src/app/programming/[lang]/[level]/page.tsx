import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CodeBlock from "@/components/programming/CodeBlock";
import RichText from "@/components/programming/RichText";
import { LANGUAGES, LEVELS, LEVEL_LABELS, getLanguage, getLevel, isAvailable } from "@/lib/programming";

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

        <div className="prog-layout">
          <aside className="prog-toc" aria-label="Lessons in this level">
            <p className="prog-toc-title">Lessons</p>
            <ol>
              {track.lessons.map((l) => (
                <li key={l.slug}>
                  <a href={`#${l.slug}`}>{l.title}</a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="prog-lessons">
            {track.lessons.map((lesson, i) => (
              <article className="prog-lesson" id={lesson.slug} key={lesson.slug}>
                <p className="prog-lesson-num">Lesson {i + 1}</p>
                <h2>{lesson.title}</h2>
                <p className="prog-lesson-summary">{lesson.summary}</p>

                {lesson.body.map((para, j) => (
                  <p className="prog-para" key={j}>
                    <RichText text={para} />
                  </p>
                ))}

                {lesson.code.map((sample, j) => (
                  <CodeBlock sample={sample} key={j} />
                ))}

                <div className="prog-keypoints">
                  <h3>Key points</h3>
                  <ul>
                    {lesson.keyPoints.map((k) => (
                      <li key={k}>
                        <RichText text={k} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="prog-exercise">
                  <h3>Exercise</h3>
                  <p>
                    <RichText text={lesson.exercise} />
                  </p>
                </div>
              </article>
            ))}

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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
