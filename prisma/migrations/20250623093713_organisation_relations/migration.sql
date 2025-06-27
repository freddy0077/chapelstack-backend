-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organisationId" TEXT;

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "denomination" TEXT,
    "foundingYear" INTEGER,
    "size" TEXT,
    "vision" TEXT,
    "missionStatement" TEXT,
    "description" TEXT,
    "timezone" TEXT,
    "currency" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "tertiaryColor" TEXT,
    "fontFamily" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_email_key" ON "Organisation"("email");

-- CreateIndex
CREATE INDEX "Organisation_email_idx" ON "Organisation"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
