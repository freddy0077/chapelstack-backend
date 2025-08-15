import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MembersModule } from '../../members/members.module';
import { ComprehensiveMembersSeeder } from './comprehensive-members.seeder';

@Module({
  imports: [PrismaModule, MembersModule],
  providers: [ComprehensiveMembersSeeder],
  exports: [ComprehensiveMembersSeeder],
})
export class SeederModule {}
