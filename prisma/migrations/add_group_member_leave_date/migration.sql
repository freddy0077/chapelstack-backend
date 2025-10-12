-- Add leaveDate field to GroupMember table to track when a member left a group
ALTER TABLE "GroupMember" ADD COLUMN "leaveDate" TIMESTAMP(3);

-- Add index for leaveDate for better query performance
CREATE INDEX "GroupMember_leaveDate_idx" ON "GroupMember"("leaveDate");

-- Add leaveReason field to track why a member left
ALTER TABLE "GroupMember" ADD COLUMN "leaveReason" TEXT;
