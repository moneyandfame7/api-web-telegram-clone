/*
  Warnings:

  - Added the required column `promotedByUserId` to the `ChatAdminPermissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatAdminPermissions" ADD COLUMN     "promotedByUserId" TEXT NOT NULL;
