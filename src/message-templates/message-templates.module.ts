import { Module } from '@nestjs/common';
import { MessageTemplatesService } from './services/message-templates.service';
import { MessageTemplatesResolver } from './resolvers/message-templates.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [MessageTemplatesService, MessageTemplatesResolver],
  exports: [MessageTemplatesService],
})
export class MessageTemplatesModule {}
