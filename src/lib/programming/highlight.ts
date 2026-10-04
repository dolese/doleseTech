import { createHighlighter, type Highlighter } from "shiki";
import type { CodeSample } from "./types";

/** VS Code's default dark theme, so samples look like they do in the editor. */
const THEME = "dark-plus";

const SHIKI_LANGS: Record<CodeSample["lang"], string> = {
  ts: "typescript",
  python: "python",
  sql: "sql",
  json: "json",
  toml: "toml",
  bash: "bash",
  dockerfile: "dockerfile",
  text: "text",
};

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({
    themes: [THEME],
    // "text" is built in (plain, uncoloured) and is not a loadable grammar.
    langs: Object.values(SHIKI_LANGS).filter((l) => l !== "text"),
  });
  return highlighter;
}

/** Highlights a sample at build time; returns Shiki's `<pre>` markup. */
export async function highlight(sample: CodeSample): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(sample.source.trim(), { lang: SHIKI_LANGS[sample.lang], theme: THEME });
}
