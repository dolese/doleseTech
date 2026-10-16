import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in — Dolese Tech", robots: { index: false } };

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
