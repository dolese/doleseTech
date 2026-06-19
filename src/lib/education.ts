/**
 * Tanzania secondary-education resource catalogue (TIE/NECTA aligned).
 * Drives the /education resource library. Material types follow the standard
 * Tanzanian set: Scheme of Work, Lesson Plans, and Lesson Notes.
 */

export type Level = "O-Level" | "A-Level";

export const MATERIAL_TYPES = ["Scheme of Work", "Lesson Plans", "Lesson Notes"] as const;
export type MaterialType = (typeof MATERIAL_TYPES)[number];

export interface Subject {
  code: string; // short badge label, e.g. "MATH"
  name: string;
  level: Level;
  forms: string; // e.g. "Form I–IV"
  topics: number; // approx. number of syllabus topics covered
  color: string; // subject badge colour
}

const PALETTE = {
  navy: "#16235B",
  green: "#1E9E48",
  teal: "#0E7C86",
  blue: "#2657C7",
  plum: "#6B3FA0",
  rust: "#B5541E",
  pink: "#B83280",
  slate: "#3D5A80",
};

export const SUBJECTS: Subject[] = [
  // ── O-Level (Form I–IV) ───────────────────────────────────────────
  { code: "MATH", name: "Basic Mathematics", level: "O-Level", forms: "Form I–IV", topics: 12, color: PALETTE.navy },
  { code: "ENG", name: "English Language", level: "O-Level", forms: "Form I–IV", topics: 10, color: PALETTE.blue },
  { code: "KIS", name: "Kiswahili", level: "O-Level", forms: "Form I–IV", topics: 11, color: PALETTE.green },
  { code: "BIO", name: "Biology", level: "O-Level", forms: "Form I–IV", topics: 9, color: PALETTE.teal },
  { code: "CHEM", name: "Chemistry", level: "O-Level", forms: "Form I–IV", topics: 10, color: PALETTE.plum },
  { code: "PHY", name: "Physics", level: "O-Level", forms: "Form I–IV", topics: 11, color: PALETTE.rust },
  { code: "GEO", name: "Geography", level: "O-Level", forms: "Form I–IV", topics: 8, color: PALETTE.slate },
  { code: "HIST", name: "History", level: "O-Level", forms: "Form I–IV", topics: 7, color: PALETTE.pink },
  { code: "CIV", name: "Civics", level: "O-Level", forms: "Form I–IV", topics: 6, color: PALETTE.navy },
  { code: "COMM", name: "Commerce", level: "O-Level", forms: "Form III–IV", topics: 8, color: PALETTE.green },
  { code: "B/K", name: "Book-Keeping", level: "O-Level", forms: "Form III–IV", topics: 9, color: PALETTE.teal },
  { code: "ICS", name: "Information & Computer Studies", level: "O-Level", forms: "Form I–IV", topics: 7, color: PALETTE.blue },

  // ── A-Level (Form V–VI) ───────────────────────────────────────────
  { code: "A-MATH", name: "Advanced Mathematics", level: "A-Level", forms: "Form V–VI", topics: 14, color: PALETTE.navy },
  { code: "PHY", name: "Physics", level: "A-Level", forms: "Form V–VI", topics: 12, color: PALETTE.rust },
  { code: "CHEM", name: "Chemistry", level: "A-Level", forms: "Form V–VI", topics: 13, color: PALETTE.plum },
  { code: "BIO", name: "Biology", level: "A-Level", forms: "Form V–VI", topics: 11, color: PALETTE.teal },
  { code: "GEO", name: "Geography", level: "A-Level", forms: "Form V–VI", topics: 9, color: PALETTE.slate },
  { code: "HIST", name: "History", level: "A-Level", forms: "Form V–VI", topics: 8, color: PALETTE.pink },
  { code: "ECON", name: "Economics", level: "A-Level", forms: "Form V–VI", topics: 10, color: PALETTE.blue },
  { code: "KIS", name: "Kiswahili", level: "A-Level", forms: "Form V–VI", topics: 9, color: PALETTE.green },
  { code: "ACC", name: "Accountancy", level: "A-Level", forms: "Form V–VI", topics: 11, color: PALETTE.teal },
  { code: "G/S", name: "General Studies", level: "A-Level", forms: "Form V–VI", topics: 6, color: PALETTE.navy },
];

export const LEVELS: Level[] = ["O-Level", "A-Level"];

/** Common A-Level subject combinations offered in Tanzania. */
export const COMBINATIONS = ["PCM", "PCB", "PGM", "EGM", "HGL", "HGE", "HKL", "ECA", "CBG"];
