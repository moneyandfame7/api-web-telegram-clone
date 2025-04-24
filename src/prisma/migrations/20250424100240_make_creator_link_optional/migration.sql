-- DropForeignKey
ALTER TABLE "ChatInviteLink" DROP CONSTRAINT "ChatInviteLink_createdByMemberId_fkey";

-- AlterTable
ALTER TABLE "ChatInviteLink" ALTER COLUMN "createdByMemberId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatInviteLink" ADD CONSTRAINT "ChatInviteLink_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "ChatMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
