import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersResolver } from './transfers.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [TransfersResolver, TransfersService, PrismaService],
  exports: [TransfersService],
})
export class TransfersModule {}
