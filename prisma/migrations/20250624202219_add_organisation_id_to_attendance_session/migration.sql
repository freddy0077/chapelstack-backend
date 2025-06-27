-- AlterTable
ALTER TABLE "AttendanceSession" ADD COLUMN     "organisationId" TEXT;

-- CreateIndex
CREATE INDEX "AttendanceSession_organisationId_idx" ON "AttendanceSession"("organisationId");

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
