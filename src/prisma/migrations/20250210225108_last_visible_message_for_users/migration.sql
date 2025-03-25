-- AlterTable
ALTER TABLE "ChatMember" ADD COLUMN     "lastVisibleMessageId" TEXT;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_lastVisibleMessageId_fkey" FOREIGN KEY ("lastVisibleMessageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
