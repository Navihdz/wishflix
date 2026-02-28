import test from "node:test";
import assert from "node:assert/strict";
import { compactSections, buildExplorePayload } from "../lib/providers/explore-sections.js";

test("compactSections removes empty rails", () => {
  const sections = compactSections([
    { id: "a", title: "A", items: [{ title: "x" }] },
    { id: "b", title: "B", items: [] }
  ]);

  assert.equal(sections.length, 1);
  assert.equal(sections[0].id, "a");
});

test("buildExplorePayload returns stable hero and sections shape", () => {
  const payload = buildExplorePayload({
    hero: { title: "Hero" },
    sections: [{ id: "x", title: "X", items: [{ title: "1" }] }]
  });

  assert.equal(payload.hero.title, "Hero");
  assert.equal(Array.isArray(payload.sections), true);
  assert.equal(payload.sections.length, 1);
});
