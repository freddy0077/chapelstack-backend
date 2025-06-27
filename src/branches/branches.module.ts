import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesResolver } from './branches.resolver';
import { MembersModule } from '../members/members.module'; // Added MembersModule import

@Module({
  imports: [MembersModule], // Added MembersModule to imports
  providers: [BranchesService, BranchesResolver],
  exports: [BranchesService],
})
export class BranchesModule {}
