"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context); selecting manually still works.
    }
  };

  return (
    <button type="button" className="code-block-copy" onClick={copy}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
