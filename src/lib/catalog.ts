/**
 * What Dolese Tech sells in the pilot, and for how much.
 *
 * Prices are whole Tanzanian shillings. Change them here: orders record the
 * price they were sold at, so earlier purchases and receipts are unaffected.
 *
 * Subject packs are sold by school term, the way schools budget. The school
 * year has two terms — Term 1 from January to June, Term 2 from July to
 * December. A pack bought in the last month of a term (June or December) is
 * for the next term and covers the rest of the current one as well, so a
 * teacher preparing ahead never pays for a few weeks.
 */
import { getSubjectBySlug } from "./education";

export const FREE_PAPERS_PER_MONTH = 2;

export type Product =
  | { id: string; kind: "papers"; name: string; price: number; papers: number }
  | { id: string; kind: "pack"; name: string; price: number; subject: string };

/** Only subjects with complete, expert-written materials are sold. */
export const PACK_SUBJECTS = ["o-level-basic-mathematics", "o-level-biology"] as const;

const PAPERS_10: Product = { id: "papers-10", kind: "papers", name: "10 exam papers", price: 5000, papers: 10 };

const PACKS: Product[] = PACK_SUBJECTS.map((slug) => {
  const subject = getSubjectBySlug(slug);
  return {
    id: `pack-${slug}`,
    kind: "pack",
    name: `${subject?.name ?? slug} pack (${subject?.level ?? ""})`.replace(" ()", ""),
    price: 5000,
    subject: slug,
  };
});

export const PRODUCTS: Product[] = [PAPERS_10, ...PACKS];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function packFor(subjectSlug: string): Product | undefined {
  return PRODUCTS.find((p) => p.kind === "pack" && p.subject === subjectSlug);
}

/** "TZS 5,000" */
export function formatTzs(amount: number): string {
  return `TZS ${Math.trunc(amount).toLocaleString("en-US")}`;
}

// ── Time in Tanzania ────────────────────────────────────────────────────────

const TZ = "Africa/Dar_es_Salaam";

/** Year and month (1–12) in Tanzania, whatever the server's time zone. */
function tanzaniaYearMonth(date: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "numeric" }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month") };
}

/** "2026-10": the month free papers are counted in. */
export function monthKey(date = new Date()): string {
  const { year, month } = tanzaniaYearMonth(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

// ── Terms ───────────────────────────────────────────────────────────────────

/** "2026-T2" */
export type TermKey = string;

function termKey(year: number, term: 1 | 2): TermKey {
  return `${year}-T${term}`;
}

function parseTerm(key: TermKey): { year: number; term: 1 | 2 } {
  const m = /^(\d{4})-T([12])$/.exec(key);
  if (!m) throw new Error(`Not a term: ${key}`);
  return { year: Number(m[1]), term: Number(m[2]) as 1 | 2 };
}

export function currentTerm(date = new Date()): TermKey {
  const { year, month } = tanzaniaYearMonth(date);
  return termKey(year, month <= 6 ? 1 : 2);
}

export function nextTerm(key: TermKey): TermKey {
  const { year, term } = parseTerm(key);
  return term === 1 ? termKey(year, 2) : termKey(year + 1, 1);
}

function inFinalMonth(date: Date): boolean {
  const { month } = tanzaniaYearMonth(date);
  return month === 6 || month === 12;
}

/** The term a pack bought now is for. */
export function saleTerm(date = new Date()): TermKey {
  const term = currentTerm(date);
  return inFinalMonth(date) ? nextTerm(term) : term;
}

/** Packs for any of these terms give access now. */
export function accessTerms(date = new Date()): [TermKey, TermKey] {
  const term = currentTerm(date);
  return [term, inFinalMonth(date) ? nextTerm(term) : term];
}

/** "Term 2, 2026 (July to December)" */
export function termLabel(key: TermKey): string {
  const { year, term } = parseTerm(key);
  return `Term ${term}, ${year} (${term === 1 ? "January to June" : "July to December"})`;
}

/** "31 December 2026": the last day a term's pack works. */
export function termEndLabel(key: TermKey): string {
  const { year, term } = parseTerm(key);
  return term === 1 ? `30 June ${year}` : `31 December ${year}`;
}
