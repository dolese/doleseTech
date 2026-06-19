/**
 * Fully-written showcase samples in Tanzania's 2023 competence-based (TIE)
 * formats: a competence-based Scheme of Work, an IDDR Lesson Plan, and
 * structured Lesson Notes.
 */
export default function SampleMaterials() {
  return (
    <section id="samples" className="edu-samples">
      <div className="edu-section-head">
        <div className="tag">Samples</div>
        <h2 className="section-title">
          Ready-to-use <strong>sample materials</strong>
        </h2>
        <p className="section-sub">
          Three complete documents in Tanzania&apos;s competence-based (TIE) format — the Scheme of
          Work and the IDDR Lesson Plan — ready to adapt for any subject, form or term.
        </p>
      </div>

      {/* ── SAMPLE 1 — COMPETENCE-BASED SCHEME OF WORK ─────────── */}
      <article className="sample-doc">
        <header className="doc-head">
          <span className="doc-kind">Scheme of Work · competence-based</span>
          <h3>Basic Mathematics — Form I</h3>
          <p className="doc-sub">School: …… · Term I · Year: …… · Periods/week: 8 · TIE syllabus</p>
        </header>
        <div className="table-scroll">
          <table className="sow-table sow-cb">
            <thead>
              <tr>
                <th>Month</th><th>Week</th><th>Main Competence</th><th>Specific Competences</th>
                <th>Topic</th><th>Sub-topic</th><th>Teaching &amp; Learning Activities</th>
                <th>Methods</th><th>Resources</th><th>Assessment</th><th>Periods</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>January</td><td>1–2</td>
                <td>Use numbers and number operations to solve problems in daily life.</td>
                <td><ul className="cell-list"><li>Read, write and order numbers in base ten.</li><li>Perform the four operations on whole numbers.</li></ul></td>
                <td>Numbers</td><td>Base ten numeration</td>
                <td>In groups, learners model place value with charts and present examples from daily life.</td>
                <td>Group work, demonstration, Q&amp;A</td><td>Place-value chart, counters</td>
                <td>Oral questions, exercise</td><td>8</td>
              </tr>
              <tr>
                <td>February</td><td>3–4</td>
                <td>Apply fractions to solve real-life quantity problems.</td>
                <td><ul className="cell-list"><li>Simplify and compare fractions.</li><li>Operate on fractions.</li></ul></td>
                <td>Fractions</td><td>Operations on fractions</td>
                <td>Learners share objects to model fractions, then solve and discuss problems.</td>
                <td>Practical, discussion</td><td>Fraction board, charts</td>
                <td>Short test, observation</td><td>8</td>
              </tr>
              <tr>
                <td>February</td><td>5</td>
                <td>Use decimals and percentages in measurement and money.</td>
                <td><ul className="cell-list"><li>Convert between fractions, decimals and percentage.</li><li>Solve percentage problems.</li></ul></td>
                <td>Decimals &amp; Percentage</td><td>Conversions &amp; applications</td>
                <td>Real-life tasks using prices and measurements; learners present solutions.</td>
                <td>Activity-based, Q&amp;A</td><td>Price lists, calculators</td>
                <td>Exercise, portfolio</td><td>4</td>
              </tr>
              <tr>
                <td>March</td><td>6</td>
                <td colSpan={10}>Mid-term assessment &amp; remedial work</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      {/* ── SAMPLE 2 — IDDR LESSON PLAN ────────────────────────── */}
      <article className="sample-doc">
        <header className="doc-head">
          <span className="doc-kind">Lesson Plan · IDDR</span>
          <h3>Biology — Form II</h3>
          <p className="doc-sub">Topic: Movement of Materials In &amp; Out of the Cell · Sub-topic: Diffusion</p>
        </header>

        <dl className="lp-meta">
          <div><dt>Class</dt><dd>Form II</dd></div>
          <div><dt>Time</dt><dd>80 minutes</dd></div>
          <div><dt>Periods</dt><dd>1</dd></div>
          <div><dt>No. of Students</dt><dd>45</dd></div>
          <div className="lp-wide">
            <dt>Main Competence</dt>
            <dd>Relate the movement of materials in and out of the cell to life processes in organisms.</dd>
          </div>
          <div className="lp-wide">
            <dt>Specific Competence</dt>
            <dd>Investigate diffusion and relate it to processes such as gaseous exchange and absorption.</dd>
          </div>
          <div className="lp-wide">
            <dt>Teaching / Learning Resources</dt>
            <dd>A glass of water, potassium permanganate (or ink), chalkboard, textbook.</dd>
          </div>
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
              <tr>
                <td><strong>Introduction</strong><br /><span className="cell-muted">Utangulizi</span></td>
                <td>10 min</td>
                <td>Sprays perfume in a corner and asks what learners notice.</td>
                <td>Observe and explain that the smell spreads across the room.</td>
                <td>Oral questions on prior knowledge.</td>
              </tr>
              <tr>
                <td><strong>Competence Development</strong><br /><span className="cell-muted">Kuendeleza umahiri</span></td>
                <td>30 min</td>
                <td>Drops permanganate into water; guides groups to observe and define diffusion.</td>
                <td>Observe, record, define diffusion and discuss in groups.</td>
                <td>Observation of group work.</td>
              </tr>
              <tr>
                <td><strong>Design / Application</strong><br /><span className="cell-muted">Kubuni</span></td>
                <td>25 min</td>
                <td>Sets a task to relate diffusion to gaseous exchange and absorption in the gut.</td>
                <td>Apply the concept and present real-life examples.</td>
                <td>Assessment of the task against criteria.</td>
              </tr>
              <tr>
                <td><strong>Realisation</strong><br /><span className="cell-muted">Kutathmini</span></td>
                <td>15 min</td>
                <td>Summarises, gives feedback and a short exercise.</td>
                <td>Answer the exercise; self- and peer-assessment.</td>
                <td>Written exercise.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="lp-evaluation">
          <strong>Teacher&apos;s Self-Evaluation:</strong> ………………………………………………………………………………………
        </div>
      </article>

      {/* ── SAMPLE 3 — LESSON NOTES ───────────────────────────── */}
      <article className="sample-doc">
        <header className="doc-head">
          <span className="doc-kind">Lesson Notes</span>
          <h3>History — Form I</h3>
          <p className="doc-sub">Topic: Sources and Importance of History</p>
        </header>

        <div className="lesson-notes">
          <h4>1. The Meaning of History</h4>
          <p>
            History is the study of past events in human society, how they happened, why they
            happened, and their effects on the present and the future.
          </p>

          <h4>2. Sources of Historical Information</h4>
          <p>Historians gather information from several sources, which are grouped as follows:</p>
          <ul>
            <li><strong>Archaeology</strong> — the study of remains such as bones, tools and pottery dug from the ground.</li>
            <li><strong>Oral traditions</strong> — information passed by word of mouth, e.g. stories, songs and proverbs.</li>
            <li><strong>Written records</strong> — books, letters, diaries and documents kept in archives.</li>
            <li><strong>Museums and archives</strong> — places where historical objects and records are preserved.</li>
            <li><strong>Linguistics</strong> — the study of languages to trace the origin and migration of people.</li>
          </ul>

          <h4>3. Importance of Studying History</h4>
          <ul>
            <li>It helps us understand the origin and development of our society.</li>
            <li>It builds national identity, unity and patriotism.</li>
            <li>It enables us to learn from past mistakes and successes.</li>
            <li>It develops critical and analytical thinking skills.</li>
          </ul>

          <p className="notes-activity">
            <strong>Activity:</strong> In groups, visit an elder in your community and record one
            oral tradition about the founding of your village. Present your findings in class.
          </p>
        </div>
      </article>
    </section>
  );
}
