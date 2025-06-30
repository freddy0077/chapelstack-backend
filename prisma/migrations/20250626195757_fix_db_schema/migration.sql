/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AttendanceSession` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AttendanceSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organisationId]` on the table `OnboardingProgress` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AttendanceSession" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "ministryId" TEXT,
ADD COLUMN     "smallGroupId" TEXT;

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "CheckInRecord" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "ChildrenEvent" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "ChildrenMinistryVolunteer" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "ContributionType" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "EmailMessage" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "ExpenseCategory" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "FormSubmission" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Fund" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Guardian" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "OnboardingProgress" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Pledge" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "ScheduledReport" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Series" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Sermon" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "SmsMessage" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Speaker" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "UserDashboardPreference" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "organisationId" TEXT,
ALTER COLUMN "phone" SET NOT NULL;

-- AddColumn
ALTER TABLE "ChildrenMinistryVolunteer" ADD COLUMN "trainingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "AttendanceSession_ministryId_idx" ON "AttendanceSession"("ministryId");

-- CreateIndex
CREATE INDEX "AttendanceSession_smallGroupId_idx" ON "AttendanceSession"("smallGroupId");

-- CreateIndex
CREATE INDEX "AttendanceSession_eventId_idx" ON "AttendanceSession"("eventId");

-- CreateIndex
CREATE INDEX "Batch_organisationId_idx" ON "Batch"("organisationId");

-- CreateIndex
CREATE INDEX "Budget_organisationId_idx" ON "Budget"("organisationId");

-- CreateIndex
CREATE INDEX "CheckInRecord_organisationId_idx" ON "CheckInRecord"("organisationId");

-- CreateIndex
CREATE INDEX "Child_organisationId_idx" ON "Child"("organisationId");

-- CreateIndex
CREATE INDEX "ChildrenEvent_organisationId_idx" ON "ChildrenEvent"("organisationId");

-- CreateIndex
CREATE INDEX "ChildrenMinistryVolunteer_organisationId_idx" ON "ChildrenMinistryVolunteer"("organisationId");

-- CreateIndex
CREATE INDEX "Contribution_organisationId_idx" ON "Contribution"("organisationId");

-- CreateIndex
CREATE INDEX "ContributionType_organisationId_idx" ON "ContributionType"("organisationId");

-- CreateIndex
CREATE INDEX "EmailMessage_organisationId_idx" ON "EmailMessage"("organisationId");

-- CreateIndex
CREATE INDEX "EmailTemplate_organisationId_idx" ON "EmailTemplate"("organisationId");

-- CreateIndex
CREATE INDEX "Expense_organisationId_idx" ON "Expense"("organisationId");

-- CreateIndex
CREATE INDEX "ExpenseCategory_organisationId_idx" ON "ExpenseCategory"("organisationId");

-- CreateIndex
CREATE INDEX "Form_organisationId_idx" ON "Form"("organisationId");

-- CreateIndex
CREATE INDEX "FormSubmission_organisationId_idx" ON "FormSubmission"("organisationId");

-- CreateIndex
CREATE INDEX "Fund_organisationId_idx" ON "Fund"("organisationId");

-- CreateIndex
CREATE INDEX "Guardian_organisationId_idx" ON "Guardian"("organisationId");

-- CreateIndex
CREATE INDEX "MediaItem_organisationId_idx" ON "MediaItem"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");

-- CreateIndex
CREATE INDEX "Notification_organisationId_idx" ON "Notification"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgress_organisationId_key" ON "OnboardingProgress"("organisationId");

-- CreateIndex
CREATE INDEX "OnboardingProgress_organisationId_idx" ON "OnboardingProgress"("organisationId");

-- CreateIndex
CREATE INDEX "PaymentMethod_organisationId_idx" ON "PaymentMethod"("organisationId");

-- CreateIndex
CREATE INDEX "Pledge_organisationId_idx" ON "Pledge"("organisationId");

-- CreateIndex
CREATE INDEX "PrayerRequest_organisationId_idx" ON "PrayerRequest"("organisationId");

-- CreateIndex
CREATE INDEX "ScheduledReport_organisationId_idx" ON "ScheduledReport"("organisationId");

-- CreateIndex
CREATE INDEX "Series_organisationId_idx" ON "Series"("organisationId");

-- CreateIndex
CREATE INDEX "Sermon_organisationId_idx" ON "Sermon"("organisationId");

-- CreateIndex
CREATE INDEX "SmsMessage_organisationId_idx" ON "SmsMessage"("organisationId");

-- CreateIndex
CREATE INDEX "Speaker_organisationId_idx" ON "Speaker"("organisationId");

-- CreateIndex
CREATE INDEX "UserDashboardPreference_organisationId_idx" ON "UserDashboardPreference"("organisationId");

-- CreateIndex
CREATE INDEX "Vendor_organisationId_idx" ON "Vendor"("organisationId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "email_template_unique_constraint" ON "EmailTemplate"("name", "organisationId", "branchId");

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_smallGroupId_fkey" FOREIGN KEY ("smallGroupId") REFERENCES "SmallGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionType" ADD CONSTRAINT "ContributionType_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaItem" ADD CONSTRAINT "MediaItem_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInRecord" ADD CONSTRAINT "CheckInRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildrenMinistryVolunteer" ADD CONSTRAINT "ChildrenMinistryVolunteer_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildrenEvent" ADD CONSTRAINT "ChildrenEvent_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReport" ADD CONSTRAINT "ScheduledReport_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDashboardPreference" ADD CONSTRAINT "UserDashboardPreference_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
