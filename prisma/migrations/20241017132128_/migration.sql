/*
  Warnings:

  - You are about to drop the column `endTime` on the `DisabledTime` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `DisabledTime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DisabledTime" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "slot" TIMESTAMP(3),
ALTER COLUMN "date" DROP NOT NULL;
