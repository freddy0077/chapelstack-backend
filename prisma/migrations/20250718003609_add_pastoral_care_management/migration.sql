-- CreateEnum
CREATE TYPE "PastoralVisitType" AS ENUM ('HOME_VISIT', 'HOSPITAL_VISIT', 'OFFICE_MEETING', 'PHONE_CALL', 'VIDEO_CALL', 'EMERGENCY_VISIT', 'FOLLOW_UP_VISIT', 'BEREAVEMENT_VISIT', 'COUNSELING_SESSION', 'PRAYER_VISIT');

-- CreateEnum
CREATE TYPE "PastoralVisitStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CounselingSessionType" AS ENUM ('INDIVIDUAL', 'COUPLES', 'FAMILY', 'GROUP', 'CRISIS', 'GRIEF', 'MARRIAGE', 'ADDICTION', 'SPIRITUAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "CounselingSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CareRequestType" AS ENUM ('PRAYER_REQUEST', 'HOSPITAL_VISIT', 'HOME_VISIT', 'COUNSELING', 'CRISIS_SUPPORT', 'BEREAVEMENT', 'FINANCIAL_ASSISTANCE', 'SPIRITUAL_GUIDANCE', 'FAMILY_CRISIS', 'GENERAL_SUPPORT');

-- CreateEnum
CREATE TYPE "CareRequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "CareRequestStatus" AS ENUM ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('PASTORAL_VISIT', 'COUNSELING_SESSION', 'CARE_REQUEST', 'MEMBER_CONTACT', 'EVENT_FOLLOW_UP');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "PastoralVisit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visitType" "PastoralVisitType" NOT NULL,
    "status" "PastoralVisitStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "duration" INTEGER,
    "location" TEXT,
    "memberId" TEXT NOT NULL,
    "pastorId" TEXT NOT NULL,
    "additionalAttendees" TEXT,
    "notes" TEXT,
    "privateNotes" TEXT,
    "actionItems" TEXT,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "organisationId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PastoralVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselingSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionType" "CounselingSessionType" NOT NULL,
    "status" "CounselingSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "duration" INTEGER,
    "location" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "primaryMemberId" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "additionalMembers" TEXT,
    "sessionNotes" TEXT,
    "privateNotes" TEXT,
    "homework" TEXT,
    "nextSteps" TEXT,
    "sessionNumber" INTEGER NOT NULL DEFAULT 1,
    "totalSessions" INTEGER,
    "progressNotes" TEXT,
    "organisationId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CounselingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestType" "CareRequestType" NOT NULL,
    "priority" "CareRequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "CareRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "urgentNotes" TEXT,
    "contactInfo" TEXT,
    "preferredContactMethod" TEXT,
    "requesterId" TEXT,
    "assignedPastorId" TEXT,
    "assignedDate" TIMESTAMP(3),
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "responseNotes" TEXT,
    "resolutionNotes" TEXT,
    "actionsTaken" TEXT,
    "organisationId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpReminder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "followUpType" "FollowUpType" NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "reminderDate" TIMESTAMP(3),
    "pastoralVisitId" TEXT,
    "counselingSessionId" TEXT,
    "careRequestId" TEXT,
    "memberId" TEXT,
    "assignedToId" TEXT NOT NULL,
    "notes" TEXT,
    "completionNotes" TEXT,
    "actionRequired" TEXT,
    "organisationId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PastoralVisit_memberId_idx" ON "PastoralVisit"("memberId");

-- CreateIndex
CREATE INDEX "PastoralVisit_pastorId_idx" ON "PastoralVisit"("pastorId");

-- CreateIndex
CREATE INDEX "PastoralVisit_organisationId_idx" ON "PastoralVisit"("organisationId");

-- CreateIndex
CREATE INDEX "PastoralVisit_branchId_idx" ON "PastoralVisit"("branchId");

-- CreateIndex
CREATE INDEX "PastoralVisit_status_idx" ON "PastoralVisit"("status");

-- CreateIndex
CREATE INDEX "PastoralVisit_visitType_idx" ON "PastoralVisit"("visitType");

-- CreateIndex
CREATE INDEX "PastoralVisit_scheduledDate_idx" ON "PastoralVisit"("scheduledDate");

-- CreateIndex
CREATE INDEX "CounselingSession_primaryMemberId_idx" ON "CounselingSession"("primaryMemberId");

-- CreateIndex
CREATE INDEX "CounselingSession_counselorId_idx" ON "CounselingSession"("counselorId");

-- CreateIndex
CREATE INDEX "CounselingSession_organisationId_idx" ON "CounselingSession"("organisationId");

-- CreateIndex
CREATE INDEX "CounselingSession_branchId_idx" ON "CounselingSession"("branchId");

-- CreateIndex
CREATE INDEX "CounselingSession_status_idx" ON "CounselingSession"("status");

-- CreateIndex
CREATE INDEX "CounselingSession_sessionType_idx" ON "CounselingSession"("sessionType");

-- CreateIndex
CREATE INDEX "CounselingSession_scheduledDate_idx" ON "CounselingSession"("scheduledDate");

-- CreateIndex
CREATE INDEX "CareRequest_requesterId_idx" ON "CareRequest"("requesterId");

-- CreateIndex
CREATE INDEX "CareRequest_assignedPastorId_idx" ON "CareRequest"("assignedPastorId");

-- CreateIndex
CREATE INDEX "CareRequest_organisationId_idx" ON "CareRequest"("organisationId");

-- CreateIndex
CREATE INDEX "CareRequest_branchId_idx" ON "CareRequest"("branchId");

-- CreateIndex
CREATE INDEX "CareRequest_status_idx" ON "CareRequest"("status");

-- CreateIndex
CREATE INDEX "CareRequest_priority_idx" ON "CareRequest"("priority");

-- CreateIndex
CREATE INDEX "CareRequest_requestType_idx" ON "CareRequest"("requestType");

-- CreateIndex
CREATE INDEX "CareRequest_requestDate_idx" ON "CareRequest"("requestDate");

-- CreateIndex
CREATE INDEX "FollowUpReminder_assignedToId_idx" ON "FollowUpReminder"("assignedToId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_organisationId_idx" ON "FollowUpReminder"("organisationId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_branchId_idx" ON "FollowUpReminder"("branchId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_status_idx" ON "FollowUpReminder"("status");

-- CreateIndex
CREATE INDEX "FollowUpReminder_followUpType_idx" ON "FollowUpReminder"("followUpType");

-- CreateIndex
CREATE INDEX "FollowUpReminder_dueDate_idx" ON "FollowUpReminder"("dueDate");

-- CreateIndex
CREATE INDEX "FollowUpReminder_pastoralVisitId_idx" ON "FollowUpReminder"("pastoralVisitId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_counselingSessionId_idx" ON "FollowUpReminder"("counselingSessionId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_careRequestId_idx" ON "FollowUpReminder"("careRequestId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_memberId_idx" ON "FollowUpReminder"("memberId");

-- AddForeignKey
ALTER TABLE "PastoralVisit" ADD CONSTRAINT "PastoralVisit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastoralVisit" ADD CONSTRAINT "PastoralVisit_pastorId_fkey" FOREIGN KEY ("pastorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastoralVisit" ADD CONSTRAINT "PastoralVisit_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastoralVisit" ADD CONSTRAINT "PastoralVisit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastoralVisit" ADD CONSTRAINT "PastoralVisit_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSession" ADD CONSTRAINT "CounselingSession_primaryMemberId_fkey" FOREIGN KEY ("primaryMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSession" ADD CONSTRAINT "CounselingSession_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSession" ADD CONSTRAINT "CounselingSession_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSession" ADD CONSTRAINT "CounselingSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSession" ADD CONSTRAINT "CounselingSession_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequest" ADD CONSTRAINT "CareRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequest" ADD CONSTRAINT "CareRequest_assignedPastorId_fkey" FOREIGN KEY ("assignedPastorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequest" ADD CONSTRAINT "CareRequest_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequest" ADD CONSTRAINT "CareRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequest" ADD CONSTRAINT "CareRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_pastoralVisitId_fkey" FOREIGN KEY ("pastoralVisitId") REFERENCES "PastoralVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_counselingSessionId_fkey" FOREIGN KEY ("counselingSessionId") REFERENCES "CounselingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_careRequestId_fkey" FOREIGN KEY ("careRequestId") REFERENCES "CareRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
