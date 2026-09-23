export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge">
        <div className="hero-badge-dot" />
        Now serving clients globally
      </div>
      <h1>
        Technology that works <strong>as hard as you do</strong>
      </h1>
      <p className="hero-sub">
        Dolese Tech builds software, cloud systems, and data infrastructure for
        organizations that need things done right.
      </p>
      <div className="hero-actions">
        <a href="#services" className="btn-filled">See our services</a>
        <a href="#about" className="btn-outline">How we work</a>
      </div>

      <div className="hero-stage">
        {/* Calm brand motif echoing the logo mark's arcs */}
        <svg className="hero-stage-art" viewBox="0 0 880 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="heroGlow" cx="50%" cy="42%" r="60%">
              <stop offset="0%" stopColor="#1B2435" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#1B2435" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="880" height="300" fill="url(#heroGlow)" />
          <g transform="translate(440 150)" fill="none">
            <circle r="48" stroke="#1B2435" strokeOpacity="0.14" />
            <circle r="92" stroke="#1B2435" strokeOpacity="0.10" />
            <circle r="136" stroke="#1B2435" strokeOpacity="0.07" />
            <path d="M -92 0 A 92 92 0 0 1 26 -88" stroke="#6FCF6A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 136 0 A 136 136 0 0 1 60 122" stroke="#4FA8F0" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" />
            <circle r="6" fill="#6FCF6A" stroke="none" />
            <circle cx="92" cy="0" r="5" fill="#4FA8F0" stroke="none" />
            <circle cx="-65" cy="-65" r="4" fill="#1B2435" fillOpacity="0.5" stroke="none" />
            <circle cx="48" cy="118" r="4" fill="#1B2435" fillOpacity="0.5" stroke="none" />
          </g>
        </svg>
      </div>
    </section>
  );
}
