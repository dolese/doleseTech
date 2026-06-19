"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <a href="/" className="nav-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/dolese-logo.png" alt="Dolese Tech — Your Marketplace. Your World." className="nav-logo-img" />
      </a>
      <div className="nav-links">
        <a href="/#services">Services</a>
        <a href="/#about">About</a>
        <a href="/#process">Process</a>
        <a href="/#team">Team</a>
        <a href="/education">Education</a>
      </div>
      <div className="nav-right">
        <a href="#" className="nav-ghost">Log in</a>
        <a href="/#cta" className="nav-cta">Get started</a>
        <button
          type="button"
          className="nav-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`nav-overlay ${menuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />
      <aside
        id="mobile-nav-drawer"
        className={`nav-drawer ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav-drawer-head">
          <a href="/" className="nav-drawer-logo" onClick={closeMenu}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dolese-logo.png" alt="Dolese Tech" className="nav-logo-img" />
          </a>
          <button
            type="button"
            className="nav-drawer-close"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          >
            <span />
            <span />
          </button>
        </div>

        <div className="nav-drawer-links">
          <a href="/#services" onClick={closeMenu}>Services</a>
          <a href="/#about" onClick={closeMenu}>About</a>
          <a href="/#process" onClick={closeMenu}>Process</a>
          <a href="/#team" onClick={closeMenu}>Team</a>
          <a href="/education" onClick={closeMenu}>Education</a>
          <a href="#" onClick={closeMenu}>Log in</a>
        </div>

        <a href="/#cta" className="nav-drawer-cta" onClick={closeMenu}>
          Get started
        </a>
      </aside>
    </nav>
  );
}
