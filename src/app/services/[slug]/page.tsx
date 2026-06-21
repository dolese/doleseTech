import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { SERVICES, getServiceBySlug } from "@/lib/services";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  // cloud-infrastructure has its own dedicated, richer page.
  return SERVICES.filter((s) => s.slug !== "cloud-infrastructure").map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const service = getServiceBySlug(params.slug);
  if (!service) return { title: "Service not found — Dolese Tech" };
  return {
    title: `${service.title} — Dolese Tech`,
    description: service.tagline,
  };
}

export default function ServicePage({ params }: Params) {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  return (
    <>
      <Nav />
      <main>
        <section className="svc-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <a href="/#services">Services</a>
            <span>/</span>
            <span aria-current="page">{service.title}</span>
          </nav>
          <div className="svc-hero-icon">{service.icon}</div>
          <h1>{service.title}</h1>
          <p className="svc-hero-tagline">{service.tagline}</p>
        </section>

        <section className="svc-detail-body">
          <p className="svc-overview">{service.overview}</p>

          <div className="svc-cols">
            <div className="reveal">
              <h2 className="detail-h2">What&apos;s included</h2>
              <ul className="svc-list">
                {service.includes.map((item) => (
                  <li key={item}>
                    <span className="svc-check" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal">
              <h2 className="detail-h2">What you get</h2>
              <ul className="svc-list">
                {service.deliverables.map((item) => (
                  <li key={item}>
                    <span className="svc-check" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              {service.stack && (
                <>
                  <h3 className="svc-stack-h">Typical stack</h3>
                  <div className="svc-stack">
                    {service.stack.map((t) => (
                      <span className="svc-chip" key={t}>{t}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="svc-cta">
          <h2>Have a project in mind?</h2>
          <p>Tell us what you&apos;re working on — even a rough idea is a good place to start.</p>
          <div className="hero-actions">
            <a href="/#cta" className="btn-filled">Get in touch</a>
            <a href="/#services" className="btn-outline">See all services</a>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
