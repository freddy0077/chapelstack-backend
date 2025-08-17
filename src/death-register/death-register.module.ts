import { Module } from '@nestjs/common';
import { DeathRegisterService } from './services/death-register.service';
import { DeathRegisterResolver } from './resolvers/death-register.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DeathRegisterResolver, DeathRegisterService],
  exports: [DeathRegisterService],
})
export class DeathRegisterModule {}
