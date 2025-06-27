import { Module } from '@nestjs/common';
import { ContributionTypeResolver } from './contribution-type.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ContributionTypeResolver],
})
export class ContributionTypesModule {}
