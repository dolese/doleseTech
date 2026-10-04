import { test } from "node:test";
import assert from "node:assert/strict";

import {
  LANGUAGES,
  LEVELS,
  getLessonContext,
  isAvailable,
  lessonsInOrder,
} from "../src/lib/programming";

// Guards the programming course data: every lesson needs a solution and a
// well-formed quiz, and lesson URLs must stay unique and linkable.

const tracks = LANGUAGES.filter(isAvailable);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

test("every live language has lessons in all three levels", () => {
  assert.ok(tracks.length > 0);
  for (const lang of tracks) {
    for (const level of LEVELS) {
      assert.ok(lang.levels[level].lessons.length > 0, `${lang.slug}/${level} has no lessons`);
    }
  }
});

test("language and lesson slugs are URL-safe and unique within their level", () => {
  assert.equal(new Set(LANGUAGES.map((l) => l.slug)).size, LANGUAGES.length);
  for (const lang of tracks) {
    assert.match(lang.slug, SLUG);
    for (const level of LEVELS) {
      const slugs = lang.levels[level].lessons.map((l) => l.slug);
      for (const s of slugs) assert.match(s, SLUG, `${lang.slug}/${level}/${s}`);
      assert.equal(new Set(slugs).size, slugs.length, `duplicate lesson slug in ${lang.slug}/${level}`);
    }
  }
});

test("every lesson has content, code and an exercise", () => {
  for (const lang of tracks) {
    for (const { level, lesson } of lessonsInOrder(lang)) {
      const where = `${lang.slug}/${level}/${lesson.slug}`;
      assert.ok(lesson.title.trim() && lesson.summary.trim(), `${where}: title and summary`);
      assert.ok(lesson.body.length > 0, `${where}: body`);
      assert.ok(lesson.keyPoints.length > 0, `${where}: key points`);
      assert.ok(lesson.exercise.trim(), `${where}: exercise`);
      for (const sample of lesson.code) {
        assert.ok(sample.source.trim(), `${where}: empty code sample ${sample.filename}`);
      }
    }
  }
});

test("every lesson has a worked solution", () => {
  for (const lang of tracks) {
    for (const { level, lesson } of lessonsInOrder(lang)) {
      const where = `${lang.slug}/${level}/${lesson.slug}`;
      assert.ok(lesson.practice, `${where}: missing practice (solution + quiz)`);
      const { solution } = lesson.practice;
      assert.ok(solution.notes.length > 0, `${where}: solution notes`);
      assert.ok(solution.code.length > 0, `${where}: solution code`);
      for (const sample of solution.code) {
        assert.ok(sample.source.trim(), `${where}: empty solution sample ${sample.filename}`);
      }
    }
  }
});

test("every quiz is well-formed", () => {
  for (const lang of tracks) {
    for (const { level, lesson } of lessonsInOrder(lang)) {
      const where = `${lang.slug}/${level}/${lesson.slug}`;
      const quiz = lesson.practice?.quiz ?? [];
      assert.ok(quiz.length >= 3 && quiz.length <= 5, `${where}: quiz should have 3-5 questions, has ${quiz.length}`);
      quiz.forEach((q, i) => {
        const at = `${where} question ${i + 1}`;
        assert.ok(q.question.trim(), `${at}: question text`);
        assert.ok(q.options.length >= 2, `${at}: needs at least two options`);
        assert.equal(new Set(q.options).size, q.options.length, `${at}: duplicate options`);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${at}: answer index out of range`);
        assert.ok(q.explanation.trim(), `${at}: explanation`);
      });
      // A quiz whose answers are all in the same position can be guessed.
      if (quiz.length > 1) {
        assert.ok(new Set(quiz.map((q) => q.answer)).size > 1, `${where}: every answer is option ${quiz[0].answer + 1}`);
      }
    }
  }
});

test("previous/next links visit every lesson of a language exactly once, in order", () => {
  for (const lang of tracks) {
    const all = lessonsInOrder(lang);
    let current = getLessonContext(lang.slug, all[0].level, all[0].lesson.slug);
    assert.ok(current);
    assert.equal(current.prev, undefined);

    const visited: string[] = [];
    while (current) {
      visited.push(`${current.level}/${current.lesson.slug}`);
      const next: typeof current.next = current.next;
      current = next ? getLessonContext(lang.slug, next.level, next.lesson.slug) : undefined;
    }
    assert.deepEqual(visited, all.map((l) => `${l.level}/${l.lesson.slug}`));
  }
});

test("unknown lessons are not found", () => {
  assert.equal(getLessonContext("typescript", "beginner", "no-such-lesson"), undefined);
  assert.equal(getLessonContext("typescript", "expert", "setup"), undefined);
  assert.equal(getLessonContext("cobol", "beginner", "setup"), undefined);
});

// ── In-browser runners ──────────────────────────────────────────────────
import { splitSql } from "../public/runners/sql-split.mjs";
import { runSpecsFor } from "../src/lib/programming/run";

test("splitSql splits like psql: quotes, dollar-quoted bodies, comments and backslash commands", () => {
  const script = [
    "CREATE TABLE t (note text DEFAULT 'a;b');",
    "-- a comment; with a semicolon",
    "CREATE FUNCTION f() RETURNS int LANGUAGE plpgsql AS $$ BEGIN RETURN 1; END; $$;",
    "\\d t",
    'SELECT "odd;name" FROM t; /* block; comment */',
    "SELECT 1",
  ].join("\n");
  const statements = splitSql(script);
  assert.equal(statements.length, 4);
  assert.match(statements[0], /'a;b'/);
  assert.match(statements[1], /\$\$ BEGIN RETURN 1; END; \$\$;$/);
  assert.ok(!statements.some((s) => s.includes("\\d")));
  assert.match(statements[3], /SELECT 1$/);   // a preceding comment travels with its statement, as in psql
});

test("run buttons appear only where the browser can run the code", () => {
  for (const lang of tracks) {
    for (const { level, lesson } of lessonsInOrder(lang)) {
      const specs = runSpecsFor(lang.slug, level, lesson.slug);
      const all = [...specs.lesson, ...specs.solution];
      assert.equal(specs.lesson.length, lesson.code.length);
      assert.equal(specs.solution.length, lesson.practice?.solution.code.length ?? 0);
      if (lang.slug === "typescript" || lang.slug === "java") {
        assert.ok(all.every((s) => s === undefined), `${lang.slug} has no browser runtime`);
      }
      for (const s of all) {
        if (s?.kind === "python") assert.doesNotMatch(s.source + s.files.map((f) => f.source).join("\n"), /^\s*(import|from)\s+(requests|fastapi|psycopg|asyncio)\b/m);
        if (s?.kind === "page") assert.ok(Object.keys(s.scripts).length > 0);
      }
    }
  }
});

test("every runnable PostgreSQL sample splits into statements, with setup from earlier lessons", () => {
  let runnable = 0;
  for (const { level, lesson } of lessonsInOrder(tracks.find((l) => l.slug === "postgresql")!)) {
    for (const s of [...runSpecsFor("postgresql", level, lesson.slug).lesson, ...runSpecsFor("postgresql", level, lesson.slug).solution]) {
      if (s?.kind !== "sql") continue;
      runnable++;
      assert.ok(splitSql(s.source).length > 0, `${level}/${lesson.slug}: no statements`);
      if (level !== "beginner" && lesson.slug !== "joins") assert.ok(s.setup.length > 0, `${level}/${lesson.slug}: missing setup`);
    }
  }
  assert.ok(runnable >= 30, `expected most SQL samples to be runnable, got ${runnable}`);
});
