import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Security — Dolese Tech",
  description: "How Dolese Tech protects its services and how to report a security concern.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Our approach",
    points: [
      "We follow secure development practices and keep our software and dependencies up to date.",
      "Access to systems and data is limited to those who need it.",
      "We monitor our services for errors and suspicious activity.",
    ],
  },
  {
    heading: "Protecting your data",
    paragraphs: [
      "Information submitted through our website is transmitted over encrypted connections (HTTPS) and stored with access controls. We collect only the data we need to provide our services.",
    ],
  },
  {
    heading: "Reporting a vulnerability",
    paragraphs: [
      "If you believe you have found a security vulnerability in our website, please email support@dolese.tech with the details. We appreciate responsible disclosure and will respond promptly.",
    ],
  },
  {
    heading: "Responsible disclosure",
    points: [
      "Give us reasonable time to investigate and fix the issue before making it public.",
      "Do not access or modify data that is not yours, and avoid actions that could harm users or degrade the service.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: ["Reach our team at support@dolese.tech."],
  },
];

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      updated="June 2026"
      intro="We take the security of our website and the information entrusted to us seriously. This page explains our approach and how to report a concern."
      sections={SECTIONS}
    />
  );
}
