import { Module } from '@nestjs/common';
import { FundsService } from './funds.service';
import { FundsResolver } from './funds.resolver';

@Module({
  providers: [FundsResolver, FundsService],
})
export class FundsModule {}
