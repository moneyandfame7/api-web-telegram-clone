/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `Chat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[publicLink]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[inviteLinkId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "isPrivate",
ADD COLUMN     "allowSavingContent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inviteLinkId" TEXT,
ADD COLUMN     "publicLink" TEXT;

-- AlterTable
ALTER TABLE "ChatMember" ADD COLUMN     "joinedViaLinkId" TEXT;

-- CreateTable
CREATE TABLE "ChatInviteLink" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "limitUserCount" INTEGER,
    "isPrimary" BOOLEAN NOT NULL,
    "adminApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdByMemberId" TEXT NOT NULL,
    "additionalInChatId" TEXT,

    CONSTRAINT "ChatInviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_publicLink_key" ON "Chat"("publicLink");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_inviteLinkId_key" ON "Chat"("inviteLinkId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_inviteLinkId_fkey" FOREIGN KEY ("inviteLinkId") REFERENCES "ChatInviteLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatInviteLink" ADD CONSTRAINT "ChatInviteLink_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "ChatMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatInviteLink" ADD CONSTRAINT "ChatInviteLink_additionalInChatId_fkey" FOREIGN KEY ("additionalInChatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_joinedViaLinkId_fkey" FOREIGN KEY ("joinedViaLinkId") REFERENCES "ChatInviteLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
