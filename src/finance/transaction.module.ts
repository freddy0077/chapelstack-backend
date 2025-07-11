import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionResolver } from './transaction.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { FundsModule } from '../funds/funds.module';

@Module({
  imports: [PrismaModule, FundsModule],
  providers: [TransactionService, TransactionResolver],
  exports: [TransactionService],
})
export class TransactionModule {}
