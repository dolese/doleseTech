const COMPANIES = [
  "VeritasGroup", "NovaBridge", "Pinnacle Holdings", "Arclight Capital",
  "Stratum Labs", "MeriCore Inc", "Orbital Systems", "Cascade Health",
];

export default function Logos() {
  // Duplicate the list so the marquee loops seamlessly.
  const track = [...COMPANIES, ...COMPANIES];
  return (
    <div className="logos-bar">
      <span className="logos-label">Trusted by</span>
      <div className="logos-track">
        {track.map((name, i) => (
          <span key={i}>{name}</span>
        ))}
      </div>
    </div>
  );
}
