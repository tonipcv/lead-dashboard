-- CreateTable
CREATE TABLE "WhatsAppConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "qrCode" TEXT,
    "updatedAt" DATETIME NOT NULL
);
