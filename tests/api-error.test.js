import test from "node:test";
import assert from "node:assert/strict";
import { readApiError } from "../lib/http/api-error.js";

function mockResponse({ jsonImpl, textImpl }) {
  return {
    json: jsonImpl || (async () => ({})),
    text: textImpl || (async () => "")
  };
}

test("readApiError returns JSON error when present", async () => {
  const response = mockResponse({
    jsonImpl: async () => ({ error: "Email ya registrado" })
  });
  const out = await readApiError(response, "fallback");
  assert.equal(out, "Email ya registrado");
});

test("readApiError falls back to text when JSON parsing fails", async () => {
  const response = mockResponse({
    jsonImpl: async () => {
      throw new SyntaxError("Unexpected end of JSON input");
    },
    textImpl: async () => "Error interno"
  });
  const out = await readApiError(response, "fallback");
  assert.equal(out, "Error interno");
});

test("readApiError returns fallback when body is empty", async () => {
  const response = mockResponse({
    jsonImpl: async () => {
      throw new SyntaxError("Unexpected end of JSON input");
    },
    textImpl: async () => ""
  });
  const out = await readApiError(response, "fallback");
  assert.equal(out, "fallback");
});

