import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Dolese Tech",
  description: "How Dolese Tech collects, uses and protects your information.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Information we collect",
    points: [
      "Information you give us — for example your name, email address, company and message when you use our contact form.",
      "Information collected automatically — basic technical data such as your IP address, browser type and pages visited, used to keep the service secure and reliable.",
    ],
  },
  {
    heading: "How we use your information",
    points: [
      "To respond to your enquiries and provide the services you request.",
      "To operate, maintain and improve our website and teaching materials.",
      "To keep our services secure and prevent abuse.",
    ],
  },
  {
    heading: "Sharing your information",
    paragraphs: [
      "We do not sell your personal information. We only share it with service providers who help us run the website (for example email delivery), and where we are required to do so by law.",
    ],
  },
  {
    heading: "Data retention",
    paragraphs: [
      "We keep contact submissions only as long as necessary to respond to and follow up on your enquiry, after which they are deleted.",
    ],
  },
  {
    heading: "Your rights",
    points: [
      "Request a copy of the information we hold about you.",
      "Ask us to correct or delete your information.",
      "Object to certain uses of your information.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "Our website uses only the cookies necessary for it to function. We do not use advertising or third-party tracking cookies.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: ["For any privacy question or request, email us at support@dolese.tech."],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      intro='Dolese Tech ("we", "us") respects your privacy. This policy explains what information we collect when you use our website and services, how we use it, and the choices you have.'
      sections={SECTIONS}
    />
  );
}
