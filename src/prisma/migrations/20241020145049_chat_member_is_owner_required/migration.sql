/*
  Warnings:

  - Made the column `isOwner` on table `ChatMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChatMember" ALTER COLUMN "isOwner" SET NOT NULL;
