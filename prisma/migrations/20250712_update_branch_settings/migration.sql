-- Drop the unique constraint on branchId and key
ALTER TABLE "BranchSetting" DROP CONSTRAINT IF EXISTS "BranchSetting_branchId_key_key";

-- Alter the key and value columns to be nullable
ALTER TABLE "BranchSetting" ALTER COLUMN "key" DROP NOT NULL;
ALTER TABLE "BranchSetting" ALTER COLUMN "value" DROP NOT NULL;

-- Add new settings columns
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "allowMemberRegistration" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "allowMemberTransfers" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enableAttendanceTracking" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enableFinancialReporting" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enableSacramentTracking" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enableMinistryManagement" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enableEventManagement" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enableSmallGroups" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "defaultLanguage" TEXT;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "timeZone" TEXT;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "dateFormat" TEXT;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enableEmailNotifications" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enableSmsNotifications" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "enablePushNotifications" BOOLEAN;
ALTER TABLE "BranchSetting" ADD COLUMN IF NOT EXISTS "notificationEvents" TEXT[] DEFAULT '{}';
