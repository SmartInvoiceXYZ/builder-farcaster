-- CreateTable
CREATE TABLE "Queue" (
    "taskId" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "completedAt" DATETIME
);
