import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLastVisitHomeSection,
  buildHomePreviewPayload,
  dedupeContentItems,
  shouldShowTmdbConfigHint
} from "../lib/providers/discover.js";

test("home payload builder returns sections", () => {
  const payload = buildHomePreviewPayload({
    mixedTrending: [{ title: "A" }],
    mixedRecent: [{ title: "B" }],
    mixedTop: [{ title: "C" }]
  });

  assert.equal(Array.isArray(payload.sections), true);
  assert.equal(payload.sections.length, 3);
});

test("tmdb config hint is true when tmdb disabled for movies", () => {
  assert.equal(shouldShowTmdbConfigHint({ tmdbEnabled: false, pageType: "movies" }), true);
  assert.equal(shouldShowTmdbConfigHint({ tmdbEnabled: true, pageType: "movies" }), false);
  assert.equal(shouldShowTmdbConfigHint({ tmdbEnabled: false, pageType: "books" }), false);
});

test("dedupeContentItems removes repeated items by identity", () => {
  const out = dedupeContentItems([
    { type: "comic", source: "openlibrary", external_id: "/works/OL1W", title: "A" },
    { type: "comic", source: "openlibrary", external_id: "/works/OL1W", title: "A" },
    { type: "comic", source: "openlibrary", external_id: "/works/OL2W", title: "B" }
  ]);

  assert.equal(out.length, 2);
});

test("buildLastVisitHomeSection returns user-personalized novelty rail", () => {
  const section = buildLastVisitHomeSection({
    lastVisitedAt: new Date("2026-02-20T00:00:00Z"),
    now: new Date("2026-02-24T12:00:00Z"),
    sections: [
      {
        id: "a",
        items: [
          {
            type: "movie",
            source: "tmdb",
            external_id: "1",
            title: "Nueva",
            year: "2026",
            released_at: "2026-02-23"
          },
          {
            type: "movie",
            source: "tmdb",
            external_id: "2",
            title: "Vieja",
            year: "2024",
            released_at: "2024-01-01"
          }
        ]
      }
    ]
  });

  assert.equal(section.id, "home-new-since-last-visit");
  assert.equal(section.supportsIncremental, false);
  assert.equal(Array.isArray(section.items), true);
  assert.equal(section.items.length > 0, true);
});
