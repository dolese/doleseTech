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
    desc: "We measure success by your outcomes, not ours. We stay with a system after launch, not just until handover.",
  },
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
          Dolese Tech is a small team with high standards, building software
          for organizations that need things done right — and teaching
          materials for Tanzania&apos;s classrooms.
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

    </section>
  );
}
