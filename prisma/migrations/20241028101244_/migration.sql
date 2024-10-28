/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatId" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "User_chatId_key" ON "User"("chatId");
