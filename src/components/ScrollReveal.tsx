"use client";

import { useEffect } from "react";

/**
 * Reveals `.reveal` elements as they scroll into view (adds `.is-visible`).
 *
 * Robustness matters here: elements start at opacity:0, so anything that is
 * never revealed shows up as a *blank gap*. Anchor-link navigation jumps past
 * whole sections, and an IntersectionObserver alone can miss elements that go
 * straight from below-viewport to above-viewport. So we pair the observer
 * (for nice staggered entrances) with a scroll "sweep" that guarantees any
 * element at or above the viewport is revealed — nothing can stay hidden.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const reveal = (el: HTMLElement) => el.classList.add("is-visible");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          // Reveal on entry, or if it has already passed above the viewport.
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            reveal(el);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));

    // Safety net: reveal anything at/above the viewport on load and on scroll,
    // so jumped-over sections can never stay blank.
    const sweep = () => {
      let remaining = false;
      for (const el of els) {
        if (el.classList.contains("is-visible")) continue;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          reveal(el);
          io.unobserve(el);
        } else {
          remaining = true;
        }
      }
      if (!remaining) window.removeEventListener("scroll", sweep);
    };
    sweep();
    window.addEventListener("scroll", sweep, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", sweep);
    };
  }, []);

  return null;
}
