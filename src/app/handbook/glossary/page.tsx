import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChapterBody from "@/components/handbook/ChapterBody";
import { HANDBOOK, glossary, glossaryMarkdown } from "@/content/handbook";
import "../reader.css";

export const metadata: Metadata = {
  title: `Kiswahili glossary — ${HANDBOOK.title}`,
  description: "Computer and programming terms in English and Kiswahili, with what each one means.",
  alternates: { canonical: "/handbook/glossary" },
};

export default function HandbookGlossary() {
  return (
    <>
      <Nav />
      <main className="hbr">
        <nav className="breadcrumb hbr-breadcrumb" aria-label="Breadcrumb">
          <a href="/handbook">IT Handbook</a>
          <span>/</span>
          <span aria-current="page">Glossary</span>
        </nav>
        <div className="hbr-layout hbr-layout-single">
          <article className="hbr-article">
            <header className="hbr-chapter-head">
              <span className="hbr-kicker">Appendix</span>
              <h1>Kiswahili glossary</h1>
              <p>
                The {glossary().length} key terms from every chapter, in alphabetical order. The last column gives the
                chapter that explains each one.
              </p>
            </header>
            <ChapterBody markdown={glossaryMarkdown()} />
            <p className="hbr-note">
              These Kiswahili terms are a first version and are being checked. If you use a different word in class,{" "}
              <a href="/#contact">let us know</a>.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
