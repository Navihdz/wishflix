import test from "node:test";
import assert from "node:assert/strict";
import { getRailScrollStep, scrollRailByDirection } from "../lib/ui/rail-scroll.js";

test("getRailScrollStep uses 80% of visible width with minimum fallback", () => {
  assert.equal(getRailScrollStep(1000), 800);
  assert.equal(getRailScrollStep(0), 240);
  assert.equal(getRailScrollStep(undefined), 240);
});

test("scrollRailByDirection scrolls right and left smoothly", () => {
  const calls = [];
  const rail = {
    clientWidth: 500,
    scrollBy(options) {
      calls.push(options);
    }
  };

  scrollRailByDirection(rail, "next");
  scrollRailByDirection(rail, "prev");

  assert.deepEqual(calls, [
    { left: 400, behavior: "smooth" },
    { left: -400, behavior: "smooth" }
  ]);
});

test("scrollRailByDirection is a no-op without a valid element", () => {
  assert.doesNotThrow(() => scrollRailByDirection(null, "next"));
  assert.doesNotThrow(() => scrollRailByDirection({}, "next"));
});
