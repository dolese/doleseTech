export function chapterPath(name: string): string;
export function runChapter(
  markdown: string,
): Promise<{ sql: string; expected: string; actual: string; block: { start: number; end: number } | null }[]>;
