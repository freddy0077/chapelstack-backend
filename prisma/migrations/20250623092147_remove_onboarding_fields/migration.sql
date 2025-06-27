/*
  Warnings:

  - You are about to drop the column `branches` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `denomination` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `fontFamily` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `foundingYear` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `missionStatement` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `tertiaryColor` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `vision` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Branch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "branches",
DROP COLUMN "currency",
DROP COLUMN "denomination",
DROP COLUMN "description",
DROP COLUMN "fontFamily",
DROP COLUMN "foundingYear",
DROP COLUMN "missionStatement",
DROP COLUMN "primaryColor",
DROP COLUMN "secondaryColor",
DROP COLUMN "size",
DROP COLUMN "tertiaryColor",
DROP COLUMN "timezone",
DROP COLUMN "vision",
DROP COLUMN "zipCode";
