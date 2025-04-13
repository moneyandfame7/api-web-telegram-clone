/*
  Warnings:

  - Made the column `chatId` on table `ChatMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChatMember" ALTER COLUMN "chatId" SET NOT NULL;
