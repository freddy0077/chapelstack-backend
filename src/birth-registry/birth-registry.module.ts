import { Module } from '@nestjs/common';
import { BirthRegistryService } from './services/birth-registry.service';
import { BirthRegistryResolver } from './resolvers/birth-registry.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [PrismaModule, AuditModule, MembersModule],
  providers: [BirthRegistryResolver, BirthRegistryService],
  exports: [BirthRegistryService],
})
export class BirthRegistryModule {}
