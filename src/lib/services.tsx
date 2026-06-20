import type { ReactNode } from "react";

export interface Service {
  slug: string;
  title: string;
  desc: string; // short, for the card
  tagline: string; // detail hero sub-line
  overview: string;
  includes: string[];
  deliverables: string[];
  stack?: string[];
  icon: ReactNode;
}

export const SERVICES: Service[] = [
  {
    slug: "custom-software",
    title: "Custom Software",
    desc: "Web apps, APIs, and enterprise platforms — built to your exact requirements with clean, maintainable code.",
    tagline: "Software built around your business, not the other way round.",
    overview:
      "We design and build web and mobile applications, APIs and internal platforms tailored to your exact requirements. Our focus is clean, well-tested, maintainable code that your team can grow with for years.",
    includes: [
      "Web and mobile applications",
      "REST and GraphQL APIs",
      "Enterprise platforms and internal tools",
      "System integrations and data migrations",
      "Ongoing maintenance and support",
    ],
    deliverables: [
      "Clean, documented and maintainable code",
      "Automated tests and CI/CD pipelines",
      "Deployment, monitoring and handover",
    ],
    stack: ["TypeScript", "React / Next.js", "Node.js", "PostgreSQL"],
    icon: (
      <svg viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    slug: "cloud-infrastructure",
    title: "Cloud Infrastructure",
    desc: "Architecture, migration, and optimization across AWS, GCP, and Azure — secure and cost-efficient from day one.",
    tagline: "Secure, scalable and cost-efficient cloud from day one.",
    overview:
      "We architect, migrate and optimize cloud environments across AWS, GCP and Azure. From a first deployment to a full migration, we build infrastructure that is reliable, secure and easy to operate.",
    includes: [
      "Cloud architecture and design",
      "Migration to the cloud",
      "Cost optimization and right-sizing",
      "Infrastructure as Code",
      "Monitoring, backups and reliability",
    ],
    deliverables: [
      "Documented, reproducible infrastructure",
      "Reduced and predictable cloud spend",
      "Monitoring and on-call runbooks",
    ],
    stack: ["AWS", "GCP", "Azure", "Terraform", "Docker", "Kubernetes"],
    icon: (
      <svg viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    desc: "Penetration testing, threat modeling, and security architecture that protects your systems before problems arise.",
    tagline: "Find and fix weaknesses before attackers do.",
    overview:
      "We help you protect your systems and data with authorized security testing and sound security architecture. Every engagement is scoped and approved with you in advance, with clear, actionable findings.",
    includes: [
      "Penetration testing (authorized)",
      "Threat modeling",
      "Security architecture review",
      "Vulnerability assessment",
      "Security awareness training",
    ],
    deliverables: [
      "Prioritized findings with clear remediation",
      "Re-test to confirm fixes",
      "Executive and technical reports",
    ],
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    slug: "data-analytics",
    title: "Data & Analytics",
    desc: "Pipelines, dashboards, and machine learning systems that turn your data into decisions you can act on.",
    tagline: "Turn your data into decisions you can act on.",
    overview:
      "We build the pipelines, warehouses and dashboards that bring your data together, and the models that help you predict and decide. The result is reporting your team actually trusts and uses.",
    includes: [
      "Data pipelines and ETL",
      "Dashboards and reporting",
      "Data warehousing",
      "Machine learning models",
      "Analytics strategy",
    ],
    deliverables: [
      "A single, trusted source of truth",
      "Self-service dashboards",
      "Documented data models",
    ],
    stack: ["Python", "SQL", "dbt", "BigQuery / Snowflake"],
    icon: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    slug: "ai-automation",
    title: "AI & Automation",
    desc: "Intelligent workflows and ML-powered systems that save your team time and surface insights automatically.",
    tagline: "Automate the busywork and put AI to work for your team.",
    overview:
      "We design intelligent workflows and integrate AI into your products and operations — from automating manual processes to building assistants and document-processing systems that save real time.",
    includes: [
      "Workflow automation",
      "AI and LLM integration",
      "Document and data processing",
      "Chatbots and assistants",
      "ML-powered product features",
    ],
    deliverables: [
      "Automations with measurable time savings",
      "Safe, monitored AI integrations",
      "Clear documentation and handover",
    ],
    stack: ["Python", "TypeScript", "LLM APIs", "Vector databases"],
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
  {
    slug: "it-consulting",
    title: "IT Consulting",
    desc: "Technology strategy, vendor selection, and roadmapping for teams navigating growth or transformation.",
    tagline: "A clear technology roadmap for teams that are growing or changing.",
    overview:
      "We help leaders make confident technology decisions — setting strategy, choosing the right vendors and tools, and creating a realistic roadmap for growth or transformation.",
    includes: [
      "Technology strategy and roadmaps",
      "Vendor and tool selection",
      "Architecture and code review",
      "Team and process advisory",
      "Digital transformation planning",
    ],
    deliverables: [
      "A prioritized technology roadmap",
      "Vendor recommendations with trade-offs",
      "An actionable improvement plan",
    ],
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

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
