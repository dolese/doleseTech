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
            <SchemeOfWorkView slug={params.slug} subject={subject.name} level={subject.level} forms={subject.forms} />
          ) : material === "lesson-plans" ? (
            <LessonPlansView slug={params.slug} subject={subject.name} />
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

function SchemeOfWorkView({ slug, subject, level, forms }: { slug: string; subject: string; level: string; forms: string }) {
  return (
    <>
      {buildSchemeOfWork(slug, subject).map((section) => (
        <article className="sample-doc" key={section.form}>
          <header className="doc-head">
            <h3>{section.form} — Scheme of Work</h3>
            <p className="doc-sub">
              {subject} · {level} ({forms}) · competence-based (TIE) · adapt weeks to your term calendar
            </p>
          </header>
          <div className="table-scroll">
            <table className="sow-table sow-cb">
              <thead>
                <tr>
                  <th>Month</th><th>Week</th><th>Main Competence</th><th>Specific Competences</th>
                  <th>Topic</th><th>Sub-topic</th><th>Teaching &amp; Learning Activities</th>
                  <th>Methods</th><th>Resources</th><th>Assessment</th><th>Periods</th>
                  <th>References</th><th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((r) => (
                  <tr key={r.topic}>
                    <td>{r.month}</td>
                    <td>{r.week}</td>
                    <td>{r.mainCompetence}</td>
                    <td>
                      <ul className="cell-list">
                        {r.specificCompetences.map((sc) => <li key={sc}>{sc}</li>)}
                      </ul>
                    </td>
                    <td>{r.topic}</td>
                    <td>{r.subTopic}</td>
                    <td>{r.activities}</td>
                    <td>{r.methods}</td>
                    <td>{r.resources}</td>
                    <td>{r.assessment}</td>
                    <td>{r.periods}</td>
                    <td>{r.references}</td>
                    <td className="cell-muted">—</td>
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

function LessonPlansView({ slug, subject }: { slug: string; subject: string }) {
  return (
    <>
      {buildLessonPlans(slug, subject).map((plan) => (
        <article className="sample-doc" key={`${plan.form}-${plan.topic}`}>
          <header className="doc-head">
            <span className="doc-kind">{plan.form} · IDDR</span>
            <h3>{plan.topic}</h3>
          </header>
          <dl className="lp-meta">
            <div><dt>Class</dt><dd>{plan.form}</dd></div>
            <div><dt>Time</dt><dd>{plan.duration}</dd></div>
            <div><dt>Periods</dt><dd>{plan.periods}</dd></div>
            <div><dt>No. of Students</dt><dd>……</dd></div>
            <div className="lp-wide"><dt>Main Competence</dt><dd>{plan.mainCompetence}</dd></div>
            <div className="lp-wide"><dt>Specific Competence</dt><dd>{plan.specificCompetence}</dd></div>
            <div className="lp-wide"><dt>Sub-topic</dt><dd>{plan.subTopic}</dd></div>
            <div className="lp-wide"><dt>Teaching / Learning Resources</dt><dd>{plan.resources}</dd></div>
            <div className="lp-wide"><dt>References</dt><dd>{plan.references}</dd></div>
          </dl>
          <div className="table-scroll">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Stage (IDDR)</th><th>Time</th><th>Teacher’s Activities</th>
                  <th>Students’ Activities</th><th>Assessment</th>
                </tr>
              </thead>
              <tbody>
                {plan.stages.map((s) => (
                  <tr key={s.stage}>
                    <td><strong>{s.stage}</strong><br /><span className="cell-muted">{s.swahili}</span></td>
                    <td>{s.time}</td>
                    <td>{s.teacher}</td>
                    <td>{s.student}</td>
                    <td>{s.assessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lp-evaluation">
            <strong>Teacher&apos;s Self-Evaluation:</strong> ………………………………………………………………………………………………
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
