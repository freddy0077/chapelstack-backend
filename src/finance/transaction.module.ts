import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionResolver } from './transaction.resolver';
import { FundMappingService } from './fund-mapping.service';
import { FundMappingResolver } from './fund-mapping.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { FundsModule } from '../funds/funds.module';

// New Accounting Services
import { AccountService } from './services/account.service';
import { JournalEntryService } from './services/journal-entry.service';
import { OfferingService } from './services/offering.service';
import { FiscalPeriodService } from './services/fiscal-period.service';
import { BankAccountService } from './services/bank-account.service';
import { BankReconciliationService } from './services/bank-reconciliation.service';
import { BankStatementService } from './services/bank-statement.service';
import { BankAuditLogService } from './services/bank-audit-log.service';

// New Accounting Resolvers
import { AccountResolver } from './resolvers/account.resolver';
import { JournalEntryResolver } from './resolvers/journal-entry.resolver';
import { OfferingBatchResolver } from './resolvers/offering-batch.resolver';
import { FiscalPeriodResolver } from './resolvers/fiscal-period.resolver';
import { BankAccountResolver } from './resolvers/bank-account.resolver';
import { BankReconciliationResolver } from './resolvers/bank-reconciliation.resolver';
import { BankStatementResolver } from './resolvers/bank-statement.resolver';

@Module({
  imports: [PrismaModule, WorkflowsModule, FundsModule],
  providers: [
    // Existing services
    TransactionService,
    TransactionResolver,
    FundMappingService,
    FundMappingResolver,
    // New accounting services
    AccountService,
    JournalEntryService,
    OfferingService,
    FiscalPeriodService,
    BankAccountService,
    BankReconciliationService,
    BankStatementService,
    BankAuditLogService,
    // New accounting resolvers
    AccountResolver,
    JournalEntryResolver,
    OfferingBatchResolver,
    FiscalPeriodResolver,
    BankAccountResolver,
    BankReconciliationResolver,
    BankStatementResolver,
  ],
  exports: [
    TransactionService,
    FundMappingService,
    // Export new services
    AccountService,
    JournalEntryService,
    OfferingService,
    FiscalPeriodService,
    BankAccountService,
    BankReconciliationService,
    BankStatementService,
  ],
})
export class TransactionModule {}
