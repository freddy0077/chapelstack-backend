-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "organisationId" TEXT;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
