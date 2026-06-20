import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Dolese Tech",
  description: "The terms that govern your use of the Dolese Tech website and materials.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Use of our services",
    points: [
      "You may use our website and teaching materials for lawful educational and professional purposes.",
      "You agree not to misuse the website, disrupt its operation, or attempt to gain unauthorised access to our systems.",
    ],
  },
  {
    heading: "Educational materials",
    paragraphs: [
      "Our schemes of work, lesson plans and lesson notes are provided as adaptable templates aligned to the Tanzania (TIE) curriculum. You are responsible for reviewing and adapting each material to your specific class, current syllabus version and school requirements.",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      "The website, its design and original content are owned by Dolese Tech. You may download and adapt the teaching materials for your own teaching; you may not resell or redistribute them as your own product.",
    ],
  },
  {
    heading: "Disclaimers",
    paragraphs: [
      'Our services and materials are provided "as is" without warranties of any kind. While we aim for accuracy and alignment with the curriculum, we do not guarantee that every material is error-free or fully up to date.',
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the extent permitted by law, Dolese Tech is not liable for any indirect or consequential loss arising from the use of our website or materials.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. Continued use of the website after changes take effect means you accept the updated terms.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: ["These terms are governed by the laws of the United Republic of Tanzania."],
  },
  {
    heading: "Contact us",
    paragraphs: ["Questions about these terms? Email support@dolese.tech."],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 2026"
      intro="These Terms of Service govern your use of the Dolese Tech website and the materials and services we provide. By using our website, you agree to these terms."
      sections={SECTIONS}
    />
  );
}
