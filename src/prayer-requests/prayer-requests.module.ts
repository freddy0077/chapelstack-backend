import { Module } from '@nestjs/common';
import { PrayerRequestsService } from './prayer-requests.service';
import { PrayerRequestsResolver } from './prayer-requests.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrayerRequestsResolver, PrayerRequestsService, PrismaService],
  exports: [PrayerRequestsService],
})
export class PrayerRequestsModule {}
