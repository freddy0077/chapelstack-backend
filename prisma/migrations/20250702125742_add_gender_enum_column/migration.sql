-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN', 'NOT_SPECIFIED');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "genderEnum" "Gender";
