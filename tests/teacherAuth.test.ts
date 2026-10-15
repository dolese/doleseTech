import { test } from "node:test";
import assert from "node:assert/strict";

import { createSession, normaliseEmail, readSession } from "../src/lib/teacherAuth";

// Development falls back to a fixed signing key; these tests run on it.
delete process.env.AUTH_SECRET;

test("a session cookie reads back as the teacher it was issued to", () => {
  const { value, maxAge } = createSession("teacher-123");
  assert.equal(readSession(value), "teacher-123");
  assert.equal(maxAge, 30 * 24 * 60 * 60);
});

test("two sessions for the same teacher are different cookies", () => {
  assert.notEqual(createSession("t").value, createSession("t").value);
});

test("a tampered cookie is refused", () => {
  const { value } = createSession("teacher-123");
  const [id64, exp, nonce, sig] = value.split(".");
  // Swap in someone else's id, keep the original signature.
  const forged = [Buffer.from("teacher-999").toString("base64url"), exp, nonce, sig].join(".");
  assert.equal(readSession(forged), null);
  // Extend the expiry.
  assert.equal(readSession([id64, String(Number(exp) + 1e9), nonce, sig].join(".")), null);
  // Garbage and empties.
  for (const bad of ["", "a.b.c", "a.b.c.d", undefined]) assert.equal(readSession(bad as string), null);
});

test("an expired session is refused", () => {
  const { value } = createSession("teacher-123");
  const realNow = Date.now;
  try {
    Date.now = () => realNow() + 31 * 24 * 60 * 60 * 1000;
    assert.equal(readSession(value), null);
  } finally {
    Date.now = realNow;
  }
});

test("a session signed with another key is refused", () => {
  const { value } = createSession("teacher-123");
  process.env.AUTH_SECRET = "a-completely-different-secret-of-sufficient-length-1234";
  try {
    assert.equal(readSession(value), null);
  } finally {
    delete process.env.AUTH_SECRET;
  }
});

test("email addresses are matched case-insensitively and validated", () => {
  assert.equal(normaliseEmail("  Teacher@School.ac.TZ "), "teacher@school.ac.tz");
  for (const bad of ["", "teacher", "teacher@", "@school.tz", "a b@c.tz", "x@y"]) {
    assert.equal(normaliseEmail(bad), null, bad);
  }
});
