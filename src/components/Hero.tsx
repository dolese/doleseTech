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

      <div className="hero-visual">
        <div className="hero-card">
          <div className="hcard-icon ic-orange">
            <svg viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="hcard-label">Uptime</div>
          <div className="hcard-value">99.98%</div>
          <div className="hcard-bar">
            <div className="hcard-bar-fill" style={{ width: "99%" }} />
          </div>
        </div>
        <div className="hero-card">
          <div className="hcard-icon ic-slate">
            <svg viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="hcard-label">Projects delivered</div>
          <div className="hcard-value">200+</div>
          <div className="hcard-sub">Across 18 industries</div>
        </div>
        <div className="hero-card">
          <div className="hcard-icon ic-green">
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="hcard-label">Client retention</div>
          <div className="hcard-value">98%</div>
          <div className="hcard-bar">
            <div className="hcard-bar-fill" style={{ width: "98%", background: "#3A8A52" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
