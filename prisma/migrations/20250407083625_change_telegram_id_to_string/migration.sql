/*
  Warnings:

  - You are about to drop the column `telegramChatId` on the `Chat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telegramId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telegramId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Chat_telegramChatId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "telegramChatId",
ADD COLUMN     "telegramId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "telegramId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_telegramId_key" ON "Chat"("telegramId");
