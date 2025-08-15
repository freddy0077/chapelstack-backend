-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'ENGAGED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('REGULAR', 'ASSOCIATE', 'HONORARY', 'YOUTH', 'CHILD', 'SENIOR', 'CLERGY');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRANSFERRED', 'DECEASED', 'REMOVED');

-- CreateEnum
CREATE TYPE "PrivacyLevel" AS ENUM ('PUBLIC', 'STANDARD', 'RESTRICTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'GRANDPARENT', 'GRANDCHILD', 'UNCLE_AUNT', 'NEPHEW_NIECE', 'COUSIN', 'GUARDIAN', 'WARD', 'FRIEND', 'EMERGENCY_CONTACT', 'OTHER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WORSHIP_SERVICE', 'WEDDING', 'FUNERAL', 'BAPTISM', 'GRADUATION', 'CONFERENCE', 'WORKSHOP', 'RETREAT', 'FELLOWSHIP', 'YOUTH_EVENT', 'CHILDREN_EVENT', 'PRAYER_MEETING', 'BIBLE_STUDY', 'COMMUNITY_SERVICE', 'FUNDRAISER', 'CELEBRATION', 'MEETING', 'OTHER');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('PENDING', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_customerId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionPlan" DROP CONSTRAINT "SubscriptionPlan_organisationId_fkey";

-- DropIndex
DROP INDEX "Member_rfidCardId_idx";

-- DropIndex
DROP INDEX "Member_rfidCardId_key";

-- DropIndex
DROP INDEX "Subscription_branchId_idx";

-- DropIndex
DROP INDEX "SubscriptionPlan_organisationId_idx";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "currency" TEXT DEFAULT 'GHS',
ADD COLUMN     "eventImageUrl" TEXT,
ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "organizerEmail" TEXT,
ADD COLUMN     "organizerName" TEXT,
ADD COLUMN     "organizerPhone" TEXT,
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "registrationRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "ticketPrice" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "affidavitUrl" TEXT,
ADD COLUMN     "alternatePhone" TEXT,
ADD COLUMN     "alternativeEmail" TEXT,
ADD COLUMN     "cardIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cardIssuedAt" TIMESTAMP(3),
ADD COLUMN     "cardType" TEXT,
ADD COLUMN     "consentDate" TIMESTAMP(3),
ADD COLUMN     "consentVersion" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "dataRetentionDate" TIMESTAMP(3),
ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deactivatedBy" TEXT,
ADD COLUMN     "deactivationReason" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "deletionReason" TEXT,
ADD COLUMN     "digitalAddress" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "familyId" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "fatherOccupation" TEXT,
ADD COLUMN     "headOfHousehold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeactivated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "lastAttendanceDate" TIMESTAMP(3),
ADD COLUMN     "lastModifiedBy" TEXT,
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "memberIdGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "membershipType" "MembershipType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherOccupation" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "nfcId" TEXT,
ADD COLUMN     "nlbNumber" TEXT,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "preferredName" TEXT,
ADD COLUMN     "privacyLevel" "PrivacyLevel" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "region" TEXT,
ADD COLUMN     "salvationDate" TIMESTAMP(3),
ADD COLUMN     "title" TEXT,
DROP COLUMN "maritalStatus",
ADD COLUMN     "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'UNKNOWN',
ALTER COLUMN "membershipStatus" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "organisationId";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "CommunicationPrefs" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailNewsletter" BOOLEAN NOT NULL DEFAULT true,
    "emailEvents" BOOLEAN NOT NULL DEFAULT true,
    "emailReminders" BOOLEAN NOT NULL DEFAULT true,
    "emailPrayer" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEvents" BOOLEAN NOT NULL DEFAULT false,
    "smsReminders" BOOLEAN NOT NULL DEFAULT false,
    "smsEmergency" BOOLEAN NOT NULL DEFAULT true,
    "phoneCallsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "phoneEmergency" BOOLEAN NOT NULL DEFAULT true,
    "physicalMail" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "preferredCallTime" TEXT,
    "doNotDisturbDays" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationPrefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberRelationship" (
    "id" TEXT NOT NULL,
    "primaryMemberId" TEXT NOT NULL,
    "relatedMemberId" TEXT NOT NULL,
    "relationshipType" "RelationshipType" NOT NULL,
    "isEmergencyContact" BOOLEAN NOT NULL DEFAULT false,
    "isGuardian" BOOLEAN NOT NULL DEFAULT false,
    "canPickupChildren" BOOLEAN NOT NULL DEFAULT false,
    "relationshipStart" TIMESTAMP(3),
    "relationshipEnd" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipHistory" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "fromStatus" "MembershipStatus",
    "toStatus" "MembershipStatus" NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeReason" TEXT,
    "fromBranchId" TEXT,
    "toBranchId" TEXT,
    "notes" TEXT,
    "approvedBy" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberSearchIndex" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "searchName" TEXT NOT NULL,
    "phoneNumbers" TEXT[],
    "emails" TEXT[],
    "addresses" TEXT[],
    "tags" TEXT[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "searchRank" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "MemberSearchIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberAnalytics" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "totalAttendances" INTEGER NOT NULL DEFAULT 0,
    "attendanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastAttendanceDate" TIMESTAMP(3),
    "attendanceStreak" INTEGER NOT NULL DEFAULT 0,
    "totalContributions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastContributionDate" TIMESTAMP(3),
    "contributionFrequency" TEXT,
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "engagementLevel" TEXT NOT NULL DEFAULT 'NEW',
    "ministriesCount" INTEGER NOT NULL DEFAULT 0,
    "leadershipRoles" INTEGER NOT NULL DEFAULT 0,
    "volunteerHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emailOpenRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "smsResponseRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastCommunication" TIMESTAMP(3),
    "membershipDuration" INTEGER,
    "ageGroup" TEXT,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RSVPStatus" NOT NULL DEFAULT 'PENDING',
    "numberOfGuests" INTEGER NOT NULL DEFAULT 0,
    "specialRequests" TEXT,
    "amountPaid" DECIMAL(10,2),
    "paymentStatus" TEXT,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "approvalStatus" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "registrationSource" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRSVP" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "status" "RSVPStatus" NOT NULL DEFAULT 'PENDING',
    "responseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numberOfGuests" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "rsvpSource" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberIdConfig" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberIdConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberIdSequence" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "branchId" TEXT,
    "year" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberIdSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationPrefs_memberId_key" ON "CommunicationPrefs"("memberId");

-- CreateIndex
CREATE INDEX "CommunicationPrefs_memberId_idx" ON "CommunicationPrefs"("memberId");

-- CreateIndex
CREATE INDEX "MemberRelationship_primaryMemberId_idx" ON "MemberRelationship"("primaryMemberId");

-- CreateIndex
CREATE INDEX "MemberRelationship_relatedMemberId_idx" ON "MemberRelationship"("relatedMemberId");

-- CreateIndex
CREATE INDEX "MemberRelationship_relationshipType_idx" ON "MemberRelationship"("relationshipType");

-- CreateIndex
CREATE UNIQUE INDEX "MemberRelationship_primaryMemberId_relatedMemberId_relation_key" ON "MemberRelationship"("primaryMemberId", "relatedMemberId", "relationshipType");

-- CreateIndex
CREATE INDEX "MembershipHistory_memberId_idx" ON "MembershipHistory"("memberId");

-- CreateIndex
CREATE INDEX "MembershipHistory_changeDate_idx" ON "MembershipHistory"("changeDate");

-- CreateIndex
CREATE INDEX "MembershipHistory_toStatus_idx" ON "MembershipHistory"("toStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MemberSearchIndex_memberId_key" ON "MemberSearchIndex"("memberId");

-- CreateIndex
CREATE INDEX "MemberSearchIndex_searchName_idx" ON "MemberSearchIndex"("searchName");

-- CreateIndex
CREATE INDEX "MemberSearchIndex_fullName_idx" ON "MemberSearchIndex"("fullName");

-- CreateIndex
CREATE INDEX "MemberSearchIndex_phoneNumbers_idx" ON "MemberSearchIndex"("phoneNumbers");

-- CreateIndex
CREATE INDEX "MemberSearchIndex_emails_idx" ON "MemberSearchIndex"("emails");

-- CreateIndex
CREATE UNIQUE INDEX "MemberAnalytics_memberId_key" ON "MemberAnalytics"("memberId");

-- CreateIndex
CREATE INDEX "MemberAnalytics_memberId_idx" ON "MemberAnalytics"("memberId");

-- CreateIndex
CREATE INDEX "MemberAnalytics_engagementLevel_idx" ON "MemberAnalytics"("engagementLevel");

-- CreateIndex
CREATE INDEX "MemberAnalytics_ageGroup_idx" ON "MemberAnalytics"("ageGroup");

-- CreateIndex
CREATE INDEX "MemberAnalytics_lastAttendanceDate_idx" ON "MemberAnalytics"("lastAttendanceDate");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_memberId_idx" ON "EventRegistration"("memberId");

-- CreateIndex
CREATE INDEX "EventRegistration_status_idx" ON "EventRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_memberId_key" ON "EventRegistration"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_guestEmail_key" ON "EventRegistration"("eventId", "guestEmail");

-- CreateIndex
CREATE INDEX "EventRSVP_eventId_idx" ON "EventRSVP"("eventId");

-- CreateIndex
CREATE INDEX "EventRSVP_memberId_idx" ON "EventRSVP"("memberId");

-- CreateIndex
CREATE INDEX "EventRSVP_status_idx" ON "EventRSVP"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRSVP_eventId_memberId_key" ON "EventRSVP"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRSVP_eventId_guestEmail_key" ON "EventRSVP"("eventId", "guestEmail");

-- CreateIndex
CREATE INDEX "MemberIdConfig_organisationId_idx" ON "MemberIdConfig"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberIdConfig_organisationId_key" ON "MemberIdConfig"("organisationId");

-- CreateIndex
CREATE INDEX "MemberIdSequence_organisationId_idx" ON "MemberIdSequence"("organisationId");

-- CreateIndex
CREATE INDEX "MemberIdSequence_branchId_idx" ON "MemberIdSequence"("branchId");

-- CreateIndex
CREATE INDEX "MemberIdSequence_year_idx" ON "MemberIdSequence"("year");

-- CreateIndex
CREATE UNIQUE INDEX "MemberIdSequence_organisationId_branchId_year_key" ON "MemberIdSequence"("organisationId", "branchId", "year");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");

-- CreateIndex
CREATE INDEX "Member_status_idx" ON "Member"("status");

-- CreateIndex
CREATE INDEX "Transaction_organisationId_idx" ON "Transaction"("organisationId");

-- CreateIndex
CREATE INDEX "Transaction_branchId_idx" ON "Transaction"("branchId");

-- CreateIndex
CREATE INDEX "Transaction_fundId_idx" ON "Transaction"("fundId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_memberId_idx" ON "Transaction"("memberId");

-- CreateIndex
CREATE INDEX "Transaction_eventId_idx" ON "Transaction"("eventId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- AddForeignKey
ALTER TABLE "CommunicationPrefs" ADD CONSTRAINT "CommunicationPrefs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRelationship" ADD CONSTRAINT "MemberRelationship_primaryMemberId_fkey" FOREIGN KEY ("primaryMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRelationship" ADD CONSTRAINT "MemberRelationship_relatedMemberId_fkey" FOREIGN KEY ("relatedMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipHistory" ADD CONSTRAINT "MembershipHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipHistory" ADD CONSTRAINT "MembershipHistory_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipHistory" ADD CONSTRAINT "MembershipHistory_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipHistory" ADD CONSTRAINT "MembershipHistory_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberSearchIndex" ADD CONSTRAINT "MemberSearchIndex_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAnalytics" ADD CONSTRAINT "MemberAnalytics_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberIdConfig" ADD CONSTRAINT "MemberIdConfig_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberIdSequence" ADD CONSTRAINT "MemberIdSequence_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberIdSequence" ADD CONSTRAINT "MemberIdSequence_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

