"use client";

import { useState } from "react";
import type { CodeSample } from "@/lib/programming";

const LANG_LABELS: Record<CodeSample["lang"], string> = {
  ts: "TypeScript",
  json: "JSON",
  bash: "Shell",
  dockerfile: "Dockerfile",
};

export default function CodeBlock({ sample }: { sample: CodeSample }) {
  const [copied, setCopied] = useState(false);
  const source = sample.source.trim();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context); selecting manually still works.
    }
  };

  return (
    <figure className="code-block">
      <figcaption className="code-block-head">
        <span className="code-block-file">{sample.filename}</span>
        <span className="code-block-lang">{LANG_LABELS[sample.lang]}</span>
        <button type="button" className="code-block-copy" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre>
        <code>{source}</code>
      </pre>
    </figure>
  );
}
