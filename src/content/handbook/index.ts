import computerEssentials from "./01-computer-essentials.md";
import htmlAndCss from "./02-html-and-css.md";
import stayingSafeOnline from "./07-staying-safe-online.md";

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
  { number: 3, slug: "javascript", title: "JavaScript", summary: "Check marks as they are entered and work out averages and divisions.", body: null },
  { number: 4, slug: "databases-with-sql", title: "Databases with SQL", summary: "Store students, subjects and marks, and ask questions of them.", body: null },
  { number: 5, slug: "python", title: "Python", summary: "Import a class list and calculate grades automatically.", body: null },
  { number: 6, slug: "cpp-essentials", title: "C++ essentials", summary: "Classes, inheritance and the standard library, for college courses.", body: null },
  {
    number: 7,
    slug: "staying-safe-online",
    title: "Staying safe online",
    summary: "Protect your devices, your accounts, your money and your work.",
    body: stayingSafeOnline,
  },
  { number: 8, slug: "git-and-github", title: "Git and GitHub", summary: "Keep every version of your project safe and share it.", body: null },
];

export function chapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}
