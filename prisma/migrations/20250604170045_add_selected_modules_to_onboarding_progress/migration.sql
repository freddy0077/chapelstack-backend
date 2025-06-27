-- AlterTable
ALTER TABLE "OnboardingProgress" ADD COLUMN     "selectedModules" TEXT[] DEFAULT ARRAY[]::TEXT[];
