import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const PORTAL_URL = "https://results.dolese.tech";

export const metadata: Metadata = {
  title: "ResultsPortal — school results management | Dolese Tech",
  description:
    "ResultsPortal handles NECTA grading, divisions, report cards and result sheets for Tanzanian secondary schools. Built and run by Dolese Tech.",
};

/* Wording follows ResultsPortal's own feature and workflow copy, so the two
   sites describe the product the same way. */
const FEATURES = [
  {
    title: "NECTA grading and divisions",
    body: "A–F grading, points and Division I–0 are computed from best-seven subjects the way Tanzanian schools expect.",
  },
  {
    title: "Roster import and CNO",
    body: "Import students from CSV or Excel with validation, then auto-assign candidate numbers with female-first alphabetical ordering.",
  },
  {
    title: "Printable report cards",
    body: "Print-ready student report cards and class result sheets, generated from the marks teachers entered.",
  },
  {
    title: "Live analytics",
    body: "Division distribution, subject performance, pass rates and top performers update as soon as marks are entered.",
  },
  {
    title: "Role-based access",
    body: "School admins, academic staff, teachers and guardians each see only what they need to do their job.",
  },
  {
    title: "Multi-school platform",
    body: "One portal for many schools. Database-level isolation means one school can never read another school's students or marks.",
  },
];

const STEPS = [
  { n: "01", title: "Onboard the school", body: "Create the school, admin account, academic year, forms, streams and subjects." },
  { n: "02", title: "Build the roster", body: "Import students in bulk or add them manually, then let the system assign candidate numbers." },
  { n: "03", title: "Enter marks", body: "Role-based marks entry per exam, with no leakage between exams." },
  { n: "04", title: "Generate results", body: "Publish ranked result sheets, divisions and printable report cards." },
];

const SECURITY = [
  { title: "Tenant isolation", body: "Database-level protection keeps every school's data separate." },
  { title: "Hardened sign-in", body: "Rate-limited sign-in, hashed passwords, session expiry and a forced password change on first login." },
  { title: "Least privilege", body: "Accounts are scoped to a role, so no one holds more access than their job needs." },
];

export default function ResultsPortalPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="svc-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <a href="/#products">Products</a>
            <span>/</span>
            <span aria-current="page">ResultsPortal</span>
          </nav>
          <div className="product-kicker">School results management</div>
          <h1>ResultsPortal</h1>
          <p className="svc-hero-tagline">
            Schools enter marks once. ResultsPortal handles the grading, divisions,
            report cards and result sheets, the way Tanzanian secondary schools
            already work.
          </p>
          <div className="hero-actions" style={{ marginTop: 28 }}>
            <a href={PORTAL_URL} className="btn-filled" target="_blank" rel="noopener">
              Open ResultsPortal →
            </a>
            <a href="/#cta" className="btn-outline">Request a portal</a>
          </div>
        </section>

        <section className="svc-detail-body">
          <p className="svc-overview">
            ResultsPortal runs on one platform shared by many schools, with each
            school&apos;s students and marks kept separate. It works in a phone&apos;s
            browser as well as on a computer, in English and Kiswahili.
          </p>

          <h2 className="detail-h2">What it does</h2>
          <div className="prod-feature-grid">
            {FEATURES.map((f) => (
              <div className="prod-feature-card reveal" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>

          <h2 className="detail-h2 prod-h2-spaced">How a school gets started</h2>
          <ol className="prod-steps">
            {STEPS.map((s) => (
              <li className="prod-step reveal" key={s.n}>
                <span className="prod-step-n">{s.n}</span>
                <div>
                  <div className="prod-step-title">{s.title}</div>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="detail-h2 prod-h2-spaced">How school data is protected</h2>
          <ul className="svc-list">
            {SECURITY.map((s) => (
              <li key={s.title}>
                <span className="svc-check" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span>
                  <strong>{s.title}.</strong> {s.body}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="svc-cta">
          <h2>Bring your school onto ResultsPortal</h2>
          <p>
            Tell us about your school and we&apos;ll set up your portal. Plans and
            pricing are on the portal itself.
          </p>
          <div className="hero-actions">
            <a href="/#cta" className="btn-filled">Get in touch</a>
            <a href={PORTAL_URL} className="btn-outline" target="_blank" rel="noopener">
              See plans and pricing
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
