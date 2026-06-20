import type { SubjectContent, TopicContent } from "./types";
import { basicMathematics } from "./basicMathematics";
import { biology } from "./biology";

export type { TopicContent, NoteBlock, NoteSubSection } from "./types";
import { contentKey } from "./types";

/** Authored content by subject slug. Subjects not listed fall back to generic. */
const AUTHORED: Record<string, SubjectContent> = {
  "o-level-basic-mathematics": basicMathematics,
  "o-level-biology": biology,
};

/** Returns authored content for a topic, or undefined to use the generic fallback. */
export function authoredContent(slug: string, form: string, topic: string): TopicContent | undefined {
  return AUTHORED[slug]?.[contentKey(form, topic)];
}

/** Whether a subject has any authored content (used to badge "expert-written"). */
export function isAuthored(slug: string): boolean {
  return Boolean(AUTHORED[slug]);
}
