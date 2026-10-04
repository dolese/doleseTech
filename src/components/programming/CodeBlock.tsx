import type { CodeSample } from "@/lib/programming";
import { highlight } from "@/lib/programming/highlight";
import CopyButton from "./CopyButton";
import Runner from "./Runner";
import type { RunSpec } from "@/lib/programming/run";

const LANG_LABELS: Record<CodeSample["lang"], string> = {
  ts: "TypeScript",
  js: "JavaScript",
  html: "HTML",
  python: "Python",
  java: "Java",
  xml: "XML",
  sql: "SQL",
  json: "JSON",
  toml: "TOML",
  bash: "Shell",
  dockerfile: "Dockerfile",
  text: "Text",
};

export default async function CodeBlock({ sample, run }: { sample: CodeSample; run?: RunSpec }) {
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
      {run && <Runner spec={run} />}
    </figure>
  );
}
