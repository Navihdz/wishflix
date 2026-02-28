import test from "node:test";
import assert from "node:assert/strict";
import {
  OPENLIBRARY_BOOK_SUBJECTS,
  OPENLIBRARY_COMIC_SUBJECTS
} from "../lib/providers/openlibrary.js";

test("book subjects include fantasy", () => {
  assert.ok(OPENLIBRARY_BOOK_SUBJECTS.find((item) => item.id === "fantasy"));
});

test("comic subjects include manga", () => {
  assert.ok(OPENLIBRARY_COMIC_SUBJECTS.find((item) => item.id === "manga"));
});
