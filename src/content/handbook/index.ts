import computerEssentials from "./01-computer-essentials.md";
import htmlAndCss from "./02-html-and-css.md";
import javascript from "./03-javascript.md";
import databasesWithSql from "./04-databases-with-sql.md";
import python from "./05-python.md";
import cppEssentials from "./06-cpp-essentials.md";
import stayingSafeOnline from "./07-staying-safe-online.md";
import gitAndGithub from "./08-git-and-github.md";

/**
 * The Dolese Tech IT Handbook: one book that builds a small school results
 * system from the first web page to a protected, backed-up database.
 *
 * Every chapter is written for this book — no third-party notes or
 * screenshots are used as source material — and every code example is run
 * before it goes in. Chapters are Markdown; `body` is the text after the
 * title and the intro line, which come from here.
 */
export interface Chapter {
  number: number;
  slug: string;
  title: string;
  /** One line under the title on the chapter's opening page. */
  summary: string;
  /** Null until the chapter is written. */
  body: string | null;
}

export const HANDBOOK = {
  title: "Dolese Tech IT Handbook",
  subtitle: "From your first web page to your first database",
  edition: "First edition, 2026",
};

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    slug: "computer-essentials",
    title: "Computer essentials",
    summary: "Shortcuts, files and folders, symbols, and how the internet works.",
    body: computerEssentials,
  },
  {
    number: 2,
    slug: "html-and-css",
    title: "HTML and CSS",
    summary: "Build the results page of a small school system.",
    body: htmlAndCss,
  },
  {
    number: 3,
    slug: "javascript",
    title: "JavaScript",
    summary: "Check marks as they are entered, and work out averages, grades and positions.",
    body: javascript,
  },
  {
    number: 4,
    slug: "databases-with-sql",
    title: "Databases with SQL",
    summary: "Store students, subjects and marks, and ask questions of them.",
    body: databasesWithSql,
  },
  {
    number: 5,
    slug: "python",
    title: "Python",
    summary: "Import a class list, and calculate grades and divisions automatically.",
    body: python,
  },
  {
    number: 6,
    slug: "cpp-essentials",
    title: "C++ essentials",
    summary: "Classes, inheritance and the standard library, for college courses.",
    body: cppEssentials,
  },
  {
    number: 7,
    slug: "staying-safe-online",
    title: "Staying safe online",
    summary: "Protect your devices, your accounts, your money and your work.",
    body: stayingSafeOnline,
  },
  {
    number: 8,
    slug: "git-and-github",
    title: "Git and GitHub",
    summary: "Keep every version of your project safe, share it, and publish it.",
    body: gitAndGithub,
  },
];

export function chapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

export function chapterWithNeighbours(slug: string): { chapter: Chapter; previous?: Chapter; next?: Chapter } | undefined {
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  if (i < 0) return undefined;
  return { chapter: CHAPTERS[i], previous: CHAPTERS[i - 1], next: CHAPTERS[i + 1] };
}

/** "7.1 Why this matters" → "7-1-why-this-matters": the id of a heading. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A chapter's sections (its ## headings), for an "on this page" list. */
export function chapterSections(markdown: string): { id: string; title: string }[] {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((m) => {
    const title = m[1].replace(/`/g, "").trim();
    return { id: headingId(title), title };
  });
}

/** Minutes to read, at a careful 180 words a minute. */
export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(markdown.split(/\s+/).length / 180));
}

export interface GlossaryEntry {
  english: string;
  kiswahili: string;
  meaning: string;
  chapters: number[];
}

/**
 * Every chapter's "Key terms" table, merged into one alphabetical glossary.
 * A term defined in several chapters is listed once, with each chapter.
 */
export function glossary(): GlossaryEntry[] {
  const byTerm = new Map<string, GlossaryEntry>();
  for (const chapter of CHAPTERS) {
    const body = chapter.body?.replace(/\r\n/g, "\n");
    const start = body?.indexOf("\n## Key terms\n") ?? -1;
    if (!body || start < 0) continue;
    const rows = body
      .slice(start)
      .split("\n")
      .filter((line) => line.startsWith("|"))
      .slice(2); // the heading row and the |---| row
    for (const row of rows) {
      const [english, kiswahili, meaning] = row.slice(1, -1).split(" | ").map((cell) => cell.trim());
      if (!english || !kiswahili) continue;
      const key = english.toLowerCase();
      const known = byTerm.get(key);
      if (known) known.chapters.push(chapter.number);
      else byTerm.set(key, { english, kiswahili, meaning, chapters: [chapter.number] });
    }
  }
  return [...byTerm.values()].sort((a, b) => a.english.localeCompare(b.english));
}

/** The glossary as a Markdown table, for the book and the web page. */
export function glossaryMarkdown(): string {
  const lines = ["| English | Kiswahili | Meaning | Chapter |", "|---|---|---|---|"];
  for (const e of glossary()) lines.push(`| ${e.english} | ${e.kiswahili} | ${e.meaning} | ${e.chapters.join(", ")} |`);
  return lines.join("\n");
}
