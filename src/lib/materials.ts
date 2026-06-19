/**
 * Generates full teaching-material content from the subject topic outlines.
 * Pure data (no rendering / no docx dependency) so it can be shared by the
 * React material pages and the DOCX download route.
 */
import { SUBJECT_TOPICS } from "./education";

export type MaterialKey = "scheme-of-work" | "lesson-plans" | "lesson-notes";

export const MATERIALS: { key: MaterialKey; label: string }[] = [
  { key: "scheme-of-work", label: "Scheme of Work" },
  { key: "lesson-plans", label: "Lesson Plans" },
  { key: "lesson-notes", label: "Lesson Notes" },
];

export function isMaterialKey(v: string): v is MaterialKey {
  return MATERIALS.some((m) => m.key === v);
}

export function materialLabel(key: MaterialKey): string {
  return MATERIALS.find((m) => m.key === key)?.label ?? key;
}

export function hasContent(slug: string): boolean {
  return Boolean(SUBJECT_TOPICS[slug]?.length);
}

// ── Scheme of Work ──────────────────────────────────────────────
export interface SowRow {
  week: string;
  topic: string;
  subTopic: string;
  objectives: string;
  activities: string;
  resources: string;
  assessment: string;
}
export interface SowSection {
  form: string;
  rows: SowRow[];
}

export function buildSchemeOfWork(slug: string): SowSection[] {
  const outline = SUBJECT_TOPICS[slug] ?? [];
  return outline.map((f) => {
    let week = 1;
    const rows: SowRow[] = f.topics.map((topic) => {
      const span = 2; // ~2 weeks per topic
      const label = `${week}–${week + span - 1}`;
      week += span;
      return {
        week: label,
        topic,
        subTopic: "Key concepts and applications",
        objectives: `Explain the key concepts of ${topic} and apply them to solve related problems.`,
        activities: `Guided discussion, demonstrations and group exercises on ${topic}.`,
        resources: "Textbooks, charts, real objects, chalkboard.",
        assessment: "Oral questions, written exercises and short tests.",
      };
    });
    return { form: f.form, rows };
  });
}

// ── Lesson Plans ────────────────────────────────────────────────
export interface LessonStage {
  stage: string;
  time: string;
  teacher: string;
  student: string;
}
export interface LessonPlan {
  form: string;
  topic: string;
  subTopic: string;
  competence: string;
  objectives: string[];
  resources: string;
  stages: LessonStage[];
}

export function buildLessonPlans(slug: string): LessonPlan[] {
  const outline = SUBJECT_TOPICS[slug] ?? [];
  const plans: LessonPlan[] = [];
  outline.forEach((f) => {
    f.topics.slice(0, 2).forEach((topic) => {
      plans.push({
        form: f.form,
        topic,
        subTopic: topic,
        competence: `The student should be able to apply knowledge of ${topic} in real-life contexts.`,
        objectives: [
          `define the key terms used in ${topic}`,
          `explain the main ideas of ${topic}`,
          `apply ${topic} to solve simple problems`,
        ],
        resources: "Chalkboard, textbook, charts and relevant real objects.",
        stages: [
          { stage: "Introduction", time: "5 min", teacher: `Reviews the previous lesson and introduces ${topic} through guiding questions.`, student: "Respond to questions and recall prior knowledge." },
          { stage: "New Knowledge", time: "20 min", teacher: `Explains the concepts of ${topic} using examples and demonstrations.`, student: "Listen, take notes, and ask and answer questions." },
          { stage: "Reinforcement", time: "10 min", teacher: `Guides group and individual exercises on ${topic}.`, student: "Work in groups, solve exercises and present findings." },
          { stage: "Conclusion", time: "5 min", teacher: "Summarises the key points and gives an assignment.", student: "Copy the summary and assignment; ask final questions." },
        ],
      });
    });
  });
  return plans;
}

// ── Lesson Notes ────────────────────────────────────────────────
export interface NoteTopic {
  topic: string;
  intro: string;
  points: string[];
}
export interface NoteSection {
  form: string;
  topics: NoteTopic[];
}

export function buildLessonNotes(slug: string): NoteSection[] {
  const outline = SUBJECT_TOPICS[slug] ?? [];
  return outline.map((f) => ({
    form: f.form,
    topics: f.topics.map((topic) => ({
      topic,
      intro: `${topic} is a key area in this form. The points below outline what a student should master.`,
      points: [
        `Meaning and key terms used in ${topic}.`,
        `Main principles and explanations of ${topic}.`,
        `Worked examples and applications of ${topic}.`,
        `Common mistakes and revision questions on ${topic}.`,
      ],
    })),
  }));
}
