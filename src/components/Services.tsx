import type { ReactNode } from "react";

interface Service {
  title: string;
  desc: string;
  icon: ReactNode;
}

const SERVICES: Service[] = [
  {
    title: "Custom Software",
    desc: "Web apps, APIs, and enterprise platforms — built to your exact requirements with clean, maintainable code.",
    icon: (
      <svg viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Cloud Infrastructure",
    desc: "Architecture, migration, and optimization across AWS, GCP, and Azure — secure and cost-efficient from day one.",
    icon: (
      <svg viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    title: "Cybersecurity",
    desc: "Penetration testing, threat modeling, and security architecture that protects your systems before problems arise.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Data & Analytics",
    desc: "Pipelines, dashboards, and machine learning systems that turn your data into decisions you can act on.",
    icon: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "AI & Automation",
    desc: "Intelligent workflows and ML-powered systems that save your team time and surface insights automatically.",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
  {
    title: "IT Consulting",
    desc: "Technology strategy, vendor selection, and roadmapping for teams navigating growth or transformation.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section id="services">
      <div className="services-top">
        <div>
          <div className="tag">Services</div>
          <h2 className="section-title">
            Everything you need,
            <br />
            <strong>nothing you don&apos;t</strong>
          </h2>
        </div>
        <p className="section-sub">
          We cover the full technology stack — so you can work with one team you
          trust instead of managing five vendors.
        </p>
      </div>
      <div className="services-grid">
        {SERVICES.map((svc) => (
          <div className="svc-card reveal" key={svc.title}>
            <div className="svc-icon">{svc.icon}</div>
            <h3>{svc.title}</h3>
            <p>{svc.desc}</p>
            <a href="#cta" className="svc-link">Learn more →</a>
          </div>
        ))}
      </div>
    </section>
  );
}
