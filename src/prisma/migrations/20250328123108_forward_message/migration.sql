-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "forwardFromMessageId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_forwardFromMessageId_fkey" FOREIGN KEY ("forwardFromMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
