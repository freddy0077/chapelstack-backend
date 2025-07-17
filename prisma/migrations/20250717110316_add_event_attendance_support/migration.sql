-- AlterTable
ALTER TABLE "AttendanceRecord" ADD COLUMN     "eventId" TEXT,
ALTER COLUMN "sessionId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "AttendanceRecord_eventId_idx" ON "AttendanceRecord"("eventId");

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
