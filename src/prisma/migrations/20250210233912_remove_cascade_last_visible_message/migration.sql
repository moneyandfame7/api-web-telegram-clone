-- DropForeignKey
ALTER TABLE "ChatMember" DROP CONSTRAINT "ChatMember_lastVisibleMessageId_fkey";

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_lastVisibleMessageId_fkey" FOREIGN KEY ("lastVisibleMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
