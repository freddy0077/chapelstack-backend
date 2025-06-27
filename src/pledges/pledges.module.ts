import { Module } from '@nestjs/common';
import { PledgesService } from './pledges.service';
import { PledgesResolver } from './pledges.resolver';

@Module({
  providers: [PledgesResolver, PledgesService],
})
export class PledgesModule {}
