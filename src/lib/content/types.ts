/**
 * Authored, subject-specific teaching content (competences, activities and
 * full lesson-notes prose). Keyed by "Form|Topic" so repeated topic names
 * across forms (e.g. Algebra in Form I and Form II) stay distinct.
 */
export interface NoteSubSection {
  heading: string;
  body?: string;
  points?: string[];
}

export interface NoteBlock {
  intro: string;
  sections: NoteSubSection[];
}

export interface TopicContent {
  mainCompetence: string;
  specificCompetences: string[];
  activities: string;
  notes: NoteBlock;
}

/** Keyed by `${form}|${topic}`, e.g. "Form I|Numbers (Base Ten)". */
export type SubjectContent = Record<string, TopicContent>;

export function contentKey(form: string, topic: string): string {
  return `${form}|${topic}`;
}
