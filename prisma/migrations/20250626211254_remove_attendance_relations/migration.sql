/*
  Warnings:

  - You are about to drop the column `eventId` on the `AttendanceSession` table. All the data in the column will be lost.
  - You are about to drop the column `ministryId` on the `AttendanceSession` table. All the data in the column will be lost.
  - You are about to drop the column `smallGroupId` on the `AttendanceSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttendanceSession" DROP CONSTRAINT "AttendanceSession_eventId_fkey";

-- DropForeignKey
ALTER TABLE "AttendanceSession" DROP CONSTRAINT "AttendanceSession_ministryId_fkey";

-- DropForeignKey
ALTER TABLE "AttendanceSession" DROP CONSTRAINT "AttendanceSession_smallGroupId_fkey";

-- DropIndex
DROP INDEX "AttendanceSession_eventId_idx";

-- DropIndex
DROP INDEX "AttendanceSession_ministryId_idx";

-- DropIndex
DROP INDEX "AttendanceSession_smallGroupId_idx";

-- AlterTable
ALTER TABLE "AttendanceSession" DROP COLUMN "eventId",
DROP COLUMN "ministryId",
DROP COLUMN "smallGroupId";
