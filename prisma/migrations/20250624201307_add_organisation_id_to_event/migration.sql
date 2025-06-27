-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "organisationId" TEXT;

-- CreateTable
CREATE TABLE "VolunteerRole" (
    "id" TEXT NOT NULL,

    CONSTRAINT "VolunteerRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
