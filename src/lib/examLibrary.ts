/**
 * Browser-local library of generated papers.
 *
 * Papers are kept in localStorage rather than on the server on purpose: /exams
 * is a public page with no accounts, so a server-side store behind a public API
 * would let anyone enumerate every teacher's papers — and an unreleased exam
 * paper is sensitive. Browser-local keeps each teacher's papers private to their
 * own device. (Cross-device sync would require real user accounts.)
 *
 * Two things are stored:
 *  - the LIBRARY: papers the teacher explicitly saved;
 *  - the DRAFT: the paper currently on screen, so a refresh or an accidental
 *    tab close never loses work in progress.
 */
import type { Exam } from "./exams";

const LIBRARY_KEY = "dolese.exams.library.v1";
const DRAFT_KEY = "dolese.exams.draft.v1";

/** Hard cap so a long-lived browser can't fill its storage quota. */
export const MAX_PAPERS = 60;

export interface SavedPaper {
  id: string;
  title: string;
  subject: string;
  level: string;
  form: string;
  examType: string;
  totalMarks: number;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  exam: Exam;
}

export interface ExamDraft {
  exam: Exam;
  /** Set when the draft is an edit of a paper already in the library. */
  savedId?: string;
  updatedAt: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/** Write, shedding the oldest papers if the browser rejects the write on quota. */
function writeLibrary(papers: SavedPaper[]): boolean {
  if (!isBrowser()) return false;
  let list = papers.slice(0, MAX_PAPERS);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(list));
      return true;
    } catch {
      if (list.length <= 1) return false;
      // Drop the oldest quarter and try again.
      list = list.slice(0, Math.max(1, Math.floor(list.length * 0.75)));
    }
  }
  return false;
}

/** Papers, newest-updated first. */
export function listPapers(): SavedPaper[] {
  const papers = readJson<SavedPaper[]>(LIBRARY_KEY, []);
  if (!Array.isArray(papers)) return [];
  return papers
    .filter((p) => p && typeof p.id === "string" && p.exam && Array.isArray(p.exam.sections))
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export function getPaper(id: string): SavedPaper | undefined {
  return listPapers().find((p) => p.id === id);
}

function summarize(exam: Exam) {
  return {
    title: exam.title || "Untitled paper",
    subject: exam.subject || "",
    level: exam.level || "",
    form: exam.form || "",
    examType: exam.examType || "",
    totalMarks: exam.totalMarks || 0,
    durationMinutes: exam.durationMinutes || 0,
  };
}

/**
 * Save a paper. Passing an existing `id` updates that paper in place (so
 * repeatedly saving the same paper doesn't create duplicates).
 * Returns the stored paper, or null if the browser refused the write.
 */
export function savePaper(exam: Exam, id?: string): SavedPaper | null {
  const papers = listPapers();
  const now = new Date().toISOString();
  const existing = id ? papers.find((p) => p.id === id) : undefined;

  const paper: SavedPaper = {
    id: existing?.id ?? newId(),
    ...summarize(exam),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    exam,
  };

  // Always move the touched paper to the front. `updatedAt` alone is not enough:
  // two saves in the same millisecond tie, and a stable sort would then keep an
  // older paper ahead of the one just saved.
  const next = [paper, ...papers.filter((p) => p.id !== paper.id)];
  return writeLibrary(next) ? paper : null;
}

export function deletePaper(id: string): void {
  writeLibrary(listPapers().filter((p) => p.id !== id));
}

/** Rename a saved paper (and its underlying exam title). */
export function renamePaper(id: string, title: string): SavedPaper | null {
  const papers = listPapers();
  const paper = papers.find((p) => p.id === id);
  if (!paper) return null;
  const updated: SavedPaper = {
    ...paper,
    title,
    exam: { ...paper.exam, title },
    updatedAt: new Date().toISOString(),
  };
  return writeLibrary(papers.map((p) => (p.id === id ? updated : p))) ? updated : null;
}

// ── Draft (crash/refresh protection) ────────────────────────────
export function readDraft(): ExamDraft | null {
  const d = readJson<ExamDraft | null>(DRAFT_KEY, null);
  return d && d.exam && Array.isArray(d.exam.sections) ? d : null;
}

export function writeDraft(exam: Exam, savedId?: string): void {
  if (!isBrowser()) return;
  try {
    const draft: ExamDraft = { exam, savedId, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* a draft is best-effort; never break the page over it */
  }
}

export function clearDraft(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
