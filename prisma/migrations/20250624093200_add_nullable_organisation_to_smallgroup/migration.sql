-- AlterTable
ALTER TABLE "SmallGroup" ADD COLUMN     "organisationId" TEXT;

-- AddForeignKey
ALTER TABLE "SmallGroup" ADD CONSTRAINT "SmallGroup_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
