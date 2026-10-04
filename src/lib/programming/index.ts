import type { LanguageTrack, LevelKey, LevelTrack } from "./types";
import { beginner } from "./typescript/beginner";
import { intermediate } from "./typescript/intermediate";
import { advanced } from "./typescript/advanced";
import * as python from "./python";
import * as postgresql from "./postgresql";

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
    runtime: "Python 3.11+",
    tagline: "Readable code for automation, data, web APIs and AI.",
    description:
      "Learn Python from your first script to production services — data structures, files, classes, testing, type hints, asyncio, FastAPI, PostgreSQL and deployment.",
    levels: python.levels,
  },
  {
    slug: "postgresql",
    name: "PostgreSQL",
    code: "PG",
    color: "#3D5A80",
    runtime: "PostgreSQL 16+",
    tagline: "Design, query and run relational databases with SQL.",
    description:
      "Learn SQL and PostgreSQL by building a school results database — tables, queries, joins, window functions, indexes, transactions, JSONB, security and operations.",
    levels: postgresql.levels,
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
