import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("prisma schema defines Item model", () => {
  const content = fs.readFileSync("prisma/schema.prisma", "utf8");
  assert.equal(content.includes("model Item"), true);
});
