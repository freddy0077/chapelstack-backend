/*
  Warnings:

  - You are about to drop the column `channel` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'SCHEDULED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'EVENT_REMINDER');

-- CreateEnum
CREATE TYPE "SacramentType" AS ENUM ('BAPTISM', 'EUCHARIST_FIRST_COMMUNION', 'CONFIRMATION', 'RECONCILIATION_FIRST', 'ANOINTING_OF_THE_SICK', 'HOLY_ORDERS_DIACONATE', 'HOLY_ORDERS_PRIESTHOOD', 'MATRIMONY', 'RCIA_INITIATION', 'OTHER');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_memberId_fkey";

-- DropIndex
DROP INDEX "Notification_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_memberId_idx";

-- DropIndex
DROP INDEX "Notification_status_idx";

-- DropIndex
DROP INDEX "Notification_type_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "channel",
DROP COLUMN "metadata",
DROP COLUMN "sentAt",
DROP COLUMN "status",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL,
ALTER COLUMN "memberId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "senderEmail" TEXT NOT NULL,
    "recipients" TEXT[],
    "sentAt" TIMESTAMP(3),
    "status" "MessageStatus" NOT NULL,
    "branchId" TEXT,
    "templateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsMessage" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "senderNumber" TEXT NOT NULL,
    "recipients" TEXT[],
    "sentAt" TIMESTAMP(3),
    "status" "MessageStatus" NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "memberId" TEXT NOT NULL,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SacramentalRecord" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "sacramentType" "SacramentType" NOT NULL,
    "dateOfSacrament" TIMESTAMP(3) NOT NULL,
    "locationOfSacrament" TEXT NOT NULL,
    "officiantName" TEXT NOT NULL,
    "officiantId" TEXT,
    "godparent1Name" TEXT,
    "godparent2Name" TEXT,
    "sponsorName" TEXT,
    "witness1Name" TEXT,
    "witness2Name" TEXT,
    "certificateNumber" TEXT,
    "certificateUrl" TEXT,
    "notes" TEXT,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SacramentalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "allergies" TEXT,
    "specialNeeds" TEXT,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "photoConsent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "relationship" TEXT NOT NULL,
    "isPrimaryGuardian" BOOLEAN NOT NULL DEFAULT false,
    "canPickup" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildGuardianRelation" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildGuardianRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckInRecord" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "eventId" TEXT,
    "checkedInById" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedOutById" TEXT,
    "checkedOutAt" TIMESTAMP(3),
    "guardianIdAtCheckIn" TEXT NOT NULL,
    "guardianIdAtCheckOut" TEXT,
    "notes" TEXT,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckInRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildrenMinistryVolunteer" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "backgroundCheckDate" TIMESTAMP(3),
    "backgroundCheckStatus" TEXT,
    "trainingCompletionDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildrenMinistryVolunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildrenEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "ageRange" TEXT,
    "capacity" INTEGER,
    "volunteersNeeded" INTEGER,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildrenEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerEventAssignment" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerEventAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailTemplate_branchId_idx" ON "EmailTemplate"("branchId");

-- CreateIndex
CREATE INDEX "EmailMessage_branchId_idx" ON "EmailMessage"("branchId");

-- CreateIndex
CREATE INDEX "EmailMessage_templateId_idx" ON "EmailMessage"("templateId");

-- CreateIndex
CREATE INDEX "SmsMessage_branchId_idx" ON "SmsMessage"("branchId");

-- CreateIndex
CREATE INDEX "MemberNotification_memberId_idx" ON "MemberNotification"("memberId");

-- CreateIndex
CREATE INDEX "MemberNotification_type_idx" ON "MemberNotification"("type");

-- CreateIndex
CREATE INDEX "MemberNotification_status_idx" ON "MemberNotification"("status");

-- CreateIndex
CREATE INDEX "MemberNotification_createdAt_idx" ON "MemberNotification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SacramentalRecord_certificateNumber_key" ON "SacramentalRecord"("certificateNumber");

-- CreateIndex
CREATE INDEX "SacramentalRecord_memberId_idx" ON "SacramentalRecord"("memberId");

-- CreateIndex
CREATE INDEX "SacramentalRecord_branchId_idx" ON "SacramentalRecord"("branchId");

-- CreateIndex
CREATE INDEX "SacramentalRecord_sacramentType_idx" ON "SacramentalRecord"("sacramentType");

-- CreateIndex
CREATE INDEX "SacramentalRecord_dateOfSacrament_idx" ON "SacramentalRecord"("dateOfSacrament");

-- CreateIndex
CREATE INDEX "SacramentalRecord_certificateNumber_idx" ON "SacramentalRecord"("certificateNumber");

-- CreateIndex
CREATE INDEX "Child_branchId_idx" ON "Child"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_memberId_key" ON "Guardian"("memberId");

-- CreateIndex
CREATE INDEX "Guardian_branchId_idx" ON "Guardian"("branchId");

-- CreateIndex
CREATE INDEX "Guardian_memberId_idx" ON "Guardian"("memberId");

-- CreateIndex
CREATE INDEX "ChildGuardianRelation_childId_idx" ON "ChildGuardianRelation"("childId");

-- CreateIndex
CREATE INDEX "ChildGuardianRelation_guardianId_idx" ON "ChildGuardianRelation"("guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildGuardianRelation_childId_guardianId_key" ON "ChildGuardianRelation"("childId", "guardianId");

-- CreateIndex
CREATE INDEX "CheckInRecord_childId_idx" ON "CheckInRecord"("childId");

-- CreateIndex
CREATE INDEX "CheckInRecord_eventId_idx" ON "CheckInRecord"("eventId");

-- CreateIndex
CREATE INDEX "CheckInRecord_branchId_idx" ON "CheckInRecord"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildrenMinistryVolunteer_memberId_key" ON "ChildrenMinistryVolunteer"("memberId");

-- CreateIndex
CREATE INDEX "ChildrenMinistryVolunteer_memberId_idx" ON "ChildrenMinistryVolunteer"("memberId");

-- CreateIndex
CREATE INDEX "ChildrenMinistryVolunteer_branchId_idx" ON "ChildrenMinistryVolunteer"("branchId");

-- CreateIndex
CREATE INDEX "ChildrenEvent_branchId_idx" ON "ChildrenEvent"("branchId");

-- CreateIndex
CREATE INDEX "VolunteerEventAssignment_volunteerId_idx" ON "VolunteerEventAssignment"("volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerEventAssignment_eventId_idx" ON "VolunteerEventAssignment"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerEventAssignment_volunteerId_eventId_key" ON "VolunteerEventAssignment"("volunteerId", "eventId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberNotification" ADD CONSTRAINT "MemberNotification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacramentalRecord" ADD CONSTRAINT "SacramentalRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacramentalRecord" ADD CONSTRAINT "SacramentalRecord_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildGuardianRelation" ADD CONSTRAINT "ChildGuardianRelation_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildGuardianRelation" ADD CONSTRAINT "ChildGuardianRelation_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInRecord" ADD CONSTRAINT "CheckInRecord_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInRecord" ADD CONSTRAINT "CheckInRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ChildrenEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInRecord" ADD CONSTRAINT "CheckInRecord_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInRecord" ADD CONSTRAINT "CheckInRecord_checkedOutById_fkey" FOREIGN KEY ("checkedOutById") REFERENCES "Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInRecord" ADD CONSTRAINT "CheckInRecord_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildrenMinistryVolunteer" ADD CONSTRAINT "ChildrenMinistryVolunteer_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildrenMinistryVolunteer" ADD CONSTRAINT "ChildrenMinistryVolunteer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildrenEvent" ADD CONSTRAINT "ChildrenEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerEventAssignment" ADD CONSTRAINT "VolunteerEventAssignment_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "ChildrenMinistryVolunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerEventAssignment" ADD CONSTRAINT "VolunteerEventAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ChildrenEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
