import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Team from "@/components/Team";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "About — Dolese Tech",
  description:
    "Dolese Tech builds reliable, scalable technology — and well-organized teaching materials for Tanzania. Built by engineers, for people who ship.",
};

const VALUES = [
  {
    title: "Engineering first",
    desc: "We write code we're proud to put our name on. Quality isn't negotiable, because shortcuts always cost more later.",
  },
  {
    title: "Radical transparency",
    desc: "You always know where your project stands, why decisions were made, and what comes next. No surprises.",
  },
  {
    title: "Long-term partnership",
    desc: "We measure success by your outcomes, not ours. Most of our clients have been with us for over five years.",
  },
];

const STATS = [
  { num: "12", label: "Years building" },
  { num: "200+", label: "Projects delivered" },
  { num: "18", label: "Industries served" },
  { num: "98%", label: "Client retention" },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="about-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <span aria-current="page">About</span>
          </nav>
          <div className="tag">About</div>
          <h1>
            Built by engineers, <strong>for people who ship</strong>
          </h1>
          <p className="about-hero-sub">
            Dolese Tech builds software, cloud systems and data infrastructure for organizations
            that need things done right — and well-organized teaching materials for Tanzania&apos;s
            classrooms. One team, high standards, real outcomes.
          </p>
        </section>

        {/* ── STORY ──────────────────────────────────────── */}
        <section className="about-story">
          <div className="about-story-grid">
            <div className="reveal">
              <h2 className="detail-h2">Our story</h2>
              <p>
                Founded in 2013, Dolese Tech started as a small team with high standards. We took on
                the work other teams shied away from — the systems that had to be reliable, secure
                and built to last.
              </p>
              <p>
                Those standards haven&apos;t changed, just the scale at which we apply them. Today we
                deliver across the full technology stack, and we&apos;ve extended the same care to
                education — building schemes of work, lesson plans and lesson notes aligned to
                Tanzania&apos;s competence-based curriculum.
              </p>
            </div>
            <div className="reveal">
              <h2 className="detail-h2">What we do</h2>
              <p>
                We cover custom software, cloud infrastructure, cybersecurity, data &amp; analytics,
                AI &amp; automation and IT consulting — so you can work with one team you trust
                instead of managing five vendors.
              </p>
              <a href="/#services" className="subj-link">Explore our services →</a>
            </div>
          </div>
        </section>

        {/* ── VALUES ─────────────────────────────────────── */}
        <section className="about-values">
          <div className="edu-section-head">
            <div className="tag">Values</div>
            <h2 className="section-title">
              What we <strong>stand for</strong>
            </h2>
          </div>
          <div className="values-grid">
            {VALUES.map((v) => (
              <div className="value-card reveal" key={v.title}>
                <div className="value-dot" />
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ──────────────────────────────────────── */}
        <section className="about-stats-band">
          {STATS.map((s) => (
            <div className="about-stat" key={s.label}>
              <div className="about-stat-num">{s.num}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── TEAM ───────────────────────────────────────── */}
        <Team />

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="svc-cta">
          <h2>Let&apos;s build something that lasts</h2>
          <p>Tell us what you&apos;re working on — even a rough idea is a good place to start.</p>
          <div className="hero-actions">
            <a href="/#cta" className="btn-filled">Get in touch</a>
            <a href="/education" className="btn-outline">Browse education</a>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
