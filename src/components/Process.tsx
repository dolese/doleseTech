const STEPS = [
  {
    num: "01",
    title: "Discovery",
    desc: "We start with a deep dive into your business: the problems you're solving, constraints you're working within, and what success actually looks like for your team.",
    tag: "Week 1–2",
  },
  {
    num: "02",
    title: "Architecture",
    desc: "Before writing code, we design a technical blueprint. This surfaces risks early, aligns stakeholders, and sets a clear quality bar for everything ahead.",
    tag: "Week 2–4",
  },
  {
    num: "03",
    title: "Build & iterate",
    desc: "We work in two-week sprints with continuous delivery. You see progress early, give feedback often, and always know what's shipping next.",
    tag: "Ongoing",
  },
  {
    num: "04",
    title: "Launch & sustain",
    desc: "Delivery doesn't mean departure. We support post-launch operations, monitor health, and help your team grow into what we've built together.",
    tag: "Post-launch",
  },
];

export default function Process() {
  return (
    <section id="process">
      <div className="process-intro">
        <div className="tag">Process</div>
        <h2 className="section-title">
          How we go from
          <br />
          <strong>idea to production</strong>
        </h2>
        <p className="section-sub">
          A predictable process isn&apos;t boring — it&apos;s how you ship on
          time, every time.
        </p>
      </div>
      <div className="process-list">
        {STEPS.map((step) => (
          <div className="process-row reveal" key={step.num}>
            <div className="process-num">{step.num}</div>
            <div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
            <span className="process-tag">{step.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
