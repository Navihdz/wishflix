-- Add active space pointer for users
ALTER TABLE "User" ADD COLUMN "activeSpaceId" TEXT;

-- Add join code for spaces
ALTER TABLE "Space" ADD COLUMN "joinCode" TEXT;

-- Backfill joinCode with deterministic unique-like values
UPDATE "Space"
SET "joinCode" = UPPER(SUBSTR(REPLACE("id", '-', ''), 1, 4) || PRINTF('%02X', (rowid % 256)))
WHERE "joinCode" IS NULL;

-- Backfill activeSpaceId from first membership
UPDATE "User"
SET "activeSpaceId" = (
  SELECT "spaceId"
  FROM "SpaceMember"
  WHERE "SpaceMember"."userId" = "User"."id"
  ORDER BY "SpaceMember"."id" ASC
  LIMIT 1
)
WHERE "activeSpaceId" IS NULL;

-- Contributor pivot for multi-author items
CREATE TABLE "ItemContributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ItemContributor_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemContributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill contributors from legacy addedById
INSERT OR IGNORE INTO "ItemContributor" ("id", "itemId", "userId")
SELECT lower(hex(randomblob(12))), "id", "addedById" FROM "Item";

-- Indexes
CREATE UNIQUE INDEX "Space_joinCode_key" ON "Space"("joinCode");
CREATE UNIQUE INDEX "ItemContributor_itemId_userId_key" ON "ItemContributor"("itemId", "userId");
CREATE INDEX "ItemContributor_userId_idx" ON "ItemContributor"("userId");

