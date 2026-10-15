import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import type { Element, ElementContent } from "hast";

/**
 * A handbook chapter's Markdown, laid out for the page and for print.
 *
 * Callouts are ordinary blockquotes that open with a bold label —
 * `> **Tip:** …` — so a chapter stays plain, readable Markdown. The label
 * picks the colour and icon.
 */

const CALLOUTS: Record<string, { variant: string; icon: string }> = {
  // Plain glyphs rather than emoji, which print differently on every system.
  "tip:": { variant: "tip", icon: "i" },
  "remember:": { variant: "remember", icon: "✓" },
  "warning:": { variant: "warning", icon: "!" },
  "scam alert:": { variant: "scam", icon: "!" },
};

function text(node: ElementContent | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(text).join("");
  return "";
}

/** The callout a blockquote opens with, read from its first bold label. */
function calloutOf(node: Element | undefined) {
  const firstPara = node?.children.find((c): c is Element => c.type === "element" && c.tagName === "p");
  const label = firstPara?.children.find((c): c is Element => c.type === "element" && c.tagName === "strong");
  return CALLOUTS[text(label).trim().toLowerCase()];
}

export default function ChapterBody({ markdown }: { markdown: string }) {
  return (
    <div className="hb-prose">
      <Markdown
        // Smartypants turns typed straight quotes into printed curly ones,
        // outside code, so chapters can be edited with an ordinary keyboard.
        remarkPlugins={[remarkGfm, remarkSmartypants]}
        components={{
          blockquote({ node, children }) {
            const callout = calloutOf(node as Element | undefined);
            if (!callout) return <blockquote>{children}</blockquote>;
            return (
              <aside className={`hb-callout hb-callout-${callout.variant}`}>
                <span className="hb-callout-icon" aria-hidden="true">{callout.icon}</span>
                <div>{children}</div>
              </aside>
            );
          },
          table({ children }) {
            return (
              <div className="hb-table-wrap">
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
