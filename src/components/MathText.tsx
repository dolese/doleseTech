"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * Renders a string that may contain LaTeX math ($…$ inline, $$…$$ display)
 * plus light markdown. Line breaks are preserved. Paragraphs render inline so
 * it can sit inside an exam question line.
 */
const components: Components = {
  // Unwrap paragraphs to a span so math flows inline within question text.
  p: ({ children }) => <span className="math-p">{children}</span>,
};

export default function MathText({ children }: { children: string }) {
  const src = (children ?? "").replace(/\n/g, "  \n"); // markdown hard break per line
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
      {src}
    </ReactMarkdown>
  );
}
