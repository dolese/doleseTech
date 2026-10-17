// Markdown files are imported as their raw text (see the webpack rule in
// next.config.mjs).
declare module "*.md" {
  const content: string;
  export default content;
}
