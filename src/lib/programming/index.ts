import type { LanguageTrack, LevelKey, LevelTrack } from "./types";
import { beginner } from "./typescript/beginner";
import { intermediate } from "./typescript/intermediate";
import { advanced } from "./typescript/advanced";

export * from "./types";

/**
 * Language tracks shown on /programming, in display order. A track without
 * `levels` is listed as "coming soon" and has no detail pages yet.
 */
export const LANGUAGES: LanguageTrack[] = [
  {
    slug: "typescript",
    name: "TypeScript",
    code: "TS",
    color: "#2657C7",
    runtime: "Node.js",
    tagline: "Typed JavaScript for servers, APIs and tools.",
    description:
      "Learn TypeScript on Node.js from your first program to production services — types, async code, HTTP APIs, testing, streams, architecture and deployment.",
    levels: { beginner, intermediate, advanced },
  },
  {
    slug: "python",
    name: "Python",
    code: "PY",
    color: "#0E7C86",
    runtime: "CPython",
    tagline: "Readable scripting, data analysis and automation.",
    description: "Python fundamentals through to data processing, web APIs and automation.",
  },
  {
    slug: "javascript",
    name: "JavaScript",
    code: "JS",
    color: "#B5541E",
    runtime: "Browser & Node.js",
    tagline: "The language of the web.",
    description: "Core JavaScript, the DOM and building interactive web pages.",
  },
  {
    slug: "java",
    name: "Java",
    code: "JAVA",
    color: "#6B3FA0",
    runtime: "JVM",
    tagline: "Object-oriented programming for enterprise and Android.",
    description: "Object-oriented design, collections, concurrency and Spring Boot services.",
  },
  {
    slug: "sql",
    name: "SQL",
    code: "SQL",
    color: "#3D5A80",
    runtime: "PostgreSQL",
    tagline: "Query and model data in relational databases.",
    description: "Querying, joins, aggregation, schema design, indexes and transactions.",
  },
];

export function getLanguage(slug: string): LanguageTrack | undefined {
  return LANGUAGES.find((l) => l.slug === slug);
}

export function getLevel(slug: string, level: string): LevelTrack | undefined {
  const levels = getLanguage(slug)?.levels;
  return levels && level in levels ? levels[level as LevelKey] : undefined;
}

export function isAvailable(lang: LanguageTrack): lang is LanguageTrack & { levels: Record<LevelKey, LevelTrack> } {
  return Boolean(lang.levels);
}
