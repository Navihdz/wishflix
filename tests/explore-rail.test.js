import test from "node:test";
import assert from "node:assert/strict";
import {
  mergeUniqueRailItems,
  buildLoopRenderItems,
  getLoopResetScrollLeft
} from "../lib/ui/explore-rail.js";

test("mergeUniqueRailItems appends only new identities", () => {
  const a = { type: "movie", source: "tmdb", external_id: "1", title: "A" };
  const b = { type: "movie", source: "tmdb", external_id: "2", title: "B" };
  const bDup = { type: "movie", source: "tmdb", external_id: "2", title: "B2" };
  const c = { type: "movie", source: "tmdb", external_id: "3", title: "C" };

  const out = mergeUniqueRailItems([a, b], [bDup, c]);

  assert.equal(out.length, 3);
  assert.deepEqual(out.map((item) => item.external_id), ["1", "2", "3"]);
});

test("buildLoopRenderItems duplicates list only when loop is enabled", () => {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
  assert.equal(buildLoopRenderItems(items, false).length, 3);
  assert.equal(buildLoopRenderItems(items, true).length, 6);
  assert.equal(buildLoopRenderItems([{ id: 1 }], true).length, 1);
});

test("getLoopResetScrollLeft returns wrapped position only after crossing duplicate midpoint", () => {
  assert.equal(getLoopResetScrollLeft({ scrollLeft: 90, scrollWidth: 200, loopEnabled: true }), null);
  assert.equal(getLoopResetScrollLeft({ scrollLeft: 110, scrollWidth: 200, loopEnabled: true }), 10);
  assert.equal(getLoopResetScrollLeft({ scrollLeft: 110, scrollWidth: 200, loopEnabled: false }), null);
});
