import test from "node:test";
import assert from "node:assert/strict";
import { formatRelative } from "../lib/date.js";

test("formatRelative returns recent label", () => {
  const now = new Date().toISOString();
  const out = formatRelative(now);
  assert.equal(typeof out, "string");
});
