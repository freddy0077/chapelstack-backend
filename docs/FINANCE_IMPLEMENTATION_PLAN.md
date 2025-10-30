# Finance Module Implementation Plan
## Migration from Transaction Model to Full Accounting System

**Version:** 1.0 | **Date:** 2025-10-27 | **Status:** Implementation Planning  
**Target:** Ghana Church Management System

---

## Executive Summary

Step-by-step implementation plan to migrate from the current `Transaction` model to a comprehensive double-entry accounting system with General Ledger, while maintaining backward compatibility.

### Current System Analysis

**Existing Transaction Model:**
- Basic income/expense tracking
- Fund allocation
- Transaction voiding and audit trail
- Member and event attribution

**Limitations:**
- No double-entry bookkeeping
- No chart of accounts or general ledger
- No journal entries
- Limited financial reporting
- No offering management

---

## Implementation Phases

### Phase 0: Preparation (Weeks 1-2)

**Tasks:**
- [ ] Export all existing transactions
- [ ] Document current transaction types
- [ ] Design Ghana church-specific COA
- [ ] Map transaction types to GL accounts
- [ ] Create migration scripts
- [ ] Set up test environment

**COA Mapping Example:**
```
Transaction Type → GL Accounts
================================
INCOME (Tithe)   → DR: Cash (1010) / CR: Tithe Revenue (4010)
INCOME (Offering) → DR: Cash (1010) / CR: Offering Revenue (4020)
EXPENSE (Utilities) → DR: Utilities Expense (6010) / CR: Cash (1010)
```

---

### Phase 1: Core Foundation (Weeks 3-6)

**Week 3-4: Database Schema**
- Implement `Account`, `JournalEntry`, `JournalEntryLine` models
- Create `FiscalPeriod` model
- Add indexes and relations

**Week 5: Posting Engine**
- Build journal entry creation service
- Implement double-entry validation (DR = CR)
- Create posting rules engine
- Build account balance calculator

**Week 6: Testing**
- Unit tests for all core functions
- Integration tests
- Validation rules testing

---

### Phase 2: Offering Management (Weeks 7-10)

**Week 7-8: Offering Models**
- Implement `OfferingBatch` model
- Implement `OfferingType` model
- Build cash denomination calculator
- Create multi-counter verification workflow

**Week 9: GL Integration**
- Auto-posting offering batches to GL
- Bank deposit preparation
- Mobile Money reconciliation

**Week 10: Testing**
- End-to-end offering flow
- GL posting validation
- Multi-counter workflow testing

---

### Phase 3: Data Migration (Weeks 11-14)

**Migration Steps:**

1. **Create Default COA** (Week 11)
   - Assets: Cash, Mobile Money, Bank accounts
   - Revenue: Tithe, Offering, Harvest, Building Fund
   - Expenses: Utilities, Salaries, Ministry
   - Equity: Net Assets (Restricted/Unrestricted)

2. **Convert Transactions** (Week 12)
   - Map each Transaction to JournalEntry
   - Create two JournalEntryLines (DR and CR)
   - Preserve fund allocation and member attribution
   - Link original Transaction.id to JournalEntry.sourceTransactionId

3. **Calculate Opening Balances** (Week 13)
   - Sum all transactions before cutover date
   - Create opening balance journal entry
   - Validate trial balance

4. **Validation** (Week 14)
   - Compare old vs new balances
   - Verify fund allocations
   - Test rollback procedures
   - Stakeholder approval

---

### Phase 4: Backward Compatibility (Weeks 15-16)

**Strategy:**
- Keep Transaction model (read-only)
- Add `journalEntryId` link to Transaction
- Create TransactionViewService to read from JournalEntry
- Return data in old Transaction format for existing APIs

**Benefits:**
- Zero breaking changes for existing integrations
- Gradual migration of frontend components
- Rollback capability

---

### Phase 5: API Development (Weeks 17-20)

**GraphQL Endpoints:**

**Queries:**
- `chartOfAccounts` - Get COA structure
- `accountBalance` - Get account balance
- `trialBalance` - Generate trial balance
- `journalEntries` - List journal entries
- `offeringBatches` - List offering batches
- `incomeStatement`, `balanceSheet`, `cashFlowStatement`

**Mutations:**
- `createAccount`, `updateAccount`
- `createJournalEntry`, `postJournalEntry`, `voidJournalEntry`
- `createOfferingBatch`, `verifyOfferingBatch`, `postOfferingToGL`
- `closeFiscalPeriod`

---

### Phase 6: Frontend Development (Weeks 21-24)

**Week 21: Chart of Accounts UI**
- COA tree view
- Account creation/editing forms
- Account search and filtering

**Week 22: Offering Management UI**
- Offering batch creation
- Cash counting interface with denomination breakdown
- Multi-counter verification workflow
- Discrepancy tracking

**Week 23: Journal Entry UI**
- Manual journal entry form
- Journal entry list and search
- Posting and void workflows
- Approval workflows

**Week 24: Financial Reports**
- Income Statement
- Balance Sheet
- Cash Flow Statement
- Trial Balance
- Custom report builder

---

### Phase 7: Advanced Features (Weeks 25-28)

**Week 25: Vendor Management**
- Enhanced vendor model with TIN
- Bill/invoice processing
- WHT calculation and certificates

**Week 26: Bank Reconciliation**
- Bank account setup
- Statement import
- Automated matching
- Reconciliation interface

**Week 27: Fixed Assets**
- Asset register
- Depreciation engine
- Asset lifecycle tracking

**Week 28: Tax Management**
- WHT tracking and reporting
- E-levy tracking
- GRA compliance reports

---

## Automatic Posting Rules

### Offering Batch → Journal Entry
```
When: Offering batch approved and posted
DR: Cash Account (1010) - cash amount
DR: Mobile Money Account (1020) - mobile money amount
CR: Tithe Revenue (4010) - tithe contributions
CR: Offering Revenue (4020) - offering contributions
CR: Building Fund Revenue (4040) - building fund contributions
```

### Contribution → Journal Entry
```
When: Individual contribution recorded
DR: Cash/Mobile Money/Bank
CR: Revenue Account (based on contribution type)
Dimensions: Fund, Member, Ministry
```

### Expense → Journal Entry
```
When: Expense approved
DR: Expense Account (based on category)
CR: Cash/Accounts Payable
Dimensions: Fund, Ministry, Vendor
```

### Vendor Payment → Journal Entry
```
When: Vendor payment made
DR: Accounts Payable
DR: WHT Payable (if applicable)
CR: Cash/Bank
```

---

## Migration Scripts

### 1. Create Default COA
```typescript
// scripts/01-create-coa.ts
async function createDefaultCOA(orgId: string) {
  const accounts = [
    { code: '1010', name: 'Cash - Operating', type: 'ASSET', normalBalance: 'DEBIT' },
    { code: '1020', name: 'Mobile Money Wallet', type: 'ASSET', normalBalance: 'DEBIT' },
    { code: '4010', name: 'Tithe Revenue', type: 'REVENUE', normalBalance: 'CREDIT' },
    { code: '4020', name: 'Offering Revenue', type: 'REVENUE', normalBalance: 'CREDIT' },
    { code: '6010', name: 'Utilities Expense', type: 'EXPENSE', normalBalance: 'DEBIT' },
    // ... more accounts
  ];
  
  for (const account of accounts) {
    await prisma.account.create({ data: { ...account, organisationId: orgId } });
  }
}
```

### 2. Convert Transactions
```typescript
// scripts/02-convert-transactions.ts
async function convertTransaction(transaction: Transaction) {
  const mapping = getAccountMapping(transaction.type);
  
  await prisma.journalEntry.create({
    data: {
      journalEntryNumber: generateJENumber(),
      entryDate: transaction.date,
      sourceModule: 'TRANSACTION',
      sourceTransactionId: transaction.id,
      description: transaction.description,
      status: 'POSTED',
      lines: {
        create: [
          {
            lineNumber: 1,
            accountId: mapping.debitAccount,
            debitAmount: transaction.amount,
            creditAmount: 0,
            fundId: transaction.fundId,
            memberId: transaction.memberId,
          },
          {
            lineNumber: 2,
            accountId: mapping.creditAccount,
            debitAmount: 0,
            creditAmount: transaction.amount,
            fundId: transaction.fundId,
            memberId: transaction.memberId,
          },
        ],
      },
    },
  });
}
```

### 3. Calculate Opening Balances
```typescript
// scripts/03-opening-balances.ts
async function calculateOpeningBalances(cutoverDate: Date) {
  const balances = await calculateAccountBalances(cutoverDate);
  
  const lines = [];
  for (const [accountId, balance] of balances.entries()) {
    if (balance > 0) {
      lines.push({ accountId, debitAmount: balance, creditAmount: 0 });
    } else {
      lines.push({ accountId, debitAmount: 0, creditAmount: Math.abs(balance) });
    }
  }
  
  await prisma.journalEntry.create({
    data: {
      journalEntryNumber: 'OB-2024-001',
      entryDate: cutoverDate,
      entryType: 'OPENING',
      description: 'Opening Balances',
      status: 'POSTED',
      lines: { create: lines },
    },
  });
}
```

---

## Testing Strategy

### Unit Tests
- Account CRUD operations
- Journal entry validation (DR = CR)
- Balance calculation
- Posting rules

### Integration Tests
- Transaction to JournalEntry conversion
- Offering batch to GL posting
- Multi-currency handling
- Fund allocation

### End-to-End Tests
- Complete offering flow
- Expense approval and payment
- Month-end closing
- Financial report generation

### Migration Tests
- Data integrity validation
- Balance reconciliation
- Rollback procedures
- Performance testing

---

## Rollback Plan

**If migration fails:**

1. **Keep Transaction model unchanged**
2. **Disable new GL features**
3. **Restore from backup**
4. **Analyze failure points**
5. **Fix issues in test environment**
6. **Retry migration**

**Rollback triggers:**
- Trial balance doesn't balance
- Data loss detected
- Critical bugs in production
- Stakeholder request

---

## Success Criteria

- [ ] All transactions converted to journal entries
- [ ] Trial balance balances (DR = CR)
- [ ] All fund allocations preserved
- [ ] Member attribution maintained
- [ ] Zero data loss
- [ ] Backward compatibility maintained
- [ ] All financial reports accurate
- [ ] User acceptance testing passed
- [ ] Performance benchmarks met
- [ ] Stakeholder approval obtained

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 0: Preparation | 2 weeks | COA design, migration scripts |
| Phase 1: Core Foundation | 4 weeks | Account, JournalEntry models |
| Phase 2: Offering Management | 4 weeks | OfferingBatch, GL integration |
| Phase 3: Data Migration | 4 weeks | Converted data, opening balances |
| Phase 4: Backward Compatibility | 2 weeks | TransactionView service |
| Phase 5: API Development | 4 weeks | GraphQL endpoints |
| Phase 6: Frontend Development | 4 weeks | UI components |
| Phase 7: Advanced Features | 4 weeks | Vendor, Bank, Assets, Tax |
| **Total** | **28 weeks** | **Full accounting system** |

---

## Next Steps

1. **Review and approve this plan** with stakeholders
2. **Set cutover date** (recommend end of fiscal period)
3. **Allocate development resources**
4. **Set up test environment**
5. **Begin Phase 0: Preparation**
6. **Weekly progress reviews**
7. **User training planning**

---

**Document Owner:** Finance Development Team  
**Last Updated:** 2025-10-27  
**Next Review:** Weekly during implementation
