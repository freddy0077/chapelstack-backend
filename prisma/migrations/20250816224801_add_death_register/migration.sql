-- CreateEnum
CREATE TYPE "BurialType" AS ENUM ('BURIAL', 'CREMATION');

-- CreateTable
CREATE TABLE "DeathRegister" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "dateOfDeath" TIMESTAMP(3) NOT NULL,
    "timeOfDeath" TEXT,
    "placeOfDeath" TEXT NOT NULL,
    "causeOfDeath" TEXT,
    "circumstances" TEXT,
    "funeralDate" TIMESTAMP(3),
    "funeralLocation" TEXT,
    "funeralOfficiant" TEXT,
    "burialCremation" "BurialType" NOT NULL,
    "cemeteryLocation" TEXT,
    "nextOfKin" TEXT NOT NULL,
    "nextOfKinPhone" TEXT,
    "nextOfKinEmail" TEXT,
    "familyNotified" BOOLEAN NOT NULL DEFAULT false,
    "notificationDate" TIMESTAMP(3),
    "deathCertificateUrl" TEXT,
    "obituaryUrl" TEXT,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recordedBy" TEXT NOT NULL,
    "recordedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedBy" TEXT,
    "lastUpdatedDate" TIMESTAMP(3),
    "branchId" TEXT,
    "organisationId" TEXT NOT NULL,
    "funeralEventId" TEXT,

    CONSTRAINT "DeathRegister_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeathRegister_memberId_key" ON "DeathRegister"("memberId");

-- CreateIndex
CREATE INDEX "DeathRegister_memberId_idx" ON "DeathRegister"("memberId");

-- CreateIndex
CREATE INDEX "DeathRegister_branchId_idx" ON "DeathRegister"("branchId");

-- CreateIndex
CREATE INDEX "DeathRegister_organisationId_idx" ON "DeathRegister"("organisationId");

-- CreateIndex
CREATE INDEX "DeathRegister_dateOfDeath_idx" ON "DeathRegister"("dateOfDeath");

-- CreateIndex
CREATE INDEX "DeathRegister_familyNotified_idx" ON "DeathRegister"("familyNotified");

-- CreateIndex
CREATE INDEX "DeathRegister_recordedDate_idx" ON "DeathRegister"("recordedDate");

-- AddForeignKey
ALTER TABLE "DeathRegister" ADD CONSTRAINT "DeathRegister_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathRegister" ADD CONSTRAINT "DeathRegister_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathRegister" ADD CONSTRAINT "DeathRegister_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathRegister" ADD CONSTRAINT "DeathRegister_funeralEventId_fkey" FOREIGN KEY ("funeralEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
