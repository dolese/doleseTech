import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write a paper — Exams Composer | Dolese Tech",
  description: "Plan an exam paper to the NECTA format, then let the examining panel write, answer, moderate and revise it.",
  alternates: { canonical: "/exams/write" },
};

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
