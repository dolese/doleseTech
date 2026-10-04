import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { LANGUAGES, LEVELS, LEVEL_LABELS, getLanguage, isAvailable } from "@/lib/programming";

interface Params {
  params: { lang: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGUAGES.filter(isAvailable).map((l) => ({ lang: l.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const lang = getLanguage(params.lang);
  if (!lang) return { title: "Language not found — Dolese Tech" };
  return {
    title: `Learn ${lang.name} (${lang.runtime}) — Beginner to Advanced | Dolese Tech`,
    description: lang.description,
  };
}

export default function LanguagePage({ params }: Params) {
  const lang = getLanguage(params.lang);
  if (!lang || !isAvailable(lang)) notFound();

  return (
    <>
      <Nav />
      <main>
        <section className="subj-detail-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/programming">Programming</a>
            <span>/</span>
            <span aria-current="page">{lang.name}</span>
          </nav>

          <div className="subj-detail-head">
            <span className="subj-code subj-code-lg" style={{ background: lang.color }}>
              {lang.code}
            </span>
            <div>
              <h1>{lang.name}</h1>
              <p className="subj-detail-meta">
                <span className="subj-level">{lang.runtime}</span>
                Beginner → Intermediate → Advanced
              </p>
            </div>
          </div>
          <p className="prog-lang-desc">{lang.description}</p>
        </section>

        {LEVELS.map((lvl, i) => {
          const track = lang.levels[lvl];
          return (
            <section className="detail-section" key={lvl} id={lvl}>
              <div className="prog-level-head">
                <span className={`prog-level-badge is-${lvl}`}>
                  {i + 1}. {LEVEL_LABELS[lvl]}
                </span>
                <span className="prog-level-count">{track.lessons.length} lessons</span>
              </div>
              <p className="prog-level-intro">{track.intro}</p>

              <div className="form-blocks">
                <div className="form-block reveal">
                  <h3>You will be able to</h3>
                  <ul className="prog-outcomes">
                    {track.outcomes.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div className="form-block reveal">
                  <h3>Lessons</h3>
                  <ol className="prog-lesson-index">
                    {track.lessons.map((l) => (
                      <li key={l.slug}>
                        <a href={`/programming/${lang.slug}/${lvl}#${l.slug}`}>{l.title}</a>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <a href={`/programming/${lang.slug}/${lvl}`} className="btn-outline prog-level-cta">
                Start {LEVEL_LABELS[lvl]} track →
              </a>
            </section>
          );
        })}

        <section className="detail-back">
          <a href="/programming" className="btn-outline">← All languages</a>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
