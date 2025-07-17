-- AlterTable
ALTER TABLE "EmailMessage" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SmsMessage" ADD COLUMN     "scheduledAt" TIMESTAMP(3);
