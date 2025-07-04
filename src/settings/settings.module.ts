import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsResolver } from './settings.resolver';

@Module({
  providers: [SettingsService, SettingsResolver],
  exports: [SettingsService],
})
export class SettingsModule {}
