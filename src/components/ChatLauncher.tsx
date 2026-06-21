"use client";

import { usePathname } from "next/navigation";

/**
 * Floating button that opens the AI assistant, shown on every page except the
 * chat page itself and the admin dashboard.
 */
export default function ChatLauncher() {
  const pathname = usePathname();
  if (pathname?.startsWith("/chat") || pathname?.startsWith("/admin")) return null;

  return (
    <a href="/chat" className="chat-launcher" aria-label="Open the AI assistant">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
      </svg>
      <span className="chat-launcher-label">Ask AI</span>
    </a>
  );
}
