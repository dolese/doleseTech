import ContactForm from "./ContactForm";

export default function CTA() {
  return (
    <section id="cta">
      <div className="tag">Get started</div>
      <h2 className="section-title">
        Ready to build something
        <br />
        <strong>that lasts?</strong>
      </h2>
      <p className="cta-sub">
        Tell us what you&apos;re working on. Even a rough idea is a good place to
        start.
      </p>

      <ContactForm />

      <p className="contact-alt">
        Prefer email or a call? <a href="mailto:support@dolese.tech">support@dolese.tech</a>
        {" · "}
        <a href="tel:+255710611384">+255710611384</a>
      </p>
    </section>
  );
}
