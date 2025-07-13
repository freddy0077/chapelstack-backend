/*
  Warnings:

  - The `status` column on the `TransferRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TransferRequest" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- DropEnum
DROP TYPE "TransferStatus";

-- CreateIndex
CREATE INDEX "TransferRequest_status_idx" ON "TransferRequest"("status");
