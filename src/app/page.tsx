import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Logos from "@/components/Logos";
import Services from "@/components/Services";
import About from "@/components/About";
import Process from "@/components/Process";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Logos />
        <Services />
        <About />
        <Process />
        <Team />
        <CTA />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
