import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import {
  SUBJECTS,
  MATERIAL_TYPES,
  SUBJECT_TOPICS,
  subjectSlug,
  getSubjectBySlug,
} from "@/lib/education";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ slug: subjectSlug(s) }));
}

export function generateMetadata({ params }: Params): Metadata {
  const subject = getSubjectBySlug(params.slug);
  if (!subject) return { title: "Subject not found — Dolese Tech" };
  return {
    title: `${subject.name} (${subject.level}) — Teaching Materials | Dolese Tech`,
    description: `Scheme of Work, Lesson Plans and Lesson Notes for ${subject.name}, ${subject.level} (${subject.forms}), aligned to the Tanzania TIE syllabus.`,
  };
}

const MATERIAL_BLURBS: Record<string, string> = {
  "Scheme of Work": "Term-by-term plan: topics, sub-topics, objectives, activities, resources and assessment for each form.",
  "Lesson Plans": "Period-ready plans with competences, specific objectives and staged activities in the standard format.",
  "Lesson Notes": "Clear, well-organized notes per topic — definitions, examples and student activities.",
};

export default function SubjectPage({ params }: Params) {
  const subject = getSubjectBySlug(params.slug);
  if (!subject) notFound();

  const outline = SUBJECT_TOPICS[params.slug];

  return (
    <>
      <Nav />
      <main>
        <section className="subj-detail-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/education">Education</a>
            <span>/</span>
            <span>{subject.level}</span>
            <span>/</span>
            <span aria-current="page">{subject.name}</span>
          </nav>

          <div className="subj-detail-head">
            <span className="subj-code subj-code-lg" style={{ background: subject.color }}>
              {subject.code}
            </span>
            <div>
              <h1>{subject.name}</h1>
              <p className="subj-detail-meta">
                <span className={`subj-level ${subject.level === "A-Level" ? "is-alevel" : ""}`}>
                  {subject.level}
                </span>
                {subject.forms} · {subject.topics} topics · TIE / NECTA aligned
              </p>
            </div>
          </div>
        </section>

        {/* ── MATERIALS ─────────────────────────────────── */}
        <section className="detail-section">
          <h2 className="detail-h2">Available materials</h2>
          <div className="detail-materials">
            {MATERIAL_TYPES.map((m) => (
              <div className="detail-mat-card reveal" key={m}>
                <span className="subj-dot" />
                <h3>{m}</h3>
                <p>{MATERIAL_BLURBS[m]}</p>
                <a href="/education#samples" className="subj-link">
                  See sample format →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOPIC OUTLINE ─────────────────────────────── */}
        <section className="detail-section detail-topics">
          <h2 className="detail-h2">Topics by form</h2>
          {outline ? (
            <div className="form-blocks">
              {outline.map((block) => (
                <div className="form-block reveal" key={block.form}>
                  <h3>{block.form}</h3>
                  <ul className="topic-list">
                    {block.topics.map((t) => (
                      <li key={t} className="topic-chip">{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="detail-note">
              A detailed topic outline for {subject.name} is being prepared. The Scheme of Work,
              Lesson Plans and Lesson Notes above cover {subject.forms} in full — see the sample
              format on the{" "}
              <a href="/education#samples">Education page</a>.
            </p>
          )}
        </section>

        <section className="detail-back">
          <a href="/education" className="btn-outline">← Back to all subjects</a>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
