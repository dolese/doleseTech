import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChapterBody from "@/components/handbook/ChapterBody";
import { CHAPTERS, HANDBOOK, chapterSections, chapterWithNeighbours, readingMinutes } from "@/content/handbook";
import "../reader.css";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return CHAPTERS.filter((c) => c.body).map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const found = chapterWithNeighbours(params.slug);
  if (!found?.chapter.body) return { title: "Not found — Dolese Tech" };
  const { chapter } = found;
  return {
    title: `${chapter.number}. ${chapter.title} — ${HANDBOOK.title}`,
    description: chapter.summary,
    alternates: { canonical: `/handbook/${chapter.slug}` },
  };
}

export default function HandbookChapter({ params }: Params) {
  const found = chapterWithNeighbours(params.slug);
  if (!found?.chapter.body) notFound();
  const { chapter, previous, next } = found;
  const sections = chapterSections(chapter.body!);

  return (
    <>
      <Nav />
      <main className="hbr">
        <nav className="breadcrumb hbr-breadcrumb" aria-label="Breadcrumb">
          <a href="/handbook">IT Handbook</a>
          <span>/</span>
          <span aria-current="page">Chapter {chapter.number}</span>
        </nav>

        <div className="hbr-layout">
          <article className="hbr-article">
            <header className="hbr-chapter-head">
              <span className="hbr-kicker">Chapter {chapter.number}</span>
              <h1>{chapter.title}</h1>
              <p>{chapter.summary}</p>
              <p className="hbr-meta">
                {readingMinutes(chapter.body!)} min read ·{" "}
                <a href={`/handbook/print?chapters=${chapter.number}`}>Print this chapter</a>
              </p>
            </header>
            <ChapterBody markdown={chapter.body!} />

            <nav className="hbr-pager" aria-label="Chapters">
              {previous?.body ? (
                <a href={`/handbook/${previous.slug}`} className="hbr-pager-link">
                  <small>← Chapter {previous.number}</small>
                  {previous.title}
                </a>
              ) : (
                <a href="/handbook" className="hbr-pager-link">
                  <small>←</small>All chapters
                </a>
              )}
              {next?.body ? (
                <a href={`/handbook/${next.slug}`} className="hbr-pager-link hbr-pager-next">
                  <small>Chapter {next.number} →</small>
                  {next.title}
                </a>
              ) : (
                <a href="/handbook/glossary" className="hbr-pager-link hbr-pager-next">
                  <small>Appendix →</small>
                  Kiswahili glossary
                </a>
              )}
            </nav>
          </article>

          <aside className="hbr-toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
