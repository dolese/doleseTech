export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <a href="#" className="nav-logo">
            <div className="nav-logo-mark" />
            <span className="nav-logo-text" style={{ color: "rgba(255,255,255,.75)" }}>
              Dolese Tech
            </span>
          </a>
          <p className="footer-brand-desc">
            Building reliable, scalable technology for organizations that
            can&apos;t afford to get it wrong.
          </p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <a href="#services">Software Dev</a>
          <a href="#services">Cloud &amp; Infra</a>
          <a href="#services">Cybersecurity</a>
          <a href="#services">Data &amp; Analytics</a>
          <a href="#services">AI &amp; Automation</a>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#about">About</a>
          <a href="#team">Team</a>
          <a href="#cta">Careers</a>
          <a href="#">Case Studies</a>
          <a href="#">Blog</a>
        </div>
        <div className="footer-col">
          <h4>Connect</h4>
          <a href="mailto:hello@dolese.tech">hello@dolese.tech</a>
          <a href="#">LinkedIn</a>
          <a href="#">GitHub</a>
          <a href="#">Twitter</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Dolese Tech. All rights reserved.</p>
        <div className="f-nav">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
        </div>
      </div>
    </footer>
  );
}
