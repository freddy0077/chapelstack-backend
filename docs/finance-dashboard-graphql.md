# GraphQL API for Finance Dashboard

This document outlines the GraphQL queries designed to support the finance dashboard functionalities within the Church Management System. These queries fetch various financial data points, including summaries, statements, budget comparisons, and transactional lists.

## General Conventions

*   **`DateTime` Scalar**: Represents date-time strings, typically in ISO 8601 format (e.g., `"2023-10-27T10:00:00Z"`).
*   **`JSON` Scalar**: Represents complex data structures whose specific shape is determined by the backend resolver. Frontend clients will need to parse this JSON accordingly.
*   **`ID` Scalar**: Represents unique identifiers for entities.
*   **Pagination**: Queries returning lists (e.g., contributions, expenses) typically support pagination via `skip` and `take` arguments, often within a `pagination` input object. They might return a paginated structure (e.g., with `items`, `totalCount`, `hasNextPage`).
*   **Filtering**: List queries usually accept filter arguments (e.g., `branchId`, date ranges) to narrow down results, often within a `filter` input object.
*   **`branchId`**: Most finance queries are scoped to a specific branch and require a `branchId`.

---

## Core Finance Queries

### 1. Get General Finance Dashboard Data

Fetches pre-configured widgets, charts, and Key Performance Indicator (KPI) cards specifically for the finance dashboard.

**Query:**

```graphql
query GetFinanceDashboardData($branchId: ID!) {
  dashboardData(branchId: $branchId, dashboardType: FINANCE) {
    branchId
    branchName
    dashboardType
    generatedAt
    charts {
      chartType
      data # JSON
      title
      widgetType
    }
    kpiCards {
      icon
      percentChange
      title
      value
      widgetType
    }
    widgets {
      __typename
      ... on AnnouncementsWidget {
        announcements {
          author
          content
          date
          id
          priority
          title
        }
        title
        widgetType
      }
      ... on ChartData { # ChartData can also be a direct widget
        chartType
        data # JSON
        title
        widgetType
      }
      # ... (include other widget types as per the full query)
    }
  }
}
```

**Variables:**

*   `branchId: ID!`: The ID of the branch for which to fetch dashboard data.

**Returns:** A `DashboardData` object containing arrays of `charts`, `kpiCards`, and a `widgets` union which can include various types like `AnnouncementsWidget`, `ChartData`, `KpiCard`, `MyGroupsWidget`, etc.

---

### 2. Get Income Statement

Provides a summary of income and expenses over a specified period for a branch.

**Query:**

```graphql
query GetIncomeStatement($branchId: ID!, $startDate: DateTime!, $endDate: DateTime!) {
  incomeStatement(branchId: $branchId, startDate: $startDate, endDate: $endDate) {
    branchId
    startDate
    endDate
    income     # JSON data (e.g., categorized income)
    expenses   # JSON data (e.g., categorized expenses)
    netIncome
  }
}
```

**Variables:**

*   `branchId: ID!`: The ID of the branch.
*   `startDate: DateTime!`: The start date for the income statement period.
*   `endDate: DateTime!`: The end date for the income statement period.

**Returns:** An `IncomeStatement` object. The `income` and `expenses` fields are `JSON` and their structure is determined by the backend.

---

### 3. Get Budget vs. Actual Spending

Compares budgeted amounts against actual expenditures for a given fiscal year and branch.

**Query:**

```graphql
query GetBudgetVsActual($branchId: ID!, $fiscalYear: Float!) { # Confirm if fiscalYear should be Int!
  budgetVsActual(branchId: $branchId, fiscalYear: $fiscalYear) {
    branchId
    fiscalYear
    byCategory # JSON data (e.g., categorized budget vs. actual figures)
    totals     # JSON data (e.g., overall totals for budget vs. actual)
  }
}
```

**Variables:**

*   `branchId: ID!`: The ID of the branch.
*   `fiscalYear: Float!`: The fiscal year for the comparison. (Note: Schema showed `Float!`, confirm if `Int!` is more appropriate).

**Returns:** A `BudgetVsActual` object. `byCategory` and `totals` are `JSON` fields whose structure is determined by the backend.

---

### 4. Get Fund Balances

Shows the balance for various funds within a branch as of a specific date.

**Query:**

```graphql
query GetFundBalances($branchId: ID!, $asOfDate: DateTime!) {
  fundBalances(branchId: $branchId, asOfDate: $asOfDate) {
    branchId
    asOfDate
    fundBalances # JSON data (e.g., a map of fund names/IDs to their balances)
  }
}
```

**Variables:**

*   `branchId: ID!`: The ID of the branch.
*   `asOfDate: DateTime!`: The date for which to report fund balances.

**Returns:** A `FundBalance` object. `fundBalances` is a `JSON` field whose structure is determined by the backend.

---

### 5. Get List of Contributions

Fetches a list of contributions, allowing for filtering by various criteria (branch, fund, date range, etc.) and pagination.

**Query Snippet (Illustrative - refer to full query for all fields):**

```graphql
query GetContributionsList(
  $branchId: ID
  $fundId: ID
  $contributionTypeId: ID
  $memberId: ID
  $startDate: DateTime
  $endDate: DateTime
  $skip: Int = 0
  $take: Int = 10
) {
  contributions(
    filter: { # Example filter structure
      branchId: $branchId
      fundId: $fundId
      # ... other filters
    }
    pagination: { skip: $skip, take: $take }
  ) {
    # Paginated structure might apply (items, totalCount, hasNextPage)
    # items {
      id
      amount
      date
      contributionType { id name }
      fund { id name }
      memberId # or member { id firstName lastName }
      paymentMethod { id name }
      # ... other Contribution fields
    # }
  }
}
```

**Variables (Example):**

*   `branchId: ID` (Optional)
*   `fundId: ID` (Optional)
*   `startDate: DateTime` (Optional)
*   `endDate: DateTime` (Optional)
*   `skip: Int` (Optional, for pagination, default: 0)
*   `take: Int` (Optional, for pagination, default: 10)

**Returns:** An array of `Contribution` objects (potentially within a paginated structure). Each contribution includes details like amount, date, type, fund, and payment method.

---

### 6. Get List of Expenses

Fetches a list of expenses, allowing for filtering by various criteria (branch, category, fund, vendor, date range, etc.) and pagination.

**Query Snippet (Illustrative - refer to full query for all fields):**

```graphql
query GetExpensesList(
  $branchId: ID
  $categoryId: ID
  $fundId: ID
  $vendorId: ID
  $startDate: DateTime
  $endDate: DateTime
  $skip: Int = 0
  $take: Int = 10
) {
  expenses(
    filter: { # Example filter structure
      branchId: $branchId
      categoryId: $categoryId
      # ... other filters
    }
    pagination: { skip: $skip, take: $take }
  ) {
    # Paginated structure might apply (items, totalCount, hasNextPage)
    # items {
      id
      amount
      date
      description
      category { id name }
      fund { id name }
      vendorName # or vendor { id name }
      paymentMethod { id name }
      # ... other Expense fields
    # }
  }
}
```

**Variables (Example):**

*   `branchId: ID` (Optional)
*   `categoryId: ID` (Optional)
*   `startDate: DateTime` (Optional)
*   `endDate: DateTime` (Optional)
*   `skip: Int` (Optional, for pagination, default: 0)
*   `take: Int` (Optional, for pagination, default: 10)

**Returns:** An array of `Expense` objects (potentially within a paginated structure). Each expense includes details like amount, date, description, category, fund, and vendor information.

---

## Important Considerations

*   **JSON Field Structures**: For fields typed as `JSON` (e.g., `income` in `IncomeStatement`, `data` in `ChartData`), the exact structure of the JSON content is determined by the backend resolvers. Consult backend documentation or inspect sample responses to understand how to parse these fields.
*   **Filter and Pagination Input Types**: The exact structure of `filter` and `pagination` input objects should be verified against the GraphQL schema.
*   **Root Query Field Names**: The names of the root query fields (e.g., `dashboardData`, `contributions`) should match the schema. If they are nested (e.g., `finance { incomeStatement }`), adjust queries accordingly.
*   **Error Handling**: Implement proper error handling on the client-side to manage API errors or unexpected responses.

This document provides a comprehensive overview for interacting with the finance-related GraphQL API. Always refer to the canonical GraphQL schema for the most up-to-date definitions and capabilities.

---

## Finance Mutations

This section details the mutations available for creating, updating, and deleting finance-related entities.

### Batch Processing Mutations

Mutations for managing contribution batches.

**1. Create Batch**

```graphql
mutation CreateBatch($input: CreateBatchInput!) {
  createBatch(input: $input) {
    id
    name
    branchId
    date
    status
    expectedAmount
    actualAmount
    # ... other Batch fields
  }
}
```
*   **Input:** `CreateBatchInput!`
*   **Returns:** `Batch!`

**2. Process Batch Contributions**

```graphql
mutation ProcessBatchContributions($input: BatchContributionInput!) {
  processBatchContributions(input: $input) {
    id
    amount
    # ... other Contribution fields
  }
}
```
*   **Input:** `BatchContributionInput!` (Likely contains batch ID and contribution details)
*   **Returns:** `[Contribution!]!`

**3. Reconcile Batch**

```graphql
mutation ReconcileBatch($batchId: ID!, $actualAmount: Float!) {
  reconcileBatch(batchId: $batchId, actualAmount: $actualAmount) {
    id # Contribution ID, or Batch ID if it returns Batch
    # ... fields of the returned type (Contribution or Batch)
  }
}
```
*   **Variables:** `batchId: ID!`, `actualAmount: Float!`
*   **Returns:** `Contribution!` (Schema indicates Contribution, verify if Batch is more appropriate)

**4. Update Batch**

```graphql
mutation UpdateBatch($input: UpdateBatchInput!) {
  updateBatch(input: $input) {
    id
    name
    status
    # ... other Batch fields
  }
}
```
*   **Input:** `UpdateBatchInput!` (Likely includes `id` of the batch)
*   **Returns:** `Batch!`

**5. Remove Batch**

```graphql
mutation RemoveBatch($id: ID!) {
  removeBatch(id: $id) {
    id # Confirms removal
    # ... other Batch fields if returned
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Batch!`

**6. Close Batch**

```graphql
mutation CloseBatch($batchId: ID!) {
  closeBatch(batchId: $batchId) {
    id # Contribution ID, or Batch ID
    # ... fields of the returned type (Contribution or Batch)
  }
}
```
*   **Variables:** `batchId: ID!`
*   **Returns:** `Contribution!` (Schema indicates Contribution, verify if Batch is more appropriate)

### Budget Mutations

Mutations for managing budgets and budget items.

**1. Create Budget**

```graphql
mutation CreateBudget($input: CreateBudgetInput!) {
  createBudget(input: $input) {
    id
    name
    fiscalYear
    totalAmount
    # ... other Budget fields
  }
}
```
*   **Input:** `CreateBudgetInput!`
*   **Returns:** `Budget!`

**2. Create Budget Item**

```graphql
mutation CreateBudgetItem($input: CreateBudgetItemInput!) {
  createBudgetItem(input: $input) {
    id
    name
    amount
    # ... other BudgetItem fields
  }
}
```
*   **Input:** `CreateBudgetItemInput!`
*   **Returns:** `BudgetItem!`

**3. Update Budget**

```graphql
mutation UpdateBudget($input: UpdateBudgetInput!) {
  updateBudget(input: $input) {
    id
    name
    status
    # ... other Budget fields
  }
}
```
*   **Input:** `UpdateBudgetInput!` (Includes `id` of the budget)
*   **Returns:** `Budget!`

**4. Update Budget Item**

```graphql
mutation UpdateBudgetItem($input: UpdateBudgetItemInput!) {
  updateBudgetItem(input: $input) {
    id
    name
    amount
    # ... other BudgetItem fields
  }
}
```
*   **Input:** `UpdateBudgetItemInput!` (Includes `id` of the budget item)
*   **Returns:** `BudgetItem!`

**5. Update Budget Status**

```graphql
mutation UpdateBudgetStatus($id: ID!, $status: String!) {
  updateBudgetStatus(id: $id, status: $status) {
    id
    status
    # ... other Budget fields
  }
}
```
*   **Variables:** `id: ID!`, `status: String!`
*   **Returns:** `Budget!`

**6. Remove Budget**

```graphql
mutation RemoveBudget($id: ID!) {
  removeBudget(id: $id) {
    id # Confirms removal
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Budget!`

**7. Remove Budget Item**

```graphql
mutation RemoveBudgetItem($id: ID!) {
  removeBudgetItem(id: $id) {
    id # Confirms removal
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `BudgetItem!`

### Contribution Mutations

Mutations for managing contributions.

**1. Create Contribution**

```graphql
mutation CreateContribution($input: CreateContributionInput!) {
  createContribution(input: $input) {
    id
    amount
    date
    # ... other Contribution fields
  }
}
```
*   **Input:** `CreateContributionInput!`
*   **Returns:** `Contribution!`

**2. Update Contribution**

```graphql
mutation UpdateContribution($input: UpdateContributionInput!) {
  updateContribution(input: $input) {
    id
    amount
    # ... other Contribution fields
  }
}
```
*   **Input:** `UpdateContributionInput!` (Includes `id` of the contribution)
*   **Returns:** `Contribution!`

**3. Remove Contribution**

```graphql
mutation RemoveContribution($id: ID!) {
  removeContribution(id: $id) {
    id # Confirms removal
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Contribution!`

### Expense Mutations

Mutations for managing expenses.

**1. Create Expense**

```graphql
mutation CreateExpense($input: CreateExpenseInput!) {
  createExpense(input: $input) {
    id
    amount
    date
    description
    # ... other Expense fields
  }
}
```
*   **Input:** `CreateExpenseInput!`
*   **Returns:** `Expense!`

**2. Update Expense**

```graphql
mutation UpdateExpense($input: UpdateExpenseInput!) {
  updateExpense(input: $input) {
    id
    amount
    description
    # ... other Expense fields
  }
}
```
*   **Input:** `UpdateExpenseInput!` (Includes `id` of the expense)
*   **Returns:** `Expense!`

**3. Remove Expense**

```graphql
mutation RemoveExpense($id: ID!) {
  removeExpense(id: $id) {
    id # Confirms removal
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Expense!`

### Fund Mutations

Mutations for managing funds.

**1. Create Fund**

```graphql
mutation CreateFund($input: CreateFundInput!) {
  createFund(input: $input) {
    id
    name
    isActive
    # ... other Fund fields
  }
}
```
*   **Input:** `CreateFundInput!`
*   **Returns:** `Fund!`

**2. Update Fund**

```graphql
mutation UpdateFund($input: UpdateFundInput!) {
  updateFund(input: $input) {
    id
    name
    isActive
    # ... other Fund fields
  }
}
```
*   **Input:** `UpdateFundInput!` (Includes `id` of the fund)
*   **Returns:** `Fund!`

**3. Remove Fund**

```graphql
mutation RemoveFund($id: ID!) {
  removeFund(id: $id) {
    id # Confirms removal
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Fund!`

### Pledge Mutations

Mutations for managing pledges.

**1. Create Pledge**

```graphql
mutation CreatePledge($input: CreatePledgeInput!) {
  createPledge(input: $input) {
    id
    amount
    frequency
    # ... other Pledge fields
  }
}
```
*   **Input:** `CreatePledgeInput!`
*   **Returns:** `Pledge!`

**2. Update Pledge**

```graphql
mutation UpdatePledge($input: UpdatePledgeInput!) {
  updatePledge(input: $input) {
    id
    amount
    status
    # ... other Pledge fields
  }
}
```
*   **Input:** `UpdatePledgeInput!` (Includes `id` of the pledge)
*   **Returns:** `Pledge!`

**3. Update Pledge Status**

```graphql
mutation UpdatePledgeStatus($id: ID!, $status: String!) {
  updatePledgeStatus(id: $id, status: $status) {
    id
    status
    # ... other Pledge fields
  }
}
```
*   **Variables:** `id: ID!`, `status: String!`
*   **Returns:** `Pledge!`

**4. Remove Pledge**

```graphql
mutation RemovePledge($id: ID!) {
  removePledge(id: $id) {
    id # Confirms removal
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Pledge!`

**5. Check Pledge Fulfillment**

```graphql
mutation CheckPledgeFulfillment {
  checkPledgeFulfillment {
    id # This seems to be a global check, returns a Pledge. Clarify behavior.
    # ... other Pledge fields
  }
}
```
*   **Variables:** None
*   **Returns:** `Pledge!` (The schema suggests it returns a single Pledge, which might be one that needs attention or a summary. This needs clarification from backend logic.)

### Financial Data Import Mutations

Mutations for importing financial data.

**1. Import Financial Data**

```graphql
mutation ImportFinancialData($branchId: ID!, $file: Upload!, $mapping: String!, $type: String!) {
  importFinancialData(branchId: $branchId, file: $file, mapping: $mapping, type: $type) {
    success
    message
    importedRecords
    totalRecords
    errors {
      row
      column
      message
    }
  }
}
```
*   **Variables:** `branchId: ID!`, `file: Upload!`, `mapping: String!` (JSON string or identifier for mapping config), `type: String!` (e.g., "contributions", "expenses")
*   **Returns:** `ImportResult!`

---

## Additional Finance Queries

This section lists other finance-related queries that are not strictly for the main dashboard view but are useful for detailed financial management and reporting.

### Detailed Batch Queries

**1. Get Batch Details**

```graphql
query GetBatch($id: ID!) {
  batch(id: $id) {
    id
    name
    branchId
    date
    status
    expectedAmount
    actualAmount
    itemCount
    notes
    # ... contributions { ... } (if nested)
    createdAt
    updatedAt
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Batch`

**2. List Batches**

```graphql
query ListBatches($branchId: ID, $status: String) {
  batches(branchId: $branchId, status: $status) {
    id
    name
    date
    status
    expectedAmount
    actualAmount
    itemCount
  }
}
```
*   **Variables (Optional):** `branchId: ID`, `status: String`
*   **Returns:** `[Batch!]!`

### Detailed Budget Queries

**1. Get Budget Details**

```graphql
query GetBudget($id: ID!) {
  budget(id: $id) {
    id
    name
    branchId
    fiscalYear
    fundId
    totalAmount
    status
    description
    notes
    # ... items { ... } (if nested budget items)
    createdAt
    updatedAt
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Budget`

**2. List Budgets**

```graphql
query ListBudgets($branchId: ID, $fiscalYear: Int, $fundId: ID, $status: String) {
  budgets(branchId: $branchId, fiscalYear: $fiscalYear, fundId: $fundId, status: $status) {
    id
    name
    fiscalYear
    totalAmount
    status
  }
}
```
*   **Variables (Optional):** `branchId: ID`, `fiscalYear: Int`, `fundId: ID`, `status: String`
*   **Returns:** `[Budget!]!`

**3. Get Expenses for a Budget**

```graphql
query GetBudgetExpenses($budgetId: ID!) {
  budgetExpenses(budgetId: $budgetId) {
    id
    amount
    date
    description
    # ... other Expense fields
  }
}
```
*   **Variables:** `budgetId: ID!`
*   **Returns:** `[Expense!]!`

### Detailed Contribution Queries

**1. Get Contribution Details**

```graphql
query GetContribution($id: ID!) {
  contribution(id: $id) {
    id
    amount
    date
    memberId
    fundId
    contributionTypeId
    paymentMethodId
    batchId
    # ... all other Contribution fields
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Contribution`

*(Note: The `contributions` list query is already in the "Core Finance Queries" section, but can be referenced here too.)*

**2. Get Contributions for a Member**

```graphql
query GetMemberContributions($memberId: ID!) {
  memberContributions(memberId: $memberId) {
    id
    amount
    date
    fundId
    contributionTypeId
    # ... other Contribution fields
  }
}
```
*   **Variables:** `memberId: ID!`
*   **Returns:** `[Contribution!]!`

### Detailed Expense Queries

**1. Get Expense Details**

```graphql
query GetExpense($id: ID!) {
  expense(id: $id) {
    id
    amount
    date
    description
    vendorId
    expenseCategoryId
    fundId
    paymentMethodId
    # ... all other Expense fields
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Expense`

*(Note: The `expenses` list query is already in the "Core Finance Queries" section, but can be referenced here too.)*

**2. Get Expenses for a Category**

```graphql
query GetCategoryExpenses($categoryId: ID!) {
  categoryExpenses(categoryId: $categoryId) {
    id
    amount
    date
    description
    # ... other Expense fields
  }
}
```
*   **Variables:** `categoryId: ID!`
*   **Returns:** `[Expense!]!`

**3. Get Expenses for a Fund**

```graphql
query GetFundExpenses($fundId: ID!) {
  fundExpenses(fundId: $fundId) {
    id
    amount
    date
    description
    # ... other Expense fields
  }
}
```
*   **Variables:** `fundId: ID!`
*   **Returns:** `[Expense!]!`

**4. Get Expenses for a Vendor**

```graphql
query GetVendorExpenses($vendorId: ID!) {
  vendorExpenses(vendorId: $vendorId) {
    id
    amount
    date
    description
    # ... other Expense fields
  }
}
```
*   **Variables:** `vendorId: ID!`
*   **Returns:** `[Expense!]!`

### Detailed Fund Queries

**1. Get Fund Details**

```graphql
query GetFund($id: ID!) {
  fund(id: $id) {
    id
    name
    branchId
    isActive
    description
    createdAt
    updatedAt
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Fund`

**2. List Funds**

```graphql
query ListFunds($branchId: ID) {
  funds(branchId: $branchId) {
    id
    name
    isActive
    description
  }
}
```
*   **Variables (Optional):** `branchId: ID`
*   **Returns:** `[Fund!]!`

*(Note: The `fundBalances` query is already in the "Core Finance Queries" section.)*

**3. Generate Funds Import Template**

```graphql
query GenerateFundsImportTemplate {
  generateFundsImportTemplate
}
```
*   **Variables:** None
*   **Returns:** `String!` (Likely a CSV template string or URL to a template)

### Detailed Pledge Queries

**1. Get Pledge Details**

```graphql
query GetPledge($id: ID!) {
  pledge(id: $id) {
    id
    memberId
    fundId
    amount
    frequency
    startDate
    endDate
    status
    amountFulfilled
    # ... all other Pledge fields
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Pledge`

**2. List Pledges**

```graphql
query ListPledges($branchId: ID, $fundId: ID, $memberId: ID, $status: String) {
  pledges(branchId: $branchId, fundId: $fundId, memberId: $memberId, status: $status) {
    id
    memberId
    fundId
    amount
    frequency
    status
  }
}
```
*   **Variables (Optional):** `branchId: ID`, `fundId: ID`, `memberId: ID`, `status: String`
*   **Returns:** `[Pledge!]!`

**3. Get Pledges for a Fund**

```graphql
query GetFundPledges($fundId: ID!) {
  fundPledges(fundId: $fundId) {
    id
    memberId
    amount
    frequency
    status
    # ... other Pledge fields
  }
}
```
*   **Variables:** `fundId: ID!`
*   **Returns:** `[Pledge!]!`

**4. Get Pledges for a Member**

```graphql
query GetMemberPledges($memberId: ID!) {
  memberPledges(memberId: $memberId) {
    id
    fundId
    amount
    frequency
    status
    # ... other Pledge fields
  }
}
```
*   **Variables:** `memberId: ID!`
*   **Returns:** `[Pledge!]!`

### Vendor Queries

**1. Get Vendor Details**

```graphql
query GetVendor($id: ID!) {
  vendor(id: $id) {
    id
    name
    branchId
    contactName
    email
    phone
    # ... all other Vendor fields
  }
}
```
*   **Variables:** `id: ID!`
*   **Returns:** `Vendor`

**2. List Vendors**

```graphql
query ListVendors($branchId: ID) {
  vendors(branchId: $branchId) {
    id
    name
    contactName
    email
    phone
  }
}
```
*   **Variables (Optional):** `branchId: ID`
*   **Returns:** `[Vendor!]!`

**3. Search Vendors**

```graphql
query SearchVendors($branchId: ID, $name: String!) {
  searchVendors(branchId: $branchId, name: $name) {
    id
    name
    contactName
  }
}
```
*   **Variables:** `name: String!`, `branchId: ID` (Optional)
*   **Returns:** `[Vendor!]!`

### Financial Reporting Queries

**1. Get Giving Statement**

```graphql
query GetGivingStatement($memberId: ID!, $startDate: DateTime!, $endDate: DateTime!) {
  givingStatement(memberId: $memberId, startDate: $startDate, endDate: $endDate) {
    member # JSON
    startDate
    endDate
    contributions # JSON
    totalsByFund # JSON
    totalsByType # JSON
    grandTotal
  }
}
```
*   **Variables:** `memberId: ID!`, `startDate: DateTime!`, `endDate: DateTime!`
*   **Returns:** `GivingStatement` (Contains several `JSON` fields requiring client-side parsing)

**2. Generate Generic Report**

```graphql
query GenerateReport($input: ReportRequestInput!) {
  generateReport(input: $input) {
    reportType
    format
    generatedAt
    data # JSON
    downloadUrl
    message
  }
}
```
*   **Input:** `ReportRequestInput!` (Includes `reportType`, `filter`, `outputFormat`)
*   **Returns:** `ReportOutput!` (The `data` field is `JSON` and its structure depends on the `reportType`)

This document provides a comprehensive overview for interacting with the finance-related GraphQL API. Always refer to the canonical GraphQL schema for the most up-to-date definitions and capabilities.

