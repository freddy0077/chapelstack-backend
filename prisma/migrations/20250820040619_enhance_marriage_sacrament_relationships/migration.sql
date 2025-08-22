-- AlterTable
ALTER TABLE "SacramentalRecord" ADD COLUMN     "brideMemberId" TEXT,
ADD COLUMN     "groomMemberId" TEXT,
ADD COLUMN     "witness1MemberId" TEXT,
ADD COLUMN     "witness2MemberId" TEXT;

-- CreateIndex
CREATE INDEX "SacramentalRecord_groomMemberId_idx" ON "SacramentalRecord"("groomMemberId");

-- CreateIndex
CREATE INDEX "SacramentalRecord_brideMemberId_idx" ON "SacramentalRecord"("brideMemberId");

-- CreateIndex
CREATE INDEX "SacramentalRecord_officiantId_idx" ON "SacramentalRecord"("officiantId");

-- CreateIndex
CREATE INDEX "SacramentalRecord_sacramentType_branchId_idx" ON "SacramentalRecord"("sacramentType", "branchId");

-- AddForeignKey
ALTER TABLE "SacramentalRecord" ADD CONSTRAINT "SacramentalRecord_groomMemberId_fkey" FOREIGN KEY ("groomMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacramentalRecord" ADD CONSTRAINT "SacramentalRecord_brideMemberId_fkey" FOREIGN KEY ("brideMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacramentalRecord" ADD CONSTRAINT "SacramentalRecord_officiantId_fkey" FOREIGN KEY ("officiantId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacramentalRecord" ADD CONSTRAINT "SacramentalRecord_witness1MemberId_fkey" FOREIGN KEY ("witness1MemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SacramentalRecord" ADD CONSTRAINT "SacramentalRecord_witness2MemberId_fkey" FOREIGN KEY ("witness2MemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
