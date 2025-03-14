-- CreateTable
CREATE TABLE IF NOT EXISTS "InstagramComment" (
  "id" SERIAL NOT NULL,
  "commentId" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InstagramComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InstagramMessage" (
  "id" SERIAL NOT NULL,
  "messageId" TEXT NOT NULL,
  "from" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InstagramMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InstagramMention" (
  "id" SERIAL NOT NULL,
  "mentionId" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InstagramMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InstagramStoryInsight" (
  "id" SERIAL NOT NULL,
  "storyId" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InstagramStoryInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InstagramComment_commentId_key" ON "InstagramComment"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InstagramMessage_messageId_key" ON "InstagramMessage"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InstagramMention_mentionId_key" ON "InstagramMention"("mentionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InstagramStoryInsight_storyId_metric_key" ON "InstagramStoryInsight"("storyId", "metric"); 