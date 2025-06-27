-- AlterTable
ALTER TABLE "SacramentalRecord" ADD COLUMN     "organisationId" TEXT;

-- CreateIndex
CREATE INDEX "SacramentalRecord_organisationId_idx" ON "SacramentalRecord"("organisationId");

-- AddForeignKey
ALTER TABLE "SacramentalRecord" ADD CONSTRAINT "SacramentalRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
