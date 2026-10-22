import BrandLogo from "./BrandLogo";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-col footer-brand">
          <a href="/" className="footer-wordmark">
            <BrandLogo tone="dark" markSize={40} />
          </a>
          <p className="footer-tagline">Your Marketplace. Your World.</p>
          <p className="footer-cats">Goods · Services · Technology</p>
          <p className="footer-brand-desc">
            Building reliable, scalable technology for organizations that
            can&apos;t afford to get it wrong.
          </p>
          <a href="mailto:support@dolese.tech" className="footer-mail">support@dolese.tech</a>
          <SocialLinks />
        </div>
        <div className="footer-col">
          <h4>Products</h4>
          <a href="/exams">Exams Composer</a>
          <a href="/products/resultsportal">ResultsPortal</a>
          <a href="https://sokoplus.co.tz">SokoPlus Marketplace</a>
          <a href="/#services">Services</a>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <a href="/education">Teaching materials</a>
          <a href="/handbook">IT Handbook</a>
          <a href="/programming">Programming</a>
          <a href="/chat">AI Chat</a>
          <a href="/faq">FAQs</a>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="/about">About us</a>
          <a href="/about#team">Team</a>
          <a href="/#cta">Contact us</a>
          <a href="/#cta">Careers</a>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <a href="/privacy">Privacy policy</a>
          <a href="/terms">Terms of service</a>
          <a href="/security">Security</a>
        </div>
      </div>
      <p className="footer-note">
        Dolese Tech is an independent technology company in Tanzania. It is not part of NECTA or TIE. Exam papers
        from the Exams Composer are written and checked by AI; read every paper before you use it.
      </p>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Dolese Tech. All rights reserved.</p>
      </div>
    </footer>
  );
}
