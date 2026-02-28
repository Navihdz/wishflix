import test from "node:test";
import assert from "node:assert/strict";
import { buildTmdbPath, TMDB_PROVIDER_IDS } from "../lib/providers/tmdb.js";

test("buildTmdbPath appends query params correctly", () => {
  const path = buildTmdbPath("/discover/movie", { with_genres: "18", page: 1 });
  assert.match(path, /with_genres=18/);
  assert.match(path, /page=1/);
  assert.match(path, /^\/discover\/movie\?/);
});

test("provider ids include netflix and disney+", () => {
  assert.ok(TMDB_PROVIDER_IDS.NETFLIX);
  assert.ok(TMDB_PROVIDER_IDS.DISNEY_PLUS);
});
