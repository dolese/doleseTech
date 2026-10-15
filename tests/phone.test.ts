import { test } from "node:test";
import assert from "node:assert/strict";

import { displayPhone, networkFor, normalisePhone } from "../src/lib/phone";

test("every common way of writing a number gives the same account", () => {
  const forms = ["0754312908", "0754 312 908", "+255 754 312 908", "255754312908", "754312908", "+255-754-312-908"];
  for (const f of forms) assert.equal(normalisePhone(f), "255754312908", f);
});

test("numbers that are not Tanzanian mobiles are refused", () => {
  for (const bad of ["", "12345", "0222123456", "0854312908", "07543129", "075431290812", "abc"]) {
    assert.equal(normalisePhone(bad), null, bad);
  }
});

test("each network is recognised from its prefix", () => {
  assert.equal(networkFor("255754312908")?.name, "Vodacom M-Pesa");
  assert.equal(networkFor("255654312908")?.name, "Mixx by Yas");
  assert.equal(networkFor("255714312908")?.name, "Mixx by Yas");
  assert.equal(networkFor("255684312908")?.name, "Airtel Money");
  assert.equal(networkFor("255784312908")?.name, "Airtel Money");
  assert.equal(networkFor("255624312908")?.name, "HaloPesa");
});

test("TTCL is a valid number but has no mobile money network", () => {
  assert.equal(normalisePhone("0734312908"), "255734312908");
  assert.equal(networkFor("255734312908"), null);
});

test("numbers display the way people write them", () => {
  assert.equal(displayPhone("255754312908"), "0754 312 908");
});
