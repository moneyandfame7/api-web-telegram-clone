-- CreateEnum
CREATE TYPE "ChatPrivacyType" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "privacyType" "ChatPrivacyType" NOT NULL DEFAULT 'PRIVATE';
