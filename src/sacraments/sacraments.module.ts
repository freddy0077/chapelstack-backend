import { Module } from '@nestjs/common';
import { SacramentsService } from './sacraments.service';
import { SacramentsResolver } from './sacraments.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [SacramentsResolver, SacramentsService, PrismaService],
  exports: [SacramentsService],
})
export class SacramentsModule {}
