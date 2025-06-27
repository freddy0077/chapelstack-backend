/*
  Warnings:

  - You are about to drop the column `fontFamily` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `tertiaryColor` on the `Organisation` table. All the data in the column will be lost.
  - The primary key for the `UserBranch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `primaryColor` on table `Organisation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `secondaryColor` on table `Organisation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "fontFamily",
DROP COLUMN "tertiaryColor",
ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "brandFont" TEXT,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "slogan" TEXT,
ADD COLUMN     "socialHandle" TEXT,
ALTER COLUMN "primaryColor" SET NOT NULL,
ALTER COLUMN "secondaryColor" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserBranch" DROP CONSTRAINT "UserBranch_pkey",
ALTER COLUMN "branchId" DROP NOT NULL,
ADD CONSTRAINT "UserBranch_pkey" PRIMARY KEY ("userId", "roleId");
