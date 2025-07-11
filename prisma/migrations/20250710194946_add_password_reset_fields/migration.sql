-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetToken" VARCHAR(255),
ADD COLUMN     "passwordResetTokenExpiry" TIMESTAMP(3);
