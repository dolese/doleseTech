/**
 * Papers the examining panel is still writing, remembered in this browser so
 * the teacher can close the page and find them again. Only the job's id and
 * a title are kept here; the paper itself waits on the server until it is
 * fetched, then joins the library (examLibrary.ts).
 */
const KEY = "dolese.exams.jobs.v1";
/** The server keeps a job for 30 days; nothing older is worth asking about. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface PendingJob {
  id: string;
  title: string;
  createdAt: string;
}

function read(): PendingJob[] {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(list)) return [];
    const cutoff = Date.now() - MAX_AGE_MS;
    return list.filter((j) => j && typeof j.id === "string" && Date.parse(j.createdAt) > cutoff);
  } catch {
    return [];
  }
}

function write(list: PendingJob[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    /* best-effort: the email link still finds the paper */
  }
}

/** Newest first. */
export function listJobs(): PendingJob[] {
  return typeof window === "undefined" ? [] : read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addJob(job: PendingJob) {
  write([job, ...read().filter((j) => j.id !== job.id)]);
}

export function removeJob(id: string) {
  write(read().filter((j) => j.id !== id));
}
