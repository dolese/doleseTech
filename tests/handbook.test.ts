import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Each chapter's finished project files live in examples/<chapter>/, where
// they are checked and run before printing. The chapter must print them
// exactly, so the book can never drift from the code that was tested.
const dir = join(__dirname, "..", "src", "content", "handbook");
const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");

for (const chapter of readdirSync(join(dir, "examples"))) {
  const markdown = read(join(dir, `${chapter}.md`));
  for (const file of readdirSync(join(dir, "examples", chapter))) {
    test(`chapter ${chapter} prints ${file} exactly as tested`, () => {
      const code = read(join(dir, "examples", chapter, file)).trimEnd();
      assert.ok(markdown.includes("\n" + code + "\n```"), `${file} differs from its listing in ${chapter}.md`);
    });
  }
}
