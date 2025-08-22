import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionResolver } from './transaction.resolver';
import { FundMappingService } from './fund-mapping.service';
import { FundMappingResolver } from './fund-mapping.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { FundsModule } from '../funds/funds.module';

@Module({
  imports: [PrismaModule, WorkflowsModule, FundsModule],
  providers: [
    TransactionService,
    TransactionResolver,
    FundMappingService,
    FundMappingResolver,
  ],
  exports: [TransactionService, FundMappingService],
})
export class TransactionModule {}
