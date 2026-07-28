/**
 * DOLESE AI Exams Composer — Phase 1 core.
 * Types, options, the exam JSON schema, and the prompt builder used by the
 * /api/exams/generate route and the /exams UI. Tanzania (TIE/NECTA) oriented.
 */
import { z } from "zod";

export const EXAM_TYPES = [
  "Quiz",
  "Weekly Test",
  "Monthly Test",
  "Midterm Test",
  "Terminal Exam",
  "Mock Exam",
  "Pre-National Exam",
  "Final Examination",
  "Practice Paper",
  "Revision Paper",
] as const;

export const QUESTION_FORMATS = [
  "Multiple Choice",
  "True/False",
  "Matching",
  "Fill in the Blanks",
  "Short Answer",
  "Structured",
  "Essay",
] as const;

export const DIFFICULTIES = ["Very Easy", "Easy", "Medium", "Difficult", "Very Difficult", "Balanced"] as const;
export const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const;
export const LANGUAGES = ["English", "Kiswahili"] as const;
export const DURATIONS = [30, 45, 60, 90, 120, 150, 180] as const;

export type Language = (typeof LANGUAGES)[number];

export interface ExamConfig {
  subject: string;
  level: string; // O-Level / A-Level
  form: string; // Form I..VI
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  topics: string[];
  formats: string[];
  difficulty: string;
  language: Language;
  school?: string;
}

// ── Exam schema (what the model must return) ────────────────────
export const examQuestionSchema = z.object({
  number: z.string(),
  type: z.string(),
  marks: z.number(),
  bloom: z.string().optional().default("Understand"),
  difficulty: z.string().optional().default("Medium"),
  text: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string(), // model answer / marking scheme
});

export const examSectionSchema = z.object({
  name: z.string(),
  instructions: z.string().optional().default(""),
  marks: z.number().optional().default(0),
  questions: z.array(examQuestionSchema),
});

export const examSchema = z.object({
  title: z.string(),
  subject: z.string(),
  level: z.string().optional().default(""),
  form: z.string().optional().default(""),
  examType: z.string().optional().default(""),
  durationMinutes: z.number().optional().default(0),
  totalMarks: z.number().optional().default(0),
  language: z.string().optional().default("English"),
  instructions: z.array(z.string()).optional().default([]),
  sections: z.array(examSectionSchema),
});

export type Exam = z.infer<typeof examSchema>;
export type ExamQuestion = z.infer<typeof examQuestionSchema>;

export const examConfigSchema = z.object({
  subject: z.string().min(1),
  level: z.string().default(""),
  form: z.string().default(""),
  examType: z.enum(EXAM_TYPES),
  durationMinutes: z.number().int().min(15).max(300),
  totalMarks: z.number().int().min(5).max(200),
  topics: z.array(z.string()).max(40).default([]),
  formats: z.array(z.enum(QUESTION_FORMATS)).min(1),
  difficulty: z.enum(DIFFICULTIES),
  language: z.enum(LANGUAGES),
  school: z.string().max(120).optional(),
  model: z.string().optional(),
  instruction: z.string().max(600).optional(), // optional refine instruction
});

// ── Prompt builder ──────────────────────────────────────────────
export function buildExamPrompt(config: ExamConfig, refine?: string): { system: string; user: string } {
  const system = `You are a senior Tanzanian examiner and TIE curriculum expert who writes NECTA-standard, competence-based examination papers. You know the Tanzania 2023 competence-based curriculum, NECTA paper structure (Sections A/B/C with objective, short/structured, and essay items), marks allocation, timing, and Bloom's taxonomy balance.

You output ONLY a single valid JSON object (no markdown, no code fences, no commentary) with this exact shape:
{
  "title": string,
  "subject": string,
  "level": string,
  "form": string,
  "examType": string,
  "durationMinutes": number,
  "totalMarks": number,
  "language": string,
  "instructions": string[],            // candidate instructions (rubric)
  "sections": [
    {
      "name": string,                  // e.g. "SECTION A"
      "instructions": string,
      "marks": number,                 // total marks for the section
      "questions": [
        {
          "number": string,            // e.g. "1", "2(a)"
          "type": string,              // one of the requested formats
          "marks": number,
          "bloom": string,             // Remember|Understand|Apply|Analyze|Evaluate|Create
          "difficulty": string,
          "text": string,              // the full question (use \n for structured sub-parts)
          "options": string[],         // ONLY for Multiple Choice; otherwise omit
          "answer": string             // model answer / marking scheme with mark breakdown
        }
      ]
    }
  ]
}

Rules:
- Section and question marks MUST sum exactly to totalMarks.
- Keep the whole paper doable within the given duration.
- Balance Bloom's levels across the paper; do not make every item "Remember".
- Only use the requested question formats. Multiple Choice items need 4 options (A–D) and the answer states the correct letter.
- Cover the requested topics; every question must be answerable from the stated subject/form syllabus.
- Every question includes a correct, complete "answer" (model answer) with a brief mark breakdown.
- Write in the requested language.`;

  const parts = [
    `Create a ${config.examType} for ${config.subject} — ${config.level} ${config.form}.`,
    `Duration: ${config.durationMinutes} minutes. Total marks: ${config.totalMarks}.`,
    `Question formats to use: ${config.formats.join(", ")}.`,
    `Overall difficulty: ${config.difficulty}.`,
    `Language: ${config.language}.`,
    config.topics.length ? `Focus on these topics: ${config.topics.join("; ")}.` : `Cover the core topics of the form.`,
    config.school ? `School: ${config.school}.` : "",
    refine ? `\nApply this change to the paper: ${refine}` : "",
    `\nReturn ONLY the JSON object.`,
  ];
  return { system, user: parts.filter(Boolean).join(" ") };
}

/** Extract a JSON object from a model response that may include stray text/fences. */
export function extractExamJson(raw: string): unknown {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return JSON.parse(s);
}
