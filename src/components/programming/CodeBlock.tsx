import type { CodeSample } from "@/lib/programming";
import { highlight } from "@/lib/programming/highlight";
import CopyButton from "./CopyButton";

const LANG_LABELS: Record<CodeSample["lang"], string> = {
  ts: "TypeScript",
  python: "Python",
  sql: "SQL",
  json: "JSON",
  toml: "TOML",
  bash: "Shell",
  dockerfile: "Dockerfile",
  text: "Text",
};

export default async function CodeBlock({ sample }: { sample: CodeSample }) {
  const html = await highlight(sample);

  return (
    <figure className="code-block">
      <figcaption className="code-block-head">
        <span className="code-block-file">{sample.filename}</span>
        <span className="code-block-lang">{LANG_LABELS[sample.lang]}</span>
        <CopyButton text={sample.source.trim()} />
      </figcaption>
      {/* Shiki output is generated at build time from our own lesson source. */}
      <div className="code-block-body" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
