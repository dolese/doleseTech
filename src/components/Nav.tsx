export default function Nav() {
  return (
    <nav>
      <a href="#" className="nav-logo">
        <div className="nav-logo-mark" />
        <span className="nav-logo-text">Dolese Tech</span>
      </a>
      <div className="nav-links">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#process">Process</a>
        <a href="#team">Team</a>
      </div>
      <div className="nav-right">
        <a href="#" className="nav-ghost">Log in</a>
        <a href="#cta" className="nav-cta">Get started</a>
      </div>
    </nav>
  );
}
