import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PrintButton from "@/components/education/PrintButton";
import { SUBJECTS, subjectSlug, getSubjectBySlug } from "@/lib/education";
import {
  MATERIALS,
  isMaterialKey,
  materialLabel,
  hasContent,
  buildSchemeOfWork,
  buildLessonPlans,
  buildLessonNotes,
  type MaterialKey,
} from "@/lib/materials";

interface Params {
  params: { slug: string; material: string };
}

export function generateStaticParams() {
  return SUBJECTS.flatMap((s) =>
    MATERIALS.map((m) => ({ slug: subjectSlug(s), material: m.key })),
  );
}

export function generateMetadata({ params }: Params): Metadata {
  const subject = getSubjectBySlug(params.slug);
  if (!subject || !isMaterialKey(params.material)) return { title: "Not found — Dolese Tech" };
  return {
    title: `${subject.name} — ${materialLabel(params.material)} | Dolese Tech`,
    description: `${materialLabel(params.material)} for ${subject.name}, ${subject.level} (${subject.forms}), Tanzania TIE syllabus.`,
  };
}

export default function MaterialPage({ params }: Params) {
  const subject = getSubjectBySlug(params.slug);
  if (!subject || !isMaterialKey(params.material)) notFound();

  const material = params.material as MaterialKey;
  const downloadHref = `/api/education/download?slug=${params.slug}&material=${material}`;
  const available = hasContent(params.slug);

  return (
    <>
      <Nav />
      <main>
        <section className="mat-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/education">Education</a>
            <span>/</span>
            <a href={`/education/${params.slug}`}>{subject.name}</a>
            <span>/</span>
            <span aria-current="page">{materialLabel(material)}</span>
          </nav>
          <div className="mat-hero-row">
            <div>
              <span className="doc-kind">{materialLabel(material)}</span>
              <h1>{subject.name}</h1>
              <p className="mat-hero-meta">
                {subject.level} · {subject.forms} · TIE / NECTA aligned
              </p>
            </div>
            {available && (
              <div className="mat-actions">
                <a className="btn-filled" href={downloadHref}>Download .docx</a>
                <PrintButton />
              </div>
            )}
          </div>
        </section>

        <section className="mat-body">
          {!available ? (
            <p className="detail-note">
              Full {materialLabel(material).toLowerCase()} content for {subject.name} is being
              prepared. In the meantime, see the standard format on the{" "}
              <a href="/education#samples">Education page</a>.
            </p>
          ) : material === "scheme-of-work" ? (
            <SchemeOfWorkView slug={params.slug} />
          ) : material === "lesson-plans" ? (
            <LessonPlansView slug={params.slug} />
          ) : (
            <LessonNotesView slug={params.slug} />
          )}
        </section>

        <section className="detail-back">
          <a href={`/education/${params.slug}`} className="btn-outline">← Back to {subject.name}</a>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SchemeOfWorkView({ slug }: { slug: string }) {
  return (
    <>
      {buildSchemeOfWork(slug).map((section) => (
        <article className="sample-doc" key={section.form}>
          <header className="doc-head">
            <h3>{section.form} — Scheme of Work</h3>
            <p className="doc-sub">40-minute periods · adapt weeks to your term calendar</p>
          </header>
          <div className="table-scroll">
            <table className="sow-table">
              <thead>
                <tr>
                  <th>Week</th><th>Topic</th><th>Sub-topic</th><th>Objectives</th>
                  <th>Activities</th><th>Resources</th><th>Assessment</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((r) => (
                  <tr key={r.topic}>
                    <td>{r.week}</td><td>{r.topic}</td><td>{r.subTopic}</td><td>{r.objectives}</td>
                    <td>{r.activities}</td><td>{r.resources}</td><td>{r.assessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </>
  );
}

function LessonPlansView({ slug }: { slug: string }) {
  return (
    <>
      {buildLessonPlans(slug).map((plan) => (
        <article className="sample-doc" key={`${plan.form}-${plan.topic}`}>
          <header className="doc-head">
            <span className="doc-kind">{plan.form}</span>
            <h3>{plan.topic}</h3>
          </header>
          <dl className="lp-meta">
            <div className="lp-wide"><dt>Competence</dt><dd>{plan.competence}</dd></div>
            <div className="lp-wide">
              <dt>Specific Objectives</dt>
              <dd>By the end of the lesson, the student should be able to: {plan.objectives.join("; ")}.</dd>
            </div>
            <div className="lp-wide"><dt>Teaching / Learning Resources</dt><dd>{plan.resources}</dd></div>
          </dl>
          <div className="table-scroll">
            <table className="lp-table">
              <thead>
                <tr><th>Stage</th><th>Time</th><th>Teacher’s Activities</th><th>Student’s Activities</th></tr>
              </thead>
              <tbody>
                {plan.stages.map((s) => (
                  <tr key={s.stage}>
                    <td>{s.stage}</td><td>{s.time}</td><td>{s.teacher}</td><td>{s.student}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </>
  );
}

function LessonNotesView({ slug }: { slug: string }) {
  return (
    <>
      {buildLessonNotes(slug).map((section) => (
        <article className="sample-doc" key={section.form}>
          <header className="doc-head">
            <span className="doc-kind">{section.form}</span>
            <h3>Lesson Notes</h3>
          </header>
          <div className="lesson-notes">
            {section.topics.map((t) => (
              <div key={t.topic}>
                <h4>{t.topic}</h4>
                <p>{t.intro}</p>
                <ul>
                  {t.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      ))}
    </>
  );
}
