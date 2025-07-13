-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "sourceBranchId" TEXT NOT NULL,
    "sourceBranchName" TEXT NOT NULL,
    "destinationBranchId" TEXT NOT NULL,
    "destinationBranchName" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'pending',
    "reason" TEXT NOT NULL,
    "transferData" TEXT[] NOT NULL,
    "approvedDate" TIMESTAMP(3),
    "rejectedDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_sourceBranchId_fkey" FOREIGN KEY ("sourceBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_destinationBranchId_fkey" FOREIGN KEY ("destinationBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "TransferRequest_memberId_idx" ON "TransferRequest"("memberId");

-- CreateIndex
CREATE INDEX "TransferRequest_sourceBranchId_idx" ON "TransferRequest"("sourceBranchId");

-- CreateIndex
CREATE INDEX "TransferRequest_destinationBranchId_idx" ON "TransferRequest"("destinationBranchId");

-- CreateIndex
CREATE INDEX "TransferRequest_status_idx" ON "TransferRequest"("status");

-- CreateIndex
CREATE INDEX "TransferRequest_requestDate_idx" ON "TransferRequest"("requestDate");
