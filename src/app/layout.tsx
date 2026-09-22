import type { Metadata } from "next";
import "./globals.css";
import ChatLauncher from "@/components/ChatLauncher";

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
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Sora:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ChatLauncher />
      </body>
    </html>
  );
}
