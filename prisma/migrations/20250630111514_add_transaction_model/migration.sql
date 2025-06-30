/*
  Warnings:

  - You are about to drop the column `backgroundCheckDate` on the `ChildrenMinistryVolunteer` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `ChildrenMinistryVolunteer` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ChildrenMinistryVolunteer` table. All the data in the column will be lost.
  - You are about to drop the column `trainingCompletionDate` on the `ChildrenMinistryVolunteer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberId,organisationId,branchId]` on the table `ChildrenMinistryVolunteer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organisationId,branchId]` on the table `ContributionType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organisationId,branchId]` on the table `ExpenseCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organisationId,branchId]` on the table `Fund` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organisationId,branchId]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,organisationId,branchId]` on the table `Series` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,organisationId,branchId]` on the table `Sermon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organisationId,branchId]` on the table `Speaker` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organisationId,branchId]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `backgroundCheckStatus` on table `ChildrenMinistryVolunteer` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CONTRIBUTION', 'EXPENSE', 'TRANSFER', 'FUND_ALLOCATION');

-- DropForeignKey
ALTER TABLE "ChildrenMinistryVolunteer" DROP CONSTRAINT "ChildrenMinistryVolunteer_branchId_fkey";

-- AlterTable
ALTER TABLE "ChildrenMinistryVolunteer" DROP COLUMN "backgroundCheckDate",
DROP COLUMN "isActive",
DROP COLUMN "notes",
DROP COLUMN "trainingCompletionDate",
ALTER COLUMN "backgroundCheckStatus" SET NOT NULL,
ALTER COLUMN "backgroundCheckStatus" SET DEFAULT 'PENDING',
ALTER COLUMN "branchId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "branchId" TEXT,
    "fundId" TEXT,
    "userId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChildrenMinistryVolunteer_memberId_organisationId_branchId_key" ON "ChildrenMinistryVolunteer"("memberId", "organisationId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "ContributionType_name_organisationId_branchId_key" ON "ContributionType"("name", "organisationId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_organisationId_branchId_key" ON "ExpenseCategory"("name", "organisationId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Fund_name_organisationId_branchId_key" ON "Fund"("name", "organisationId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_organisationId_branchId_key" ON "PaymentMethod"("name", "organisationId", "branchId");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Series_title_organisationId_branchId_key" ON "Series"("title", "organisationId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Sermon_title_organisationId_branchId_key" ON "Sermon"("title", "organisationId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Speaker_name_organisationId_branchId_key" ON "Speaker"("name", "organisationId", "branchId");

-- CreateIndex
CREATE INDEX "User_organisationId_idx" ON "User"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_organisationId_branchId_key" ON "Vendor"("name", "organisationId", "branchId");

-- AddForeignKey
ALTER TABLE "ChildrenMinistryVolunteer" ADD CONSTRAINT "ChildrenMinistryVolunteer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "email_template_unique_constraint" RENAME TO "EmailTemplate_name_organisationId_branchId_key";
