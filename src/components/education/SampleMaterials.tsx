/**
 * Fully-written sample materials so the library isn't just placeholders.
 * Content follows the standard Tanzanian (TIE) document formats.
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
          Three complete documents in the standard Tanzanian format — adapt the structure to any
          subject, form, or term.
        </p>
      </div>

      {/* ── SAMPLE 1 — SCHEME OF WORK ─────────────────────────── */}
      <article className="sample-doc">
        <header className="doc-head">
          <span className="doc-kind">Scheme of Work</span>
          <h3>Basic Mathematics — Form I, Term I</h3>
          <p className="doc-sub">Mwaka wa Masomo · 40-minute periods · 8 periods per week</p>
        </header>
        <div className="table-scroll">
          <table className="sow-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Topic</th>
                <th>Sub-topic</th>
                <th>Specific Objectives</th>
                <th>Teaching &amp; Learning Activities</th>
                <th>Resources</th>
                <th>Assessment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Numbers (Base Ten)</td>
                <td>Base ten numeration</td>
                <td>Read and write numbers in base ten; identify place values.</td>
                <td>Guided discussion; place-value charts; group exercises.</td>
                <td>Place-value chart, counters</td>
                <td>Oral questions, exercise</td>
              </tr>
              <tr>
                <td>2–3</td>
                <td>Numbers</td>
                <td>Operations on whole numbers</td>
                <td>Add, subtract, multiply and divide whole numbers.</td>
                <td>Worked examples; pair drills; number-line work.</td>
                <td>Number line, textbooks</td>
                <td>Class exercise</td>
              </tr>
              <tr>
                <td>4–5</td>
                <td>Fractions</td>
                <td>Operations on fractions</td>
                <td>Simplify and perform operations on fractions.</td>
                <td>Fraction charts; practical sharing activities.</td>
                <td>Fraction board, charts</td>
                <td>Short test</td>
              </tr>
              <tr>
                <td>6</td>
                <td>Decimals</td>
                <td>Conversion &amp; operations</td>
                <td>Convert between fractions and decimals; operate on decimals.</td>
                <td>Demonstration; individual practice.</td>
                <td>Calculators, charts</td>
                <td>Homework</td>
              </tr>
              <tr>
                <td>7</td>
                <td>Percentage</td>
                <td>Percentage of a quantity</td>
                <td>Express quantities as percentages and solve problems.</td>
                <td>Real-life examples (markets, prices); group tasks.</td>
                <td>Price lists, charts</td>
                <td>Exercise &amp; quiz</td>
              </tr>
              <tr>
                <td>8</td>
                <td colSpan={6}>Mid-term assessment &amp; revision</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      {/* ── SAMPLE 2 — LESSON PLAN ────────────────────────────── */}
      <article className="sample-doc">
        <header className="doc-head">
          <span className="doc-kind">Lesson Plan</span>
          <h3>Biology — Form II</h3>
          <p className="doc-sub">Topic: Movement of Materials In and Out of the Cell · Sub-topic: Diffusion</p>
        </header>

        <dl className="lp-meta">
          <div><dt>Class</dt><dd>Form II</dd></div>
          <div><dt>Period / Time</dt><dd>Single · 40 minutes</dd></div>
          <div><dt>No. of Students</dt><dd>45</dd></div>
          <div><dt>Date</dt><dd>……………………</dd></div>
          <div className="lp-wide">
            <dt>Competence</dt>
            <dd>The student should be able to relate diffusion to processes that occur in living organisms.</dd>
          </div>
          <div className="lp-wide">
            <dt>Specific Objectives</dt>
            <dd>By the end of the lesson, the student should be able to: (a) define diffusion; (b) mention examples of diffusion in daily life; (c) demonstrate diffusion using a simple experiment.</dd>
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
                <th>Stage</th>
                <th>Time</th>
                <th>Teacher’s Activities</th>
                <th>Student’s Activities</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Introduction</td>
                <td>5 min</td>
                <td>Asks what happens when perfume is sprayed in a corner of the room.</td>
                <td>Respond from experience; the smell spreads across the room.</td>
              </tr>
              <tr>
                <td>New Knowledge</td>
                <td>20 min</td>
                <td>Defines diffusion; drops permanganate into water and guides observation.</td>
                <td>Observe the colour spreading; take notes; ask questions.</td>
              </tr>
              <tr>
                <td>Reinforcement</td>
                <td>10 min</td>
                <td>Guides students to list examples of diffusion in living things.</td>
                <td>Give examples: gaseous exchange, absorption in the small intestine.</td>
              </tr>
              <tr>
                <td>Conclusion</td>
                <td>5 min</td>
                <td>Summarises key points; gives a short exercise.</td>
                <td>Answer questions; copy the summary and assignment.</td>
              </tr>
            </tbody>
          </table>
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
