import { Module } from '@nestjs/common';
import { EmailService } from '../communications/services/email.service';
import { TemplateService } from '../communications/services/template.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecipientService } from '../communications/services/recipient.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [EmailService, TemplateService, PrismaService, RecipientService],
  exports: [EmailService],
})
export class EmailModule {}
