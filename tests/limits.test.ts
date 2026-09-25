import { test } from "node:test";
import assert from "node:assert/strict";

import { hit, modelWeight } from "../src/lib/limits";

// These cover the in-memory path: with no database configured, every limit
// must still hold. The database client is created on first use, so clearing
// the connection strings here — before any call — keeps the tests off it.
for (const name of ["DATABASE_URL", "POSTGRES_URL", "DATABASE_POSTGRES_URL", "POSTGRES_URL_NON_POOLING"]) {
  delete process.env[name];
}

const MINUTE = 60_000;
let n = 0;
const freshKey = () => `test:${Date.now()}:${n++}`;

test("allows up to the limit, then refuses with a retry time", async () => {
  const key = freshKey();
  for (let i = 1; i <= 3; i++) {
    const r = await hit(key, { limit: 3, windowMs: MINUTE });
    assert.equal(r.allowed, true, `call ${i} should pass`);
  }
  const blocked = await hit(key, { limit: 3, windowMs: MINUTE });
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0, "a refusal says when to come back");
});

test("keys are counted separately", async () => {
  const a = freshKey();
  const b = freshKey();
  await hit(a, { limit: 1, windowMs: MINUTE });
  assert.equal((await hit(a, { limit: 1, windowMs: MINUTE })).allowed, false);
  assert.equal((await hit(b, { limit: 1, windowMs: MINUTE })).allowed, true, "another visitor is unaffected");
});

test("a costly call uses more of the budget than a cheap one", async () => {
  const key = freshKey();
  // Budget of 10 units: one 10-unit call spends it all.
  assert.equal((await hit(key, { limit: 10, windowMs: MINUTE, cost: 10 })).allowed, true);
  assert.equal((await hit(key, { limit: 10, windowMs: MINUTE, cost: 1 })).allowed, false);
});

test("a call costing more than the whole budget is refused outright", async () => {
  const key = freshKey();
  assert.equal((await hit(key, { limit: 5, windowMs: MINUTE, cost: 10 })).allowed, false);
});

test("model weights track price: premium models cost more than fast ones", () => {
  assert.equal(modelWeight("claude-haiku-4-5"), 1);
  assert.equal(modelWeight("gemini-flash-latest"), 1);
  assert.ok(modelWeight("claude-sonnet-4-6") > modelWeight("claude-haiku-4-5"));
  assert.ok(modelWeight("claude-opus-4-8") > modelWeight("claude-sonnet-4-6"));
  assert.ok(modelWeight("gemini-pro-latest") > modelWeight("gemini-flash-latest"));
  // An unknown model is never treated as free.
  assert.ok(modelWeight("some-future-model") >= 1);
});
