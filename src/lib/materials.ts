/**
 * Generates full teaching-material content from the subject topic outlines,
 * following Tanzania's 2023 Competence-Based Curriculum (TIE) formats:
 *   - Scheme of Work: competence-based 13-column layout.
 *   - Lesson Plan: the IDDR framework (Introduction · Development · Design ·
 *     Realisation) with a competence-based header.
 *
 * Pure data (no rendering / no docx dependency) so it is shared by the React
 * material pages and the DOCX download route.
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

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"];

function competencesFor(topic: string) {
  return {
    main: `Apply the principles of ${topic} in everyday life and further learning.`,
    specifics: [
      `Explain the key concepts and terms used in ${topic}.`,
      `Use ${topic} to solve problems in real and contrived situations.`,
    ],
  };
}

const STANDARD_METHODS = "Brainstorming, guided discussion, demonstration, group work, question & answer.";
const STANDARD_ASSESSMENT = "Oral questions, written exercises, practical tasks, observation and portfolio.";

// ── Scheme of Work (competence-based, 13 columns) ───────────────
export interface SowRow {
  month: string;
  week: string;
  mainCompetence: string;
  specificCompetences: string[];
  topic: string;
  subTopic: string;
  activities: string;
  methods: string;
  resources: string;
  assessment: string;
  periods: string;
  references: string;
  remarks: string;
}
export interface SowSection {
  form: string;
  rows: SowRow[];
}

export function buildSchemeOfWork(slug: string, subjectName = "the subject"): SowSection[] {
  const outline = SUBJECT_TOPICS[slug] ?? [];
  return outline.map((f) => {
    let week = 1;
    const rows: SowRow[] = f.topics.map((topic) => {
      const span = 2; // ~2 weeks per topic
      const weekLabel = `${week}–${week + span - 1}`;
      const month = MONTHS[Math.min(Math.floor((week - 1) / 4), MONTHS.length - 1)];
      week += span;
      const c = competencesFor(topic);
      return {
        month,
        week: weekLabel,
        mainCompetence: c.main,
        specificCompetences: c.specifics,
        topic,
        subTopic: "Key concepts and applications",
        activities: `In groups, learners explore ${topic} through examples, then present and discuss their findings; the teacher guides and consolidates.`,
        methods: STANDARD_METHODS,
        resources: "Textbooks, charts, real objects, chalkboard, digital content.",
        assessment: STANDARD_ASSESSMENT,
        periods: String(span * 2),
        references: `${subjectName} syllabus (TIE); approved ${subjectName} textbook.`,
        remarks: "",
      };
    });
    return { form: f.form, rows };
  });
}

// ── Lesson Plan (IDDR framework) ────────────────────────────────
export interface LessonStage {
  stage: string;
  swahili: string;
  time: string;
  teacher: string;
  student: string;
  assessment: string;
}
export interface LessonPlan {
  form: string;
  topic: string;
  subTopic: string;
  mainCompetence: string;
  specificCompetence: string;
  periods: string;
  duration: string;
  resources: string;
  references: string;
  stages: LessonStage[];
}

export function buildLessonPlans(slug: string, subjectName = "the subject"): LessonPlan[] {
  const outline = SUBJECT_TOPICS[slug] ?? [];
  const plans: LessonPlan[] = [];
  outline.forEach((f) => {
    f.topics.slice(0, 2).forEach((topic) => {
      const c = competencesFor(topic);
      plans.push({
        form: f.form,
        topic,
        subTopic: "Key concepts and applications",
        mainCompetence: c.main,
        specificCompetence: `Demonstrate understanding of ${topic} and apply it to real-life situations.`,
        periods: "1",
        duration: "80 minutes (double period)",
        resources: "Chalkboard, textbook, charts, real objects and relevant digital content.",
        references: `${subjectName} syllabus (TIE); approved ${subjectName} textbook.`,
        stages: [
          {
            stage: "Introduction",
            swahili: "Utangulizi",
            time: "10 min",
            teacher: `Reviews the previous lesson and uses guiding questions and a real-life scenario to introduce ${topic}.`,
            student: "Respond to questions and relate the scenario to their experience.",
            assessment: "Oral questions to gauge prior knowledge.",
          },
          {
            stage: "Competence Development",
            swahili: "Kuendeleza umahiri",
            time: "30 min",
            teacher: `Facilitates group activities and demonstrations through which learners build understanding of ${topic}.`,
            student: "Work in groups, investigate, take notes and discuss findings.",
            assessment: "Observation of participation; checking group work.",
          },
          {
            stage: "Design / Application",
            swahili: "Kubuni",
            time: "25 min",
            teacher: `Sets a real-world task requiring learners to apply ${topic} and guides them as they work.`,
            student: "Apply the concept to solve the task and present their solutions.",
            assessment: "Assessment of the task/product against criteria.",
          },
          {
            stage: "Realisation",
            swahili: "Kutathmini",
            time: "15 min",
            teacher: "Summarises key points, gives feedback and a short exercise/assignment.",
            student: "Reflect, answer the exercise and note the assignment.",
            assessment: "Written exercise; self- and peer-assessment.",
          },
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
      intro: `${topic} is a key area in this form. The points below outline what a learner should master.`,
      points: [
        `Meaning and key terms used in ${topic}.`,
        `Main principles and explanations of ${topic}.`,
        `Worked examples and applications of ${topic}.`,
        `Common mistakes and revision questions on ${topic}.`,
      ],
    })),
  }));
}
