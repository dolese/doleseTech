import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ResourceLibrary from "@/components/education/ResourceLibrary";
import SampleMaterials from "@/components/education/SampleMaterials";
import { SUBJECTS, COMBINATIONS } from "@/lib/education";

export const metadata: Metadata = {
  title: "Education — Dolese Tech | Tanzania Teaching Materials",
  description:
    "Schemes of Work, Lesson Plans and well-organized Lesson Notes for Tanzania's O-Level and A-Level subjects, aligned to the TIE/NECTA syllabus.",
};

const MATERIAL_CARDS = [
  {
    title: "Schemes of Work",
    desc: "Term-by-term plans mapping topics, objectives, activities, resources and assessment for every form.",
  },
  {
    title: "Lesson Plans",
    desc: "Period-ready plans with competences, objectives, staged activities and timing in the standard format.",
  },
  {
    title: "Lesson Notes",
    desc: "Clear, well-organized notes per topic — definitions, examples and activities students can follow.",
  },
];

export default function EducationPage() {
  const oLevel = SUBJECTS.filter((s) => s.level === "O-Level").length;
  const aLevel = SUBJECTS.filter((s) => s.level === "A-Level").length;

  return (
    <>
      <Nav />
      <main>
        {/* ── HEADER ─────────────────────────────────────── */}
        <section className="edu-hero">
          <div className="tag">Education · Tanzania</div>
          <h1>
            Teaching materials that <strong>save you hours</strong>
          </h1>
          <p className="edu-hero-sub">
            Schemes of Work, Lesson Plans and well-organized Lesson Notes for Tanzania&apos;s
            secondary school subjects — aligned to the TIE syllabus and NECTA standards, ready to
            adapt for your classroom.
          </p>
          <div className="edu-hero-stats">
            <div><strong>{oLevel}</strong><span>O-Level subjects</span></div>
            <div className="hsb-divider" />
            <div><strong>{aLevel}</strong><span>A-Level subjects</span></div>
            <div className="hsb-divider" />
            <div><strong>3</strong><span>Material types</span></div>
          </div>
        </section>

        {/* ── WHAT'S INSIDE ──────────────────────────────── */}
        <section className="edu-types">
          <div className="edu-types-grid">
            {MATERIAL_CARDS.map((c) => (
              <div className="edu-type-card reveal" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── LIBRARY ────────────────────────────────────── */}
        <section className="edu-library">
          <div className="edu-section-head">
            <div className="tag">Browse</div>
            <h2 className="section-title">
              Find your <strong>subject</strong>
            </h2>
            <p className="section-sub">
              Filter by level or search by name. Every subject ships with a Scheme of Work, Lesson
              Plans and Lesson Notes for each form.
            </p>
          </div>
          <ResourceLibrary />

          <div className="edu-combos">
            <span className="edu-combos-label">A-Level combinations covered</span>
            <div className="edu-combos-list">
              {COMBINATIONS.map((c) => (
                <span className="edu-combo" key={c}>{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SAMPLES ────────────────────────────────────── */}
        <SampleMaterials />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
