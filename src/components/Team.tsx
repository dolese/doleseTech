const MEMBERS = [
  { name: "Marcus Dolese", role: "Founder & CEO", initials: "MD", wrapBg: "#E7ECF6", avatarBg: "var(--navy)" },
  { name: "Sofia Reyes", role: "Chief Technology Officer", initials: "SR", wrapBg: "#EAE8F4", avatarBg: "#6366F1" },
  { name: "James Kim", role: "Head of Engineering", initials: "JK", wrapBg: "#E8F2F5", avatarBg: "#0891B2" },
  { name: "Amara Li", role: "Director of Product", initials: "AL", wrapBg: "#E8F4EC", avatarBg: "#16A34A" },
];

export default function Team() {
  return (
    <section id="team">
      <div className="team-top">
        <div>
          <div className="tag">Team</div>
          <h2 className="section-title">
            <strong>People</strong> behind the work
          </h2>
        </div>
        <a href="/#cta" className="btn-outline">We&apos;re hiring →</a>
      </div>
      <div className="team-grid">
        {MEMBERS.map((m) => (
          <div className="team-card reveal" key={m.name}>
            <div className="team-avatar-wrap" style={{ background: m.wrapBg }}>
              <div className="t-avatar" style={{ background: m.avatarBg }}>{m.initials}</div>
            </div>
            <div className="team-info">
              <div className="t-name">{m.name}</div>
              <div className="t-role">{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
