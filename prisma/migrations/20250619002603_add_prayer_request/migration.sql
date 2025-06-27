-- CreateEnum
CREATE TYPE "PrayerRequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'ANSWERED');

-- CreateTable
CREATE TABLE "PrayerRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "requestText" TEXT NOT NULL,
    "status" "PrayerRequestStatus" NOT NULL DEFAULT 'NEW',
    "assignedPastorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrayerRequest_branchId_idx" ON "PrayerRequest"("branchId");

-- CreateIndex
CREATE INDEX "PrayerRequest_memberId_idx" ON "PrayerRequest"("memberId");

-- CreateIndex
CREATE INDEX "PrayerRequest_assignedPastorId_idx" ON "PrayerRequest"("assignedPastorId");

-- CreateIndex
CREATE INDEX "PrayerRequest_status_idx" ON "PrayerRequest"("status");

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_assignedPastorId_fkey" FOREIGN KEY ("assignedPastorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
