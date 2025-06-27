import { Module } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionsResolver } from './contributions.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ContributionsResolver, ContributionsService],
})
export class ContributionsModule {}
