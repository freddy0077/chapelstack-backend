import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersResolver } from './resolvers/users.resolver';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [PrismaModule, MembersModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
