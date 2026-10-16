import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { runChapter } from "../scripts/handbook-sql.mjs";

// Every SQL example in a chapter runs, in order, on a fresh PostgreSQL, and
// every result the chapter prints must be what PostgreSQL really returns.
// `node scripts/handbook-sql.mjs <chapter> --write` regenerates the results.
const dir = join(__dirname, "..", "src", "content", "handbook");

for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const markdown = readFileSync(join(dir, file), "utf8").replace(/\r\n/g, "\n");
  if (!markdown.includes("```sql")) continue;
  test(`${file}: every printed SQL result is what PostgreSQL returns`, { timeout: 120_000 }, async () => {
    for (const check of await runChapter(markdown)) {
      assert.equal(check.actual, check.expected, `after:\n${check.sql}`);
    }
  });
}
