import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FREE_PAPERS_PER_MONTH, PRODUCTS, formatTzs, saleTerm, termLabel } from "@/lib/catalog";
import { getSubjectBySlug } from "@/lib/education";
import { NETWORKS } from "@/lib/phone";
import { sellingEnabled } from "@/lib/entitlements";

export const metadata: Metadata = {
  title: "Prices — Dolese Tech",
  description:
    "Exam papers from the Exams Composer and complete subject packs for Tanzanian teachers. Two papers free every month; pay by mobile money.",
  alternates: { canonical: "/pricing" },
};

// The term on sale changes twice a year; an hour is plenty fresh.
export const revalidate = 3600;

const checkout = (id: string) => `/checkout?product=${id}`;

export default function PricingPage() {
  // Nothing is on sale until accounts and the database are configured.
  if (!sellingEnabled()) notFound();
  const papers = PRODUCTS.find((p) => p.kind === "papers");
  const packs = PRODUCTS.filter((p) => p.kind === "pack");
  const term = saleTerm();

  return (
    <>
      <Nav />
      <main>
        <section className="pricing-hero">
          <div className="tag">Prices</div>
          <h1>
            Pay only for what <strong>you use</strong>
          </h1>
          <p>
            Start free. When you need more, pay by mobile money from your phone:{" "}
            {NETWORKS.map((n) => n.name).join(", ")}.
          </p>
        </section>

        <section className="pricing-grid" aria-label="Plans">
          <article className="price-card">
            <h2>Free</h2>
            <p className="price-amount">TZS 0</p>
            <p className="price-unit">with a free account</p>
            <ul className="price-list">
              <li>{FREE_PAPERS_PER_MONTH} exam papers every month</li>
              <li>Schemes, plans and notes for 20 subjects</li>
              <li>A preview of each subject pack</li>
              <li>Programming lessons and quizzes</li>
            </ul>
            <a className="btn-outline price-cta" href="/account/sign-in?next=/exams">
              Create a free account
            </a>
          </article>

          {papers && papers.kind === "papers" && (
            <article className="price-card price-card-main">
              <span className="price-badge">Exams Composer</span>
              <h2>{papers.name}</h2>
              <p className="price-amount">{formatTzs(papers.price)}</p>
              <p className="price-unit">{formatTzs(papers.price / papers.papers)} a paper · they never expire</p>
              <ul className="price-list">
                <li>NECTA-style papers for any subject and form</li>
                <li>Marking scheme with every paper</li>
                <li>Editable Word downloads and versions A–D</li>
                <li>Used after your free papers for the month</li>
              </ul>
              <a className="btn-filled price-cta" href={checkout(papers.id)}>
                Buy {papers.papers} papers
              </a>
            </article>
          )}

          <article className="price-card">
            <h2>Subject packs</h2>
            <p className="price-amount">{formatTzs(packs[0]?.price ?? 0)}</p>
            <p className="price-unit">per subject, for {termLabel(term)}</p>
            <ul className="price-list">
              <li>Every week of the scheme of work</li>
              <li>All lesson plans and lesson notes</li>
              <li>Editable Word downloads</li>
              <li>Expert-written, TIE / NECTA aligned</li>
            </ul>
            <div className="price-packs">
              {packs.map((p) =>
                p.kind === "pack" ? (
                  <a key={p.id} className="price-pack" href={checkout(p.id)}>
                    <span>
                      {getSubjectBySlug(p.subject)?.name}
                      <small>{getSubjectBySlug(p.subject)?.level} · {getSubjectBySlug(p.subject)?.forms}</small>
                    </span>
                    <span className="price-pack-buy">Buy →</span>
                  </a>
                ) : null,
              )}
            </div>
          </article>
        </section>

        <section className="pricing-faq">
          <h2>Questions</h2>
          <dl>
            <dt>How do I pay?</dt>
            <dd>
              Enter your mobile money number and press Pay. A prompt appears on that phone; enter your PIN to approve it.
              What you bought is ready as soon as the payment is confirmed, usually within a minute.
            </dd>
            <dt>When do subject packs end?</dt>
            <dd>
              Packs are sold by school term: Term 1 is January to June and Term 2 is July to December. A pack bought in
              June or December is for the next term, and you can use it straight away.
            </dd>
            <dt>Do bought papers expire?</dt>
            <dd>No. Your {FREE_PAPERS_PER_MONTH} free papers are used first each month, then the papers you bought.</dd>
            <dt>Why are only two subjects sold?</dt>
            <dd>
              Basic Mathematics and Biology are fully written by subject experts. Other subjects stay free while
              their materials are written, and are added here when they are ready.
            </dd>
            <dt>Something went wrong with a payment</dt>
            <dd>
              Your purchases and their references are in <a href="/account">your account</a>. If a payment left your
              phone but nothing arrived, <a href="/#contact">contact us</a> with the reference.
            </dd>
          </dl>
        </section>
      </main>
      <Footer />
    </>
  );
}
