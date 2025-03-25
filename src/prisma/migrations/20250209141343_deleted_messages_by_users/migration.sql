-- CreateTable
CREATE TABLE "_DeletedMessagesByUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DeletedMessagesByUsers_AB_unique" ON "_DeletedMessagesByUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_DeletedMessagesByUsers_B_index" ON "_DeletedMessagesByUsers"("B");

-- AddForeignKey
ALTER TABLE "_DeletedMessagesByUsers" ADD CONSTRAINT "_DeletedMessagesByUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeletedMessagesByUsers" ADD CONSTRAINT "_DeletedMessagesByUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
