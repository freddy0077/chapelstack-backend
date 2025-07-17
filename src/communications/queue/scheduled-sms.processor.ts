import { PrismaClient, MessageStatus } from '@prisma/client';
import { SmsService } from '../services/sms.service';
import { ConfigService } from '@nestjs/config';
import { NaloSmsProvider } from '../providers/nalo-sms.provider';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { RecipientService } from '../services/recipient.service';
import { PrismaService } from '../../prisma/prisma.service';

// This script should be run periodically (e.g., with node-cron or a simple setInterval)
async function processScheduledSms() {
  const prismaService = new PrismaService();
  const config = new ConfigService();
  const axiosInstance = axios.create();
  const httpService = new HttpService(axiosInstance);
  const naloSmsProvider = new NaloSmsProvider(config, httpService);
  const recipientService = new RecipientService(prismaService);
  const smsService = new SmsService(
    prismaService as any,
    config,
    naloSmsProvider,
    recipientService,
  );

  const now = new Date();
  // Find all scheduled SMS messages that should be sent now
  const scheduledMessages = await prismaService.smsMessage.findMany({
    where: {
      status: MessageStatus.SCHEDULED,
      scheduledAt: { lte: now },
    },
  });

  for (const sms of scheduledMessages) {
    try {
      // Use the same logic as your job processor
      await smsService.processSmsJob({
        message: sms.body,
        recipients: sms.recipients,
        branchId: sms.branchId ?? undefined,
        organisationId: sms.organisationId ?? undefined,
        scheduledAt: sms.scheduledAt
          ? sms.scheduledAt.toISOString()
          : undefined,
      });
      // Update status to SENT is handled by processSmsJob
    } catch (err) {
      // Optionally update status to FAILED
      await prismaService.smsMessage.update({
        where: { id: sms.id },
        data: { status: MessageStatus.FAILED },
      });
    }
  }
  await prismaService.$disconnect();
}

// Run immediately if this file is executed directly
if (require.main === module) {
  processScheduledSms().then(() => {
    console.log('Scheduled SMS processing complete.');
    process.exit(0);
  });
}

export default processScheduledSms;
