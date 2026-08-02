import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  listPapers,
  savePaper,
  getPaper,
  deletePaper,
  renamePaper,
  readDraft,
  writeDraft,
  clearDraft,
} from "../src/lib/examLibrary";
import type { Exam } from "../src/lib/exams";

// ── localStorage stub ───────────────────────────────────────────────
interface Stub {
  store: Map<string, string>;
  failWrites: boolean;
}

function installStorage(): Stub {
  const stub: Stub = { store: new Map(), failWrites: false };
  const localStorage = {
    getItem: (k: string) => stub.store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (stub.failWrites) throw new Error("QuotaExceededError");
      stub.store.set(k, v);
    },
    removeItem: (k: string) => void stub.store.delete(k),
  };
  (globalThis as unknown as { window: unknown }).window = { localStorage };
  return stub;
}

function makeExam(title: string, marks = 100): Exam {
  return {
    title, subject: "Basic Mathematics", level: "O-Level", form: "Form II",
    examType: "Terminal Exam", durationMinutes: 180, totalMarks: marks,
    language: "English", instructions: [],
    sections: [{
      name: "SECTION A", instructions: "", marks,
      questions: [{ number: "1", type: "Structured", marks, bloom: "Apply", difficulty: "Medium", text: "Q", answer: "A" }],
    }],
  } as Exam;
}

let stub: Stub;
beforeEach(() => { stub = installStorage(); });

// ── library ─────────────────────────────────────────────────────────
test("an empty library lists nothing", () => {
  assert.deepEqual(listPapers(), []);
});

test("saving a paper stores it with a summary and makes it retrievable", () => {
  const saved = savePaper(makeExam("Form II Terminal"));
  assert.ok(saved);
  assert.equal(saved!.title, "Form II Terminal");
  assert.equal(saved!.subject, "Basic Mathematics");
  assert.equal(saved!.totalMarks, 100);
  assert.equal(listPapers().length, 1);
  assert.equal(getPaper(saved!.id)?.exam.title, "Form II Terminal");
});

test("saving with an existing id updates in place instead of duplicating", () => {
  const first = savePaper(makeExam("Draft"))!;
  const second = savePaper(makeExam("Final", 50), first.id)!;
  assert.equal(second.id, first.id);
  assert.equal(listPapers().length, 1, "no duplicate created");
  assert.equal(listPapers()[0].title, "Final");
  assert.equal(listPapers()[0].totalMarks, 50);
  assert.equal(second.createdAt, first.createdAt, "createdAt is preserved");
});

test("saving without an id creates a separate paper", () => {
  savePaper(makeExam("One"));
  savePaper(makeExam("Two"));
  assert.equal(listPapers().length, 2);
});

test("papers are listed newest-updated first", () => {
  const a = savePaper(makeExam("Older"))!;
  savePaper(makeExam("Newer"));
  // Touch the older one so it becomes the most recently updated.
  savePaper(makeExam("Older again"), a.id);
  assert.equal(listPapers()[0].title, "Older again");
});

test("delete removes only the target paper", () => {
  const a = savePaper(makeExam("Keep"))!;
  const b = savePaper(makeExam("Drop"))!;
  deletePaper(b.id);
  const rest = listPapers();
  assert.equal(rest.length, 1);
  assert.equal(rest[0].id, a.id);
});

test("rename updates both the summary and the exam title", () => {
  const p = savePaper(makeExam("Old name"))!;
  const renamed = renamePaper(p.id, "New name");
  assert.equal(renamed?.title, "New name");
  assert.equal(getPaper(p.id)?.exam.title, "New name");
});

test("a refused write (quota) reports failure instead of throwing", () => {
  stub.failWrites = true;
  assert.equal(savePaper(makeExam("Too big")), null);
});

test("corrupt storage degrades to an empty library rather than crashing", () => {
  stub.store.set("dolese.exams.library.v1", "{{{not json");
  assert.deepEqual(listPapers(), []);
});

test("malformed entries are filtered out of the listing", () => {
  stub.store.set("dolese.exams.library.v1", JSON.stringify([{ id: "x" }, { nope: true }]));
  assert.deepEqual(listPapers(), []);
});

// ── draft ───────────────────────────────────────────────────────────
test("a draft round-trips and can be cleared", () => {
  assert.equal(readDraft(), null);
  writeDraft(makeExam("In progress"), "paper-1");
  const d = readDraft();
  assert.equal(d?.exam.title, "In progress");
  assert.equal(d?.savedId, "paper-1");
  clearDraft();
  assert.equal(readDraft(), null);
});

test("a failed draft write never throws", () => {
  stub.failWrites = true;
  assert.doesNotThrow(() => writeDraft(makeExam("Nope")));
});

test("library calls are safe with no browser storage present", () => {
  delete (globalThis as unknown as { window?: unknown }).window;
  assert.deepEqual(listPapers(), []);
  assert.equal(savePaper(makeExam("SSR")), null);
  assert.equal(readDraft(), null);
  assert.doesNotThrow(() => writeDraft(makeExam("SSR")));
  assert.doesNotThrow(() => clearDraft());
});
