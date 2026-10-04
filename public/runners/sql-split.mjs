// Splits a SQL script into statements the way psql does: on semicolons that are
// outside quotes, dollar-quoted bodies ($$ ... $$) and comments. psql
// backslash commands (\d, \c ...) are dropped because there is no psql here.
export function splitSql(script) {
  const statements = [];
  let current = "";
  let i = 0;
  const s = script;

  const push = () => {
    const text = current.trim();
    if (text && !/^(--[^\n]*\n?\s*)*$/.test(text)) statements.push(text);
    current = "";
  };

  while (i < s.length) {
    const ch = s[i];
    const next = s[i + 1];

    // Line starting with a backslash: psql meta-command
    if (ch === "\\" && /(^|\n)\s*$/.test(current)) {
      const end = s.indexOf("\n", i);
      i = end === -1 ? s.length : end + 1;
      continue;
    }
    if (ch === "-" && next === "-") {
      const end = s.indexOf("\n", i);
      const stop = end === -1 ? s.length : end;
      current += s.slice(i, stop);
      i = stop;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = s.indexOf("*/", i + 2);
      const stop = end === -1 ? s.length : end + 2;
      current += s.slice(i, stop);
      i = stop;
      continue;
    }
    if (ch === "'" || ch === '"') {
      let j = i + 1;
      while (j < s.length) {
        if (s[j] === ch && s[j + 1] === ch) j += 2;
        else if (s[j] === ch) break;
        else j++;
      }
      current += s.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (ch === "$") {
      const tag = /^\$[A-Za-z_]*\$/.exec(s.slice(i));
      if (tag) {
        const end = s.indexOf(tag[0], i + tag[0].length);
        const stop = end === -1 ? s.length : end + tag[0].length;
        current += s.slice(i, stop);
        i = stop;
        continue;
      }
    }
    if (ch === ";") {
      current += ";";
      push();
      i++;
      continue;
    }
    current += ch;
    i++;
  }
  push();
  return statements;
}
