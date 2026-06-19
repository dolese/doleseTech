export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <a href="/" className="footer-wordmark">
            <span className="fw-navy">DOLESE</span>
            <span className="fw-green">TECH</span>
          </a>
          <p className="footer-tagline">Your Marketplace. Your World.</p>
          <p className="footer-cats">Goods · Services · Technology</p>
          <p className="footer-brand-desc">
            Building reliable, scalable technology for organizations that
            can&apos;t afford to get it wrong.
          </p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <a href="/#services">Software Dev</a>
          <a href="/#services">Cloud &amp; Infra</a>
          <a href="/#services">Cybersecurity</a>
          <a href="/#services">Data &amp; Analytics</a>
          <a href="/#services">AI &amp; Automation</a>
          <a href="https://sokoplus.co.tz">MarketPlace</a>
        </div>
        <div className="footer-col">
          <h4>Education</h4>
          <a href="/education">Browse subjects</a>
          <a href="/education#samples">Schemes of Work</a>
          <a href="/education#samples">Lesson Plans</a>
          <a href="/education#samples">Lesson Notes</a>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="/#about">About</a>
          <a href="/#team">Team</a>
          <a href="/#cta">Careers</a>
        </div>
        <div className="footer-col">
          <h4>Connect</h4>
          <a href="mailto:support@dolese.tech">support@dolese.tech</a>
          <a href="tel:+255710611384">+255710611384</a>
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
