-- AlterTable
ALTER TABLE "Ministry" ADD COLUMN     "organisationId" TEXT;

-- CreateIndex
CREATE INDEX "Ministry_organisationId_idx" ON "Ministry"("organisationId");

-- AddForeignKey
ALTER TABLE "Ministry" ADD CONSTRAINT "Ministry_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
