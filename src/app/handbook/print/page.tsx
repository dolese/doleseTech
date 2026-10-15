import type { Metadata } from "next";
import { BrandMark } from "@/components/BrandLogo";
import ChapterBody from "@/components/handbook/ChapterBody";
import { CHAPTERS, HANDBOOK, type Chapter } from "@/content/handbook";
import "./handbook.css";

/**
 * The handbook laid out for printing. `npm run build:handbook` opens this
 * page in a headless browser and saves it as the PDF.
 *
 *   /handbook/print                 the whole book (written chapters only)
 *   /handbook/print?chapters=7      one chapter, with the cover
 *   /handbook/print?chapters=7,8    several
 */
export const metadata: Metadata = {
  title: `${HANDBOOK.title} — print`,
  robots: { index: false, follow: false },
};

function selected(param: string | undefined): Chapter[] {
  const written = CHAPTERS.filter((c) => c.body);
  if (!param || param === "all") return written;
  const wanted = new Set(param.split(",").map((n) => Number(n.trim())));
  return written.filter((c) => wanted.has(c.number));
}

export default function HandbookPrint({ searchParams }: { searchParams: { chapters?: string } }) {
  const chapters = selected(searchParams.chapters);

  return (
    <div className="hb-book">
      <section className="hb-cover">
        <div className="hb-cover-rings" aria-hidden="true" />
        <div className="hb-cover-top">
          <BrandMark size={84} tone="dark" />
          <span className="hb-cover-brand">
            dolese <b>TECH</b>
          </span>
        </div>
        <div className="hb-cover-main">
          <h1>
            IT <em>Handbook</em>
          </h1>
          <p className="hb-cover-sub">{HANDBOOK.subtitle}</p>
          <ul className="hb-cover-parts">
            {CHAPTERS.map((c) => (
              <li key={c.slug}>
                <span>{String(c.number).padStart(2, "0")}</span> {c.title}
              </li>
            ))}
          </ul>
        </div>
        <p className="hb-cover-foot">{HANDBOOK.edition} · dolese.tech</p>
      </section>

      <section className="hb-contents">
        <h2>Contents</h2>
        <ol>
          {CHAPTERS.map((c) => (
            <li key={c.slug} className={c.body ? "" : "hb-contents-soon"}>
              <span className="hb-contents-num">{c.number}</span>
              <span className="hb-contents-title">
                {c.title}
                <small>{c.summary}</small>
              </span>
              {!c.body && <span className="hb-contents-tag">In preparation</span>}
            </li>
          ))}
        </ol>
        <p className="hb-contents-note">
          Every chapter builds part of one project: a small school results system. Code examples are tested
          before they are printed, and examples use Tanzanian names, places and numbers.
        </p>
      </section>

      {chapters.map((c) => (
        <article key={c.slug} className="hb-chapter">
          <header className="hb-chapter-head">
            <span className="hb-chapter-num">Chapter {c.number}</span>
            <h1>{c.title}</h1>
            <p>{c.summary}</p>
          </header>
          <ChapterBody markdown={c.body!} />
        </article>
      ))}
    </div>
  );
}
