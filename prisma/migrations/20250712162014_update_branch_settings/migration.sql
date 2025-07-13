-- DropIndex
DROP INDEX "BranchSetting_branchId_key_key";

-- AlterTable
ALTER TABLE "BranchSetting" ALTER COLUMN "notificationEvents" DROP DEFAULT;
