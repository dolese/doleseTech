/**
 * Programming-languages curriculum. Each language track is split into three
 * levels (Beginner → Intermediate → Advanced); each level is an ordered list of
 * lessons with prose, runnable code samples, key points and an exercise.
 */

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type LevelKey = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<LevelKey, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export interface CodeSample {
  /** Shown above the block, e.g. "src/hello.ts" or "Terminal". */
  filename: string;
  /** Used for the badge and to decide which samples are type-checked. */
  lang: "ts" | "json" | "bash" | "dockerfile";
  source: string;
}

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  /** Paragraphs; `backticks` render as inline code. */
  body: string[];
  code: CodeSample[];
  keyPoints: string[];
  exercise: string;
}

export interface LevelTrack {
  intro: string;
  outcomes: string[];
  lessons: Lesson[];
}

export interface LanguageTrack {
  slug: string;
  name: string;
  /** Short badge label, e.g. "TS". */
  code: string;
  color: string;
  runtime: string;
  tagline: string;
  description: string;
  /** Tracks without levels are listed as "coming soon". */
  levels?: Record<LevelKey, LevelTrack>;
}
