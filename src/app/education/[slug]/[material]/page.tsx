import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PrintButton from "@/components/education/PrintButton";
import { getSubjectBySlug } from "@/lib/education";
import {
  isMaterialKey,
  materialLabel,
  hasContent,
  buildSchemeOfWork,
  buildLessonPlans,
  buildLessonNotes,
  type MaterialKey,
} from "@/lib/materials";
import { formatTzs, packFor, saleTerm, termLabel } from "@/lib/catalog";
import { hasPackAccess, sellingEnabled } from "@/lib/entitlements";
import { SESSION_COOKIE, readSession } from "@/lib/teacherAuth";

interface Params {
  params: { slug: string; material: string };
}

// Rendered per request: sold subjects show the full material only to
// teachers with the pack, and everyone else sees the preview.
export const dynamic = "force-dynamic";

/** How much of a sold subject anyone can read: enough to judge it by. */
const PREVIEW = { schemeRows: 2, plansPerForm: 1, noteTopicsPerForm: 1 };

export function generateMetadata({ params }: Params): Metadata {
  const subject = getSubjectBySlug(params.slug);
  if (!subject || !isMaterialKey(params.material)) return { title: "Not found — Dolese Tech" };
  return {
    title: `${subject.name} — ${materialLabel(params.material)} | Dolese Tech`,
    description: `${materialLabel(params.material)} for ${subject.name}, ${subject.level} (${subject.forms}), Tanzania TIE syllabus.`,
  };
}

export default async function MaterialPage({ params }: Params) {
  const subject = getSubjectBySlug(params.slug);
  if (!subject || !isMaterialKey(params.material)) notFound();

  const material = params.material as MaterialKey;
  const downloadHref = `/api/education/download?slug=${params.slug}&material=${material}`;
  const available = hasContent(params.slug);

  const pack = sellingEnabled() ? packFor(params.slug) : undefined;
  const teacherId = pack ? readSession(cookies().get(SESSION_COOKIE)?.value) : null;
  const preview = Boolean(pack) && !(await hasPackAccess(teacherId, params.slug));

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
            {available && !preview && (
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
            <SchemeOfWorkView slug={params.slug} subject={subject.name} level={subject.level} forms={subject.forms} preview={preview} />
          ) : material === "lesson-plans" ? (
            <LessonPlansView slug={params.slug} subject={subject.name} preview={preview} />
          ) : (
            <LessonNotesView slug={params.slug} preview={preview} />
          )}
          {available && preview && pack && (
            <aside className="pack-lock" aria-label="Preview">
              <p className="pack-lock-kicker">You&apos;re reading a preview</p>
              <h2>Get the full {subject.name} pack</h2>
              <p>
                Every week of the scheme of work, every lesson plan and all the lesson notes for {subject.forms},
                with editable Word downloads. {formatTzs(pack.price)} for {termLabel(saleTerm())}.
              </p>
              <div className="pack-lock-actions">
                {teacherId ? (
                  <a className="btn-filled" href={`/checkout?product=${pack.id}`}>Buy the pack</a>
                ) : (
                  <a className="btn-filled" href={`/account/sign-in?next=${encodeURIComponent(`/checkout?product=${pack.id}`)}`}>
                    Sign in to buy
                  </a>
                )}
                <a className="btn-outline" href="/pricing">See prices</a>
              </div>
            </aside>
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

function SchemeOfWorkView({ slug, subject, level, forms, preview }: { slug: string; subject: string; level: string; forms: string; preview: boolean }) {
  const sections = buildSchemeOfWork(slug, subject).map((section) =>
    preview ? { ...section, rows: section.rows.slice(0, PREVIEW.schemeRows) } : section,
  );
  return (
    <>
      {sections.map((section) => (
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

function LessonPlansView({ slug, subject, preview }: { slug: string; subject: string; preview: boolean }) {
  const all = buildLessonPlans(slug, subject);
  // In a preview, the first plans of each form.
  const plans = preview
    ? all.filter((p, i) => all.slice(0, i).filter((q) => q.form === p.form).length < PREVIEW.plansPerForm)
    : all;
  return (
    <>
      {plans.map((plan) => (
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

function LessonNotesView({ slug, preview }: { slug: string; preview: boolean }) {
  const sections = buildLessonNotes(slug).map((section) =>
    preview ? { ...section, topics: section.topics.slice(0, PREVIEW.noteTopicsPerForm) } : section,
  );
  return (
    <>
      {sections.map((section) => (
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
                {t.sections.map((s) => (
                  <div key={s.heading}>
                    <h5>{s.heading}</h5>
                    {s.body && <p>{s.body}</p>}
                    {s.points && (
                      <ul>
                        {s.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </article>
      ))}
    </>
  );
}
