/*
  Warnings:

  - A unique constraint covering the columns `[chatId,userId]` on the table `ChatMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatMember_chatId_userId_key" ON "ChatMember"("chatId", "userId");
