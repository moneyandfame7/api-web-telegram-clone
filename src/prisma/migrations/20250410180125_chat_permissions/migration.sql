-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ChatMember" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "JoinRequests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "JoinRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatPermissions" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "sendMessages" BOOLEAN NOT NULL DEFAULT true,
    "addUsers" BOOLEAN NOT NULL DEFAULT true,
    "pinMessages" BOOLEAN NOT NULL DEFAULT true,
    "changeInfo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChatPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatAdminPermissions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "changeInfo" BOOLEAN NOT NULL DEFAULT true,
    "deleteMessages" BOOLEAN NOT NULL DEFAULT true,
    "banUsers" BOOLEAN NOT NULL DEFAULT true,
    "pinMessages" BOOLEAN NOT NULL DEFAULT true,
    "addNewAdmins" BOOLEAN NOT NULL DEFAULT false,
    "customTitle" TEXT,

    CONSTRAINT "ChatAdminPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatPermissions_chatId_key" ON "ChatPermissions"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatAdminPermissions_memberId_key" ON "ChatAdminPermissions"("memberId");

-- AddForeignKey
ALTER TABLE "JoinRequests" ADD CONSTRAINT "JoinRequests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequests" ADD CONSTRAINT "JoinRequests_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPermissions" ADD CONSTRAINT "ChatPermissions_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatAdminPermissions" ADD CONSTRAINT "ChatAdminPermissions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ChatMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
