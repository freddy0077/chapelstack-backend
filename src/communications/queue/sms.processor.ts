import { Worker, Job } from 'bullmq';
import { SmsService } from '../services/sms.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NaloSmsProvider } from '../providers/nalo-sms.provider';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { RecipientService } from '../services/recipient.service';

const smsWorker = new Worker(
  'sms',
  async (job: Job) => {
    // Manually create instances of services and their dependencies
    // because this worker runs outside the NestJS DI container.
    const prismaService = new PrismaService();
    const config = new ConfigService();

    // NaloSmsProvider depends on HttpService
    const axiosInstance = axios.create();
    const httpService = new HttpService(axiosInstance);

    const naloSmsProvider = new NaloSmsProvider(config, httpService);

    // SmsService depends on Prisma, Config, and NaloSmsProvider
    const recipientService = new RecipientService(prismaService);
    const smsService = new SmsService(
      prismaService,
      config,
      naloSmsProvider,
      recipientService,
    );

    console.log('Processing SMS job:', job.data);
    await smsService.processSmsJob(job.data);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  },
);

export default smsWorker;
