import { createHighlighter, type Highlighter } from "shiki";
import type { CodeSample } from "./types";

/** VS Code's default dark theme, so samples look like they do in the editor. */
const THEME = "dark-plus";

const SHIKI_LANGS: Record<CodeSample["lang"], string> = {
  ts: "typescript",
  json: "json",
  bash: "bash",
  dockerfile: "dockerfile",
};

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: [THEME], langs: Object.values(SHIKI_LANGS) });
  return highlighter;
}

/** Highlights a sample at build time; returns Shiki's `<pre>` markup. */
export async function highlight(sample: CodeSample): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(sample.source.trim(), { lang: SHIKI_LANGS[sample.lang], theme: THEME });
}
