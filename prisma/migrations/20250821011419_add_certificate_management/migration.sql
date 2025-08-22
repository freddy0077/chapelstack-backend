-- CreateEnum
CREATE TYPE "ChurchDenomination" AS ENUM ('CATHOLIC', 'ORTHODOX', 'ANGLICAN', 'LUTHERAN', 'METHODIST', 'BAPTIST', 'PRESBYTERIAN', 'PENTECOSTAL', 'EVANGELICAL', 'REFORMED', 'EPISCOPAL', 'ADVENTIST', 'CONGREGATIONAL', 'MENNONITE', 'QUAKER', 'NONDENOMINATIONAL', 'INTERDENOMINATIONAL');

-- CreateEnum
CREATE TYPE "CertificateSacramentType" AS ENUM ('BAPTISM', 'INFANT_BAPTISM', 'ADULT_BAPTISM', 'IMMERSION_BAPTISM', 'EUCHARIST_FIRST_COMMUNION', 'CONFIRMATION', 'MATRIMONY', 'ORDINATION', 'RECONCILIATION', 'ANOINTING_OF_THE_SICK', 'DEDICATION', 'MEMBERSHIP', 'BLESSING');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED', 'DOWNLOADED');

-- CreateEnum
CREATE TYPE "CertificateFormat" AS ENUM ('PDF', 'PNG', 'JPEG');

-- CreateTable
CREATE TABLE "CertificateTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "denomination" "ChurchDenomination" NOT NULL,
    "sacramentType" "CertificateSacramentType" NOT NULL,
    "description" TEXT NOT NULL,
    "previewUrl" TEXT NOT NULL,
    "templateUrl" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "liturgicalElements" JSONB NOT NULL,
    "customFields" JSONB NOT NULL,
    "styling" JSONB NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "organisationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateGeneration" (
    "id" TEXT NOT NULL,
    "sacramentalRecordId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "status" "CertificateStatus" NOT NULL DEFAULT 'PENDING',
    "format" "CertificateFormat" NOT NULL DEFAULT 'PDF',
    "fieldValues" JSONB NOT NULL,
    "fileUrl" TEXT,
    "downloadUrl" TEXT,
    "previewUrl" TEXT,
    "errorMessage" TEXT,
    "customMessage" TEXT,
    "includeChurchLogo" BOOLEAN NOT NULL DEFAULT true,
    "includeBranchLetterhead" BOOLEAN NOT NULL DEFAULT true,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloadedAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "branchId" TEXT NOT NULL,
    "organisationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CertificateTemplate_denomination_idx" ON "CertificateTemplate"("denomination");

-- CreateIndex
CREATE INDEX "CertificateTemplate_sacramentType_idx" ON "CertificateTemplate"("sacramentType");

-- CreateIndex
CREATE INDEX "CertificateTemplate_isDefault_idx" ON "CertificateTemplate"("isDefault");

-- CreateIndex
CREATE INDEX "CertificateTemplate_branchId_idx" ON "CertificateTemplate"("branchId");

-- CreateIndex
CREATE INDEX "CertificateTemplate_organisationId_idx" ON "CertificateTemplate"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateTemplate_denomination_sacramentType_isDefault_br_key" ON "CertificateTemplate"("denomination", "sacramentType", "isDefault", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateGeneration_certificateNumber_key" ON "CertificateGeneration"("certificateNumber");

-- CreateIndex
CREATE INDEX "CertificateGeneration_sacramentalRecordId_idx" ON "CertificateGeneration"("sacramentalRecordId");

-- CreateIndex
CREATE INDEX "CertificateGeneration_templateId_idx" ON "CertificateGeneration"("templateId");

-- CreateIndex
CREATE INDEX "CertificateGeneration_status_idx" ON "CertificateGeneration"("status");

-- CreateIndex
CREATE INDEX "CertificateGeneration_generatedBy_idx" ON "CertificateGeneration"("generatedBy");

-- CreateIndex
CREATE INDEX "CertificateGeneration_branchId_idx" ON "CertificateGeneration"("branchId");

-- CreateIndex
CREATE INDEX "CertificateGeneration_organisationId_idx" ON "CertificateGeneration"("organisationId");

-- CreateIndex
CREATE INDEX "CertificateGeneration_generatedAt_idx" ON "CertificateGeneration"("generatedAt");

-- CreateIndex
CREATE INDEX "CertificateGeneration_expiresAt_idx" ON "CertificateGeneration"("expiresAt");

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateGeneration" ADD CONSTRAINT "CertificateGeneration_sacramentalRecordId_fkey" FOREIGN KEY ("sacramentalRecordId") REFERENCES "SacramentalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateGeneration" ADD CONSTRAINT "CertificateGeneration_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateGeneration" ADD CONSTRAINT "CertificateGeneration_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateGeneration" ADD CONSTRAINT "CertificateGeneration_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateGeneration" ADD CONSTRAINT "CertificateGeneration_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
