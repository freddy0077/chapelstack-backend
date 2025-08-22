-- CreateTable
CREATE TABLE "ContributionTypeFundMapping" (
    "id" TEXT NOT NULL,
    "contributionTypeId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "branchId" TEXT,
    "organisationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ContributionTypeFundMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContributionTypeFundMapping_contributionTypeId_idx" ON "ContributionTypeFundMapping"("contributionTypeId");

-- CreateIndex
CREATE INDEX "ContributionTypeFundMapping_fundId_idx" ON "ContributionTypeFundMapping"("fundId");

-- CreateIndex
CREATE INDEX "ContributionTypeFundMapping_branchId_idx" ON "ContributionTypeFundMapping"("branchId");

-- CreateIndex
CREATE INDEX "ContributionTypeFundMapping_organisationId_idx" ON "ContributionTypeFundMapping"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContributionTypeFundMapping_contributionTypeId_branchId_org_key" ON "ContributionTypeFundMapping"("contributionTypeId", "branchId", "organisationId");

-- AddForeignKey
ALTER TABLE "ContributionTypeFundMapping" ADD CONSTRAINT "ContributionTypeFundMapping_contributionTypeId_fkey" FOREIGN KEY ("contributionTypeId") REFERENCES "ContributionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionTypeFundMapping" ADD CONSTRAINT "ContributionTypeFundMapping_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionTypeFundMapping" ADD CONSTRAINT "ContributionTypeFundMapping_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionTypeFundMapping" ADD CONSTRAINT "ContributionTypeFundMapping_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
