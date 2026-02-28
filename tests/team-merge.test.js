import test from "node:test";
import assert from "node:assert/strict";
import { mergeSpaceItems } from "../lib/spaces/merge.js";

test("mergeSpaceItems deduplicates by identity and keeps wishlist as final status", () => {
  const sourceItems = [
    {
      id: "src-1",
      type: "movie",
      source: "tmdb",
      externalId: "42",
      title: "Interestelar",
      status: "completed",
      notes: "ya vista",
      posterImage: null,
      addedById: "user-a",
      contributors: ["user-a"]
    }
  ];

  const targetItems = [
    {
      id: "dst-1",
      type: "movie",
      source: "tmdb",
      externalId: "42",
      title: "Interestelar",
      status: "wishlist",
      notes: null,
      posterImage: "poster.jpg",
      addedById: "user-b",
      contributors: ["user-b"]
    }
  ];

  const out = mergeSpaceItems({ sourceItems, targetItems });
  assert.equal(out.toCreate.length, 0);
  assert.equal(out.toUpdate.length, 1);
  assert.equal(out.toUpdate[0].status, "wishlist");
  assert.deepEqual(out.toUpdate[0].contributors.sort(), ["user-a", "user-b"]);
});

test("mergeSpaceItems creates missing destination items", () => {
  const out = mergeSpaceItems({
    sourceItems: [
      {
        id: "src-1",
        type: "book",
        source: "openlibrary",
        externalId: "/works/OL1W",
        title: "Dune",
        status: "wishlist",
        notes: "leer juntos",
        posterImage: "cover.jpg",
        addedById: "user-a",
        contributors: ["user-a"]
      }
    ],
    targetItems: []
  });

  assert.equal(out.toCreate.length, 1);
  assert.equal(out.toUpdate.length, 0);
  assert.equal(out.toCreate[0].status, "wishlist");
  assert.deepEqual(out.toCreate[0].contributors, ["user-a"]);
});

