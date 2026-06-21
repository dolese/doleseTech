import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Cloud Infrastructure — Dolese Tech",
  description:
    "Build, deploy, secure and scale your cloud with Dolese Tech — deployment, DNS, databases, monitoring, backups, security and email infrastructure for businesses and schools in Tanzania.",
};

const OFFERS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Cloud Deployment",
    platforms: ["Railway", "Cloudflare", "Vercel", "DigitalOcean"],
    platformLabel: "Deploy on",
    items: ["School Management Systems", "E-commerce Platforms", "Business Websites", "SaaS Applications", "Internal Business Systems"],
    itemLabel: "Supported projects",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Domain & DNS Management",
    platforms: ["app.company.co.tz", "mail.company.co.tz", "docs.company.co.tz"],
    platformLabel: "Example subdomains",
    items: ["Domain Registration", "DNS Configuration", "Subdomain Setup", "SSL Certificates", "Email Routing", "SPF / DKIM / DMARC Configuration"],
    itemLabel: "Services",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    title: "Database Management",
    platforms: ["SQLite → PostgreSQL Migration", "Railway PostgreSQL Config", "Production Database Hardening"],
    platformLabel: "Examples",
    items: ["PostgreSQL & MySQL Setup", "Database Migration", "Database Optimization", "Automated Backups", "Performance Monitoring"],
    itemLabel: "Services",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Monitoring & Reliability",
    platforms: ["Sentry", "Better Stack", "UptimeRobot"],
    platformLabel: "Tools we use",
    items: ["Error Tracking", "Uptime Monitoring", "Performance Monitoring", "Alert Notifications", "Incident Response Procedures"],
    itemLabel: "Features",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Backup & Disaster Recovery",
    platforms: ["Reduced Downtime", "Data Protection", "Business Continuity", "Faster Recovery"],
    platformLabel: "Benefits",
    items: ["Daily Database Backups", "Cloudflare R2 Backups", "Automated Backup Scheduling", "Restore Testing", "Disaster Recovery Planning"],
    itemLabel: "Services",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Cloud Security",
    platforms: [],
    platformLabel: "",
    items: ["HTTPS Configuration", "Security Headers", "Firewall Rules", "Access Control", "Secret Management", "Secure Authentication", "Security Best Practices"],
    itemLabel: "Services",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: "Email Infrastructure",
    platforms: ["Resend", "Google Workspace", "SMTP"],
    platformLabel: "Platforms",
    items: ["Resend Configuration", "Google Workspace Setup", "Email Routing", "Transactional Email Systems", "SMTP Configuration", "Email Deliverability Optimization"],
    itemLabel: "Services",
  },
];

const TECH = [
  { name: "Cloudflare", color: "#F48120" },
  { name: "Railway", color: "#0B0D0E" },
  { name: "PostgreSQL", color: "#336791" },
  { name: "Cloudflare R2", color: "#F48120" },
  { name: "Docker", color: "#2496ED" },
  { name: "Next.js", color: "#000000" },
  { name: "GitHub Actions", color: "#2088FF" },
  { name: "Resend", color: "#000000" },
];

const WHY = [
  "Modern Cloud Infrastructure",
  "Security-First Approach",
  "Automated Backups",
  "Reliable Monitoring",
  "Cost-Effective Solutions",
  "Documentation Included",
  "Ongoing Technical Support",
];

const PACKAGES = [
  {
    name: "Starter",
    price: "TZS 300,000 – 700,000",
    desc: "Perfect for schools, freelancers, and small businesses getting their first deployment live.",
    items: ["Domain Setup", "SSL Configuration", "Cloud Deployment", "Email Setup"],
    highlight: false,
  },
  {
    name: "Business",
    price: "TZS 700,000 – 2,000,000",
    desc: "Full-stack cloud environment for growing businesses that need reliability and monitoring.",
    items: ["Application Deployment", "Database Setup", "Monitoring", "Backups", "Security Configuration"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "TZS 2,000,000+",
    desc: "Complete cloud migration with CI/CD, multi-environment support, and advanced security.",
    items: ["Full Cloud Migration", "Multi-Environment Setup", "CI/CD Pipelines", "Monitoring & Alerting", "Backup & Disaster Recovery", "Advanced Security Configuration"],
    highlight: false,
  },
];

export default function CloudInfrastructurePage() {
  return (
    <>
      <Nav />
      <main>
        <section className="ci-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <a href="/#services">Services</a>
            <span>/</span>
            <span aria-current="page">Cloud Infrastructure</span>
          </nav>
          <div className="tag">Cloud Infrastructure Services</div>
          <h1>
            Build, deploy, secure, and scale <strong>with confidence</strong>
          </h1>
          <p className="ci-hero-sub">
            From first deployment to full cloud migration, Dolese Tech helps businesses, schools,
            startups, and organizations build secure, scalable, and cost-effective cloud
            environments.
          </p>
          <div className="hero-actions">
            <a href="/#cta" className="btn-filled">Request Consultation</a>
            <a href="/#services" className="btn-outline">View Services</a>
          </div>

          <div className="ci-hero-stats">
            <div><strong>7+</strong><span>Service areas</span></div>
            <div className="hsb-divider" />
            <div><strong>100%</strong><span>Documented</span></div>
            <div className="hsb-divider" />
            <div><strong>24/7</strong><span>Monitoring ready</span></div>
          </div>
        </section>

        <section className="ci-offers">
          <div className="ci-section-head">
            <div className="tag">What We Offer</div>
            <h2 className="section-title">
              Everything your cloud <strong>needs to run right</strong>
            </h2>
            <p className="section-sub">
              End-to-end coverage from deployment to disaster recovery — handled by one team.
            </p>
          </div>
          <div className="ci-offers-grid">
            {OFFERS.map((o) => (
              <div className="ci-offer-card reveal" key={o.title}>
                <div className="ci-offer-icon">{o.icon}</div>
                <h3>{o.title}</h3>
                {o.platforms.length > 0 && (
                  <div className="ci-offer-platforms">
                    <span className="ci-offer-sub-label">{o.platformLabel}</span>
                    <div className="ci-offer-tags">
                      {o.platforms.map((p) => (
                        <span className="ci-tag" key={p}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                <span className="ci-offer-sub-label">{o.itemLabel}</span>
                <ul className="ci-offer-list">
                  {o.items.map((item) => (
                    <li key={item}>
                      <span className="subj-dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="ci-tech">
          <div className="ci-section-head">
            <div className="tag">Technology Stack</div>
            <h2 className="section-title">
              Tools we <strong>build with</strong>
            </h2>
          </div>
          <div className="ci-tech-grid">
            {TECH.map((t) => (
              <div className="ci-tech-badge reveal" key={t.name}>
                <span className="ci-tech-dot" style={{ background: t.color }} />
                {t.name}
              </div>
            ))}
          </div>
        </section>

        <section className="ci-why">
          <div className="ci-why-inner">
            <div className="ci-why-copy reveal">
              <div className="tag">Why Dolese Tech</div>
              <h2 className="section-title">
                Infrastructure handled <strong>properly</strong>
              </h2>
              <p className="section-sub">
                We follow a security-first, documentation-first approach — so your infrastructure
                is understandable, maintainable, and recoverable.
              </p>
              <a href="/#cta" className="btn-filled" style={{ marginTop: "28px", display: "inline-flex" }}>
                Talk to us
              </a>
            </div>
            <ul className="ci-why-list reveal">
              {WHY.map((w) => (
                <li key={w}>
                  <span className="ci-why-check" aria-hidden="true">✓</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ci-pricing">
          <div className="ci-section-head">
            <div className="tag">Service Packages</div>
            <h2 className="section-title">
              Transparent <strong>pricing</strong>
            </h2>
            <p className="section-sub">
              Fixed-scope packages for common needs. Custom scopes are always available — get in touch.
            </p>
          </div>
          <div className="ci-pkg-grid">
            {PACKAGES.map((pkg) => (
              <div className={`ci-pkg-card reveal ${pkg.highlight ? "ci-pkg-highlight" : ""}`} key={pkg.name}>
                {pkg.highlight && <div className="ci-pkg-badge">Most popular</div>}
                <div className="ci-pkg-name">{pkg.name}</div>
                <div className="ci-pkg-price">{pkg.price}</div>
                <p className="ci-pkg-desc">{pkg.desc}</p>
                <ul className="ci-pkg-list">
                  {pkg.items.map((item) => (
                    <li key={item}>
                      <span className="ci-why-check" aria-hidden="true">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/#cta" className={pkg.highlight ? "btn-filled" : "btn-outline"} style={{ marginTop: "auto", textAlign: "center" }}>
                  Get started
                </a>
              </div>
            ))}
          </div>
          <p className="ci-pricing-note">
            All prices in Tanzanian Shillings. Final scope and price agreed before work begins.
            No surprises.
          </p>
        </section>

        <section className="svc-cta">
          <h2>Ready to modernize your infrastructure?</h2>
          <p>
            Let Dolese Tech design, deploy, secure, and manage your cloud environment so you can
            focus on growing your business.
          </p>
          <div className="hero-actions">
            <a href="/#cta" className="btn-filled">Contact Dolese Tech</a>
            <a href="/about" className="btn-outline">Learn about us</a>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
