"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <a href="#" className="nav-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/dolese-logo.png" alt="Dolese Tech — Your Marketplace. Your World." className="nav-logo-img" />
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
