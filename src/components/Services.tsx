import { SERVICES } from "@/lib/services";

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
          <a className="svc-card reveal" key={svc.slug} href={`/services/${svc.slug}`}>
            <div className="svc-icon">{svc.icon}</div>
            <h3>{svc.title}</h3>
            <p>{svc.desc}</p>
            <span className="svc-link">Learn more →</span>
          </a>
        ))}
      </div>
    </section>
  );
}
