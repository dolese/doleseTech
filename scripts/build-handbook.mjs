// Builds the Dolese Tech IT Handbook PDF from the site's print page.
//
//   npm run build:handbook                 whole book (written chapters)
//   npm run build:handbook -- 7            one chapter, with cover and contents
//
// Needs the site running (npm run dev). Set HANDBOOK_URL to print from
// another address, and CHROME_PATH if Chrome or Edge isn't found by itself.
// The PDF lands in dist/handbook/, which git ignores: it is a product file.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const chapters = process.argv[2] ?? "all";
const base = (process.env.HANDBOOK_URL ?? "http://localhost:3021").replace(/\/$/, "");
const url = `${base}/handbook/print?chapters=${encodeURIComponent(chapters)}`;

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("build-handbook: no Chrome or Edge found. Set CHROME_PATH.");
  process.exit(1);
}

const outDir = join(root, "dist", "handbook");
mkdirSync(outDir, { recursive: true });
const name = chapters === "all" ? "Dolese-Tech-IT-Handbook.pdf" : `Dolese-Tech-IT-Handbook-chapter-${chapters.replace(/,/g, "-")}.pdf`;
const out = join(outDir, name);

console.log(`build-handbook: printing ${url}`);
execFileSync(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--generate-pdf-document-outline",
    "--run-all-compositor-stages-before-draw",
    // Time for the web fonts to arrive before printing.
    "--virtual-time-budget=20000",
    `--print-to-pdf=${out}`,
    url,
  ],
  { stdio: "ignore", timeout: 180_000 },
);

if (!existsSync(out) || statSync(out).size < 10_000) {
  console.error("build-handbook: the PDF was not produced. Is the site running at " + base + "?");
  process.exit(1);
}
console.log(`build-handbook: ${out} (${Math.round(statSync(out).size / 1024)} KB)`);
