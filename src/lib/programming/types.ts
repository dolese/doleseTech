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
  lang: "ts" | "js" | "html" | "python" | "java" | "xml" | "sql" | "json" | "toml" | "bash" | "dockerfile" | "text";
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
  /** Worked solution and quiz; attached from the track's practice files. */
  practice?: Practice;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  answer: number;
  /** Why the answer is right; shown after checking. */
  explanation: string;
}

export interface Solution {
  /** Paragraphs explaining the approach; `backticks` render as inline code. */
  notes: string[];
  code: CodeSample[];
}

export interface Practice {
  solution: Solution;
  quiz: QuizQuestion[];
}

/** Practice content for one track, keyed by level and then lesson slug. */
export type TrackPractice = Partial<Record<LevelKey, Record<string, Practice>>>;

/** Returns the levels with each lesson's practice content attached. */
export function attachPractice(
  levels: Record<LevelKey, LevelTrack>,
  practice: TrackPractice,
): Record<LevelKey, LevelTrack> {
  const out = {} as Record<LevelKey, LevelTrack>;
  for (const level of LEVELS) {
    const byLesson = practice[level] ?? {};
    out[level] = {
      ...levels[level],
      lessons: levels[level].lessons.map((l) => (byLesson[l.slug] ? { ...l, practice: byLesson[l.slug] } : l)),
    };
  }
  return out;
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
