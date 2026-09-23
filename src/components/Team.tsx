/* The people behind Dolese Tech. `photo` is a path under public/; without one
   the card falls back to initials on a brand-navy tile. */
const MEMBERS = [
  {
    name: "Selu Doto Isenge",
    role: "Founder & CEO",
    initials: "SI",
    photo: "",
    wrapBg: "#E7ECF6",
    avatarBg: "var(--navy)",
  },
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
      </div>
      <div className={`team-grid${MEMBERS.length === 1 ? " is-single" : ""}`}>
        {MEMBERS.map((m) => (
          <div className="team-card reveal" key={m.name}>
            <div className="team-avatar-wrap" style={{ background: m.wrapBg }}>
              {m.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo} alt={m.name} className="t-photo" />
              ) : (
                <div className="t-avatar" style={{ background: m.avatarBg }}>{m.initials}</div>
              )}
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
