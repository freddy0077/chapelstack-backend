# Financial Management Module (`finances.md`)

## 1. Overview

The Financial Management module provides tools for tracking and managing all financial activities of the church, including tithes, offerings, donations, pledges, expenses, and budgets. It aims to ensure financial transparency, accountability, and efficient resource management for each branch and for the organization as a whole.

Financial data is strictly scoped by branch, with capabilities for consolidated reporting at higher levels.

## 2. Core Responsibilities

-   **Contribution Tracking**: Recording tithes, offerings, and donations from members and external donors (cash, check, online, etc.).
-   **Pledge Management**: Tracking member pledges and their fulfillment status.
-   **Fund Management**: Defining and managing different funds (e.g., General Fund, Building Fund, Missions Fund) and allocating contributions accordingly.
-   **Expense Tracking**: Recording and categorizing church expenses.
-   **Budgeting**: Creating and managing budgets for different branches, departments, or ministries.
-   **Financial Reporting**: Generating various financial reports (e.g., income statements, balance sheets (simplified), giving statements, budget vs. actuals).
-   **Donor Management**: Maintaining records of donors and their giving history.
-   **Online Giving Integration**: Interfacing with online payment gateways to process digital contributions.
-   **Batch Entry**: Facilitating efficient entry of multiple contributions (e.g., from Sunday collections).

## 3. Key Entities & Data Models

*(Detail the Prisma/TypeORM entities or database schema here. Include entities like `Contribution`, `Pledge`, `Fund`, `Expense`, `Budget`, `Donor`, `Transaction`, etc.)*

```typescript
// Example Placeholder Schema
model Fund {
  id          String    @id @default(cuid())
  name        String
  description String?
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  isActive    Boolean   @default(true)
  // contributions Contribution[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Contribution {
  id              String    @id @default(cuid())
  memberId        String?   // If from a registered member
  // member       Member?   @relation(fields: [memberId], references: [id])
  donorName       String?   // If anonymous or non-member
  donorEmail      String?
  amount          Float
  currency        String    @default("USD")
  contributionDate DateTime
  paymentMethod   PaymentMethod // Enum: CASH, CHECK, ONLINE_CARD, BANK_TRANSFER, OTHER
  checkNumber     String?
  transactionId   String?   // For online payments
  fundId          String
  // fund         Fund      @relation(fields: [fundId], references: [id])
  notes           String?
  isTaxDeductible Boolean   @default(true)
  branchId        String
  // branch       Branch    @relation(fields: [branchId], references: [id])
  batchId         String?   // For batch entry
  // batch        ContributionBatch? @relation(fields: [batchId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum PaymentMethod {
  CASH
  CHECK
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  ONLINE_PAYMENT
  OTHER
}

model Pledge {
  id          String    @id @default(cuid())
  memberId    String
  // member   Member    @relation(fields: [memberId], references: [id])
  fundId      String
  // fund     Fund      @relation(fields: [fundId], references: [id])
  totalAmount Float
  startDate   DateTime
  endDate     DateTime
  frequency   PledgeFrequency // Enum: ONE_TIME, WEEKLY, MONTHLY, ANNUALLY
  // contributionsMade Contribution[] // (May need a more complex relation or calculated field)
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum PledgeFrequency {
  ONE_TIME
  WEEKLY
  BI_WEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
}
```

## 4. Core Functionalities & Use Cases

-   Finance team enters weekly cash and check offerings into a batch.
-   A member makes an online donation to the Building Fund.
-   Admin generates year-end giving statements for all members.
-   Treasurer creates a budget for the upcoming fiscal year for their branch.
-   Pastor views a report of contributions received for a specific fund.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here.)*

### GraphQL (Example)

**Queries:**
-   `contribution(id: ID!): Contribution`
-   `listContributions(branchId: ID!, filter: ContributionFilterInput): [Contribution!]`
-   `memberGivingHistory(memberId: ID!): [Contribution!]`
-   `fund(id: ID!): Fund`
-   `listFunds(branchId: ID!): [Fund!]`
-   `pledge(id: ID!): Pledge`
-   `listPledges(memberId: ID, branchId: ID!): [Pledge!]`

**Mutations:**
-   `createContribution(input: CreateContributionInput!): Contribution`
-   `createContributionBatch(input: CreateContributionBatchInput!): Boolean`
-   `createFund(input: CreateFundInput!): Fund`
-   `updateFund(id: ID!, input: UpdateFundInput!): Fund`
-   `createPledge(input: CreatePledgeInput!): Pledge`
-   `recordPledgePayment(pledgeId: ID!, contributionInput: CreateContributionInput!): Contribution`

## 6. Integration with Other Modules

-   **Member Management**: Links contributions and pledges to member profiles.
-   **Branch Management**: All financial data is scoped by branch; enables consolidated reporting.
-   **Reporting & Analytics**: Provides data for financial reports and dashboards.
-   **Event Management**: Potentially for tracking event-specific fundraising or fees.

## 7. Security Considerations

-   **High Security**: Financial data is extremely sensitive. Strict access controls are paramount.
-   **PCI Compliance**: If processing online payments directly, PCI DSS compliance is necessary (often handled by third-party payment gateways).
-   **Audit Trails**: Detailed logging of all financial transactions and modifications.
-   **Data Accuracy**: Mechanisms to ensure accuracy of financial entries (e.g., double-entry principles if applicable, reconciliation processes).
-   Fraud prevention measures.

## 8. Future Considerations

-   Full accounting system features (general ledger, chart of accounts, bank reconciliation).
-   Integration with accounting software (e.g., QuickBooks, Xero).
-   Payroll management for church staff.
-   Asset management.
