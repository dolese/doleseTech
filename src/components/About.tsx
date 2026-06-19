const PILLARS = [
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
  { num: "200+", label: "Projects delivered" },
  { num: "18", label: "Industries served" },
  { num: "98%", label: "Client retention" },
  { num: "42", label: "Engineers on staff" },
];

export default function About() {
  return (
    <section id="about">
      <div className="about-copy">
        <div className="tag">About</div>
        <h2 className="section-title">
          Built by engineers,
          <br />
          <strong>for people who ship</strong>
        </h2>
        <p className="section-sub">
          Founded in 2013, Dolese Tech started as a small team with high
          standards. Those standards haven&apos;t changed — just the scale at
          which we apply them.
        </p>

        <div className="about-pillars">
          {PILLARS.map((p) => (
            <div className="pillar reveal" key={p.title}>
              <div className="pillar-dot" />
              <div>
                <div className="pillar-title">{p.title}</div>
                <div className="pillar-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="about-panel">
          <div className="about-panel-header">
            <p>Years in the industry</p>
            <h3>12 years building.</h3>
          </div>
          <div className="about-stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="astat-num">{s.num}</div>
                <div className="astat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="about-panel-footer">
            <div className="apf-dot" />
            <p>All systems operational · Last updated today</p>
          </div>
        </div>
      </div>
    </section>
  );
}
