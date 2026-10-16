import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CHAPTERS, HANDBOOK, glossary, readingMinutes } from "@/content/handbook";
import "./reader.css";

export const metadata: Metadata = {
  title: `${HANDBOOK.title} — free to read | Dolese Tech`,
  description:
    "A practical IT handbook for Tanzanian teachers and students: computer essentials, HTML and CSS, JavaScript, SQL, Python, C++, staying safe online and Git — building one school results system, with Kiswahili key terms.",
  alternates: { canonical: "/handbook" },
};

export default function HandbookHome() {
  const written = CHAPTERS.filter((c) => c.body);
  const first = written[0];

  return (
    <>
      <Nav />
      <main className="hbr">
        <section className="hbr-hero">
          <div className="tag">Free to read</div>
          <h1>
            {HANDBOOK.title.replace(" Handbook", "")} <strong>Handbook</strong>
          </h1>
          <p className="hbr-hero-sub">{HANDBOOK.subtitle}.</p>
          <p className="hbr-hero-text">
            Eight chapters that build one real project — a school results system — from a first web page to a shared
            database, a Python report and a published website. Every code example is run before it is printed, and every
            chapter ends with its key terms in English and Kiswahili.
          </p>
          <div className="hbr-hero-actions">
            {first && (
              <a className="btn-filled" href={`/handbook/${first.slug}`}>
                Start reading
              </a>
            )}
            <a className="btn-outline" href="/handbook/print">
              Print or save as PDF
            </a>
          </div>
        </section>

        <section className="hbr-chapters" aria-label="Chapters">
          {CHAPTERS.map((c) =>
            c.body ? (
              <a key={c.slug} className="hbr-chapter-card" href={`/handbook/${c.slug}`}>
                <span className="hbr-chapter-num">{String(c.number).padStart(2, "0")}</span>
                <span className="hbr-chapter-text">
                  <strong>{c.title}</strong>
                  <span>{c.summary}</span>
                  <small>{readingMinutes(c.body)} min read</small>
                </span>
              </a>
            ) : (
              <div key={c.slug} className="hbr-chapter-card is-soon">
                <span className="hbr-chapter-num">{String(c.number).padStart(2, "0")}</span>
                <span className="hbr-chapter-text">
                  <strong>{c.title}</strong>
                  <span>{c.summary}</span>
                  <small>In preparation</small>
                </span>
              </div>
            ),
          )}
          <a className="hbr-chapter-card hbr-glossary-card" href="/handbook/glossary">
            <span className="hbr-chapter-num">A–Z</span>
            <span className="hbr-chapter-text">
              <strong>Kiswahili glossary</strong>
              <span>All {glossary().length} key terms from the book, in English and Kiswahili.</span>
            </span>
          </a>
        </section>

        <section className="hbr-about">
          <h2>How to use this book</h2>
          <p>
            Read the chapters in order if you are new to programming: each one adds a part to the same results system,
            using the files from the chapter before. Chapter 1 sets up the project folder, and Chapter 7, on staying safe
            online, can be read at any time.
          </p>
          <p>
            All the schools, teachers and students in the examples are invented. The Kiswahili terms are a first
            version; if you know a better word, <a href="/#contact">tell us</a>.
          </p>
          <p className="hbr-edition">{HANDBOOK.edition}</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
