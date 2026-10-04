import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CodeBlock from "@/components/programming/CodeBlock";
import Quiz from "@/components/programming/Quiz";
import RichText from "@/components/programming/RichText";
import {
  LANGUAGES,
  LEVEL_LABELS,
  getLessonContext,
  isAvailable,
  lessonHref,
  lessonsInOrder,
} from "@/lib/programming";
import { runSpecsFor } from "@/lib/programming/run";

interface Params {
  params: { lang: string; level: string; lesson: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGUAGES.filter(isAvailable).flatMap((lang) =>
    lessonsInOrder(lang).map(({ level, lesson }) => ({ lang: lang.slug, level, lesson: lesson.slug })),
  );
}

export function generateMetadata({ params }: Params): Metadata {
  const ctx = getLessonContext(params.lang, params.level, params.lesson);
  if (!ctx) return { title: "Lesson not found — Dolese Tech" };
  return {
    title: `${ctx.lesson.title} — ${ctx.lang.name} ${LEVEL_LABELS[ctx.level]} | Dolese Tech`,
    description: ctx.lesson.summary,
  };
}

export default function LessonPage({ params }: Params) {
  const ctx = getLessonContext(params.lang, params.level, params.lesson);
  if (!ctx) notFound();
  const { lang, level, track, lesson, index, prev, next } = ctx;
  const levelHref = `/programming/${lang.slug}/${level}`;
  const runs = runSpecsFor(lang.slug, level, lesson.slug);

  return (
    <>
      <Nav />
      <main>
        <section className="subj-detail-hero prog-lesson-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/programming">Programming</a>
            <span>/</span>
            <a href={`/programming/${lang.slug}`}>{lang.name}</a>
            <span>/</span>
            <a href={levelHref}>{LEVEL_LABELS[level]}</a>
            <span>/</span>
            <span aria-current="page">{lesson.title}</span>
          </nav>
          <p className="subj-detail-meta">
            <span className={`prog-level-badge is-${level}`}>{LEVEL_LABELS[level]}</span>
            {lang.name} · Lesson {index + 1} of {track.lessons.length}
          </p>
          <h1 className="prog-lesson-title">{lesson.title}</h1>
          <p className="prog-lang-desc">{lesson.summary}</p>
        </section>

        <div className="prog-layout">
          <aside className="prog-toc" aria-label={`${LEVEL_LABELS[level]} lessons`}>
            <p className="prog-toc-title">{LEVEL_LABELS[level]} lessons</p>
            <ol>
              {track.lessons.map((l) => (
                <li key={l.slug}>
                  {l.slug === lesson.slug ? (
                    <span aria-current="page" className="prog-toc-current">{l.title}</span>
                  ) : (
                    <a href={lessonHref(lang.slug, level, l.slug)}>{l.title}</a>
                  )}
                </li>
              ))}
            </ol>
          </aside>

          <div className="prog-lessons">
            <article className="prog-lesson">
              {lesson.body.map((para, j) => (
                <p className="prog-para" key={j}>
                  <RichText text={para} />
                </p>
              ))}

              {lesson.code.map((sample, j) => (
                <CodeBlock sample={sample} run={runs.lesson[j]} key={j} />
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

              {lesson.practice && (
                <details className="prog-solution">
                  <summary>Show solution</summary>
                  <p className="prog-solution-hint">
                    Try the exercise yourself first — then compare your approach with this one.
                  </p>
                  {lesson.practice.solution.notes.map((note, j) => (
                    <p className="prog-para" key={j}>
                      <RichText text={note} />
                    </p>
                  ))}
                  {lesson.practice.solution.code.map((sample, j) => (
                    <CodeBlock sample={sample} run={runs.solution[j]} key={j} />
                  ))}
                </details>
              )}
            </article>

            {lesson.practice && <Quiz questions={lesson.practice.quiz} />}

            <nav className="prog-level-nav prog-pager" aria-label="Lesson navigation">
              {prev ? (
                <a href={lessonHref(lang.slug, prev.level, prev.lesson.slug)} className="prog-pager-link">
                  <span className="prog-pager-dir">← Previous</span>
                  <span className="prog-pager-title">{prev.lesson.title}</span>
                </a>
              ) : (
                <a href={`/programming/${lang.slug}`} className="prog-pager-link">
                  <span className="prog-pager-dir">← Back</span>
                  <span className="prog-pager-title">{lang.name} overview</span>
                </a>
              )}
              {next ? (
                <a href={lessonHref(lang.slug, next.level, next.lesson.slug)} className="prog-pager-link is-next">
                  <span className="prog-pager-dir">
                    Next{next.level !== level ? ` · ${LEVEL_LABELS[next.level]}` : ""} →
                  </span>
                  <span className="prog-pager-title">{next.lesson.title}</span>
                </a>
              ) : (
                <a href="/programming" className="prog-pager-link is-next">
                  <span className="prog-pager-dir">Finished! →</span>
                  <span className="prog-pager-title">Choose another language</span>
                </a>
              )}
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
