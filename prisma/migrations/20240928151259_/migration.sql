/*
  Warnings:

  - Added the required column `name` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Made the column `phoneNumber` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "phoneNumber" SET NOT NULL;
