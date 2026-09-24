// Products Dolese Tech builds and runs itself, as opposed to client services.

const RESULTS_URL = "https://results.dolese.tech";
const SOKOPLUS_URL = "https://sokoplus.co.tz";

const RESULTS_FEATURES = [
  "NECTA grading, points and Division I–0, worked out automatically",
  "Student import from Excel or CSV, with candidate numbers assigned",
  "Print-ready report cards and class result sheets",
  "Live analytics: pass rates, subject performance, top students",
  "One secure portal for many schools, each school's data kept separate",
];

// Sample divisions for the preview panel: illustrative, not live data.
const SAMPLE_DIVISIONS = [
  { label: "I", count: 18, color: "var(--green-brand)" },
  { label: "II", count: 31, color: "var(--blue)" },
  { label: "III", count: 24, color: "#8FC6F4" },
  { label: "IV", count: 12, color: "#C9D3DF" },
  { label: "0", count: 3, color: "#E4E9EF" },
];

export default function Products() {
  const top = Math.max(...SAMPLE_DIVISIONS.map((d) => d.count));
  return (
    <section id="products">
      <div className="services-top">
        <div>
          <div className="tag">Products</div>
          <h2 className="section-title">
            Built and run
            <br />
            <strong>by Dolese Tech</strong>
          </h2>
        </div>
        <p className="section-sub">
          Alongside client work, we build our own products and run them for the
          people who use them every day.
        </p>
      </div>

      <article className="product-feature reveal">
        <div className="product-feature-copy">
          <div className="product-kicker">School results management</div>
          <h3 className="product-name">ResultsPortal</h3>
          <p className="product-lead">
            Schools enter marks once. ResultsPortal handles the grading,
            divisions, report cards and result sheets, the way Tanzanian
            secondary schools already work.
          </p>
          <ul className="product-list">
            {RESULTS_FEATURES.map((f) => (
              <li key={f}>
                <span className="svc-check" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className="product-actions">
            <a href={RESULTS_URL} className="btn-filled" target="_blank" rel="noopener">
              Visit ResultsPortal →
            </a>
            <a href="/products/resultsportal" className="btn-outline">What it does →</a>
          </div>
        </div>

        <div className="product-preview" aria-hidden="true">
          <div className="pp-head">
            <span className="pp-dot" /><span className="pp-dot" /><span className="pp-dot" />
            <span className="pp-url">results.dolese.tech</span>
          </div>
          <div className="pp-body">
            <div className="pp-title">Form IV · Terminal exam</div>
            <div className="pp-sub">Division summary (sample)</div>
            <div className="pp-bars">
              {SAMPLE_DIVISIONS.map((d) => (
                <div className="pp-bar" key={d.label}>
                  <span className="pp-bar-n">{d.count}</span>
                  <div className="pp-bar-track">
                    <div className="pp-bar-fill" style={{ height: `${(d.count / top) * 100}%`, background: d.color }} />
                  </div>
                  <span className="pp-bar-l">Div {d.label}</span>
                </div>
              ))}
            </div>
            <div className="pp-stats">
              <div><strong>96.6%</strong><span>Pass rate</span></div>
              <div><strong>88</strong><span>Candidates</span></div>
              <div><strong>B</strong><span>Mean grade</span></div>
            </div>
          </div>
        </div>
      </article>

      <div className="product-row">
        <a className="product-card reveal" href={SOKOPLUS_URL} target="_blank" rel="noopener">
          <div className="product-kicker">Marketplace</div>
          <h3>SokoPlus</h3>
          <p>Shop physical and digital products from trusted sellers.</p>
          <span className="svc-link">Visit sokoplus.co.tz →</span>
        </a>
        <a className="product-card reveal" href="/exams">
          <div className="product-kicker">For teachers</div>
          <h3>Exams Composer</h3>
          <p>Generate NECTA-style exam papers and download them as Word documents.</p>
          <span className="svc-link">Open Exams Composer →</span>
        </a>
      </div>
    </section>
  );
}
