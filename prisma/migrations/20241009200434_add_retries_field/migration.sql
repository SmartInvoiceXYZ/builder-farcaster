-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Queue" (
    "taskId" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "retries" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME
);
INSERT INTO "new_Queue" ("completedAt", "data", "status", "taskId", "timestamp") SELECT "completedAt", "data", "status", "taskId", "timestamp" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
