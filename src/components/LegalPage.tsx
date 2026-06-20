import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  points?: string[];
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <>
      <Nav />
      <main>
        <section className="legal-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <span aria-current="page">{title}</span>
          </nav>
          <h1>{title}</h1>
          <p className="legal-updated">Last updated: {updated}</p>
        </section>

        <section className="legal-body">
          <p className="legal-intro">{intro}</p>
          {sections.map((s, i) => (
            <div className="legal-section" key={s.heading}>
              <h2>
                {i + 1}. {s.heading}
              </h2>
              {s.paragraphs?.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.points && (
                <ul>
                  {s.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <p className="legal-note">
            This document is a general template. Please have it reviewed against your specific legal
            and regulatory requirements before relying on it.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
