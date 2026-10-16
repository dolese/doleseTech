import { test } from "node:test";
import assert from "node:assert/strict";

import { accessTerms, currentTerm, formatTzs, getProduct, monthKey, saleTerm, termEndLabel, termLabel } from "../src/lib/catalog";
import { statementText } from "../src/lib/pawapay";

// Times are given in UTC; Tanzania is UTC+3 all year.
const at = (iso: string) => new Date(iso);

test("terms follow the school year: January to June, July to December", () => {
  assert.equal(currentTerm(at("2026-01-05T08:00:00Z")), "2026-T1");
  assert.equal(currentTerm(at("2026-06-30T12:00:00Z")), "2026-T1");
  assert.equal(currentTerm(at("2026-07-01T08:00:00Z")), "2026-T2");
  assert.equal(termLabel("2026-T2"), "Term 2, 2026 (July to December)");
  assert.equal(termEndLabel("2027-T1"), "30 June 2027");
});

test("a pack bought in a term's final month is for the next term, and works at once", () => {
  assert.equal(saleTerm(at("2026-10-16T08:00:00Z")), "2026-T2");
  assert.deepEqual(accessTerms(at("2026-10-16T08:00:00Z")), ["2026-T2", "2026-T2"]);

  assert.equal(saleTerm(at("2026-06-10T08:00:00Z")), "2026-T2");
  assert.deepEqual(accessTerms(at("2026-06-10T08:00:00Z")), ["2026-T1", "2026-T2"]);

  assert.equal(saleTerm(at("2026-12-20T08:00:00Z")), "2027-T1");
  assert.deepEqual(accessTerms(at("2026-12-20T08:00:00Z")), ["2026-T2", "2027-T1"]);
});

test("months and terms change at midnight in Tanzania, not in UTC", () => {
  // 22:30 UTC on 31 October is 01:30 on 1 November in Dar es Salaam.
  assert.equal(monthKey(at("2026-10-31T22:30:00Z")), "2026-11");
  assert.equal(monthKey(at("2026-10-31T20:30:00Z")), "2026-10");
  // 21:30 UTC on 30 June is already 1 July: Term 2.
  assert.equal(currentTerm(at("2026-06-30T21:30:00Z")), "2026-T2");
});

test("products and prices", () => {
  assert.equal(getProduct("papers-10")?.price, 5000);
  assert.equal(getProduct("pack-o-level-biology")?.kind, "pack");
  assert.equal(getProduct("pack-o-level-chemistry"), undefined, "only fully written subjects are sold");
  assert.equal(formatTzs(5000), "TZS 5,000");
});

test("statement text meets pawaPay's rules: letters, digits and spaces, 4 to 22", () => {
  assert.equal(statementText("Dolese Tech DT-7K2M9Q"), "Dolese Tech DT 7K2M9Q");
  assert.ok(statementText("Dolese Tech DT-7K2M9Q and much more text").length <= 22);
  assert.equal(statementText("!!"), "Dolese Tech");
});
