import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dolese Tech — Technology that works as hard as you do",
  description:
    "Dolese Tech builds software, cloud systems, and data infrastructure for organizations that need things done right.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
