import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { sellingEnabled } from "@/lib/entitlements";
import { faqGroups } from "@/lib/faq";
import "../exams/landing.css";

export const metadata: Metadata = {
  title: "Questions — Dolese Tech",
  description: "Answers about the Exams Composer: how papers are made, NECTA formats, prices, mobile money and privacy.",
  alternates: { canonical: "/faq" },
};

// Prices in the answers follow whether papers are sold yet.
export const revalidate = 3600;

export default function FaqPage() {
  const groups = faqGroups(sellingEnabled());
  // Lets search engines show the answers directly.
  const structured = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    ),
  };

  return (
    <>
      <Nav />
      <main>
        <section className="exam-hero exam-hero-compact">
          <div className="tag">Help</div>
          <h1>
            Questions, <strong>answered</strong>
          </h1>
          <p className="exam-hero-sub">
            Not here? Email <a href="mailto:support@dolese.tech">support@dolese.tech</a>.
          </p>
        </section>

        <section className="faq-page">
          {groups.map((g) => (
            <div key={g.title} className="faq-group">
              <h2>{g.title}</h2>
              <div className="faq-list">
                {g.items.map((f) => (
                  <details key={f.id} id={f.id} className="faq-item">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
    </>
  );
}
