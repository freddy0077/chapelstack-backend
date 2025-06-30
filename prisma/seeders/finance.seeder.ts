import { PrismaClient, Member, Fund, ContributionType, PaymentMethod, ExpenseCategory, Vendor, TransactionType, Transaction, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

// --- Transaction Seeder ---
async function seedTransactions(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
  funds: Fund[],
  users: User[],
  members: Member[],
  contributionTypes: ContributionType[],
  paymentMethods: PaymentMethod[],
  vendors: Vendor[],
  expenseCategories: ExpenseCategory[],
) {
  const transactionTypes = Object.values(TransactionType);
  let seededCount = 0;
  console.log('    Seeding transactions...');
  for (const type of transactionTypes) {
    for (let i = 0; i < 50; i++) { // More per type for realistic data
      const fund = faker.helpers.arrayElement(funds);
      const user = users.length > 0 ? faker.helpers.arrayElement(users) : undefined;
      const member = members.length > 0 ? faker.helpers.arrayElement(members) : undefined;
      const contributionType = contributionTypes.length > 0 ? faker.helpers.arrayElement(contributionTypes) : undefined;
      const paymentMethod = paymentMethods.length > 0 ? faker.helpers.arrayElement(paymentMethods) : undefined;
      const vendor = vendors.length > 0 ? faker.helpers.arrayElement(vendors) : undefined;
      const expenseCategory = expenseCategories.length > 0 ? faker.helpers.arrayElement(expenseCategories) : undefined;

      // Base transaction data
      const baseData = {
        organisationId,
        branchId,
        fundId: fund.id,
        userId: user?.id,
        type,
        amount: parseFloat(faker.finance.amount({ min: 10, max: 5000 })),
        date: faker.date.between({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() }),
        description: faker.lorem.sentence(),
        reference: faker.string.alphanumeric(10),
        metadata: {},
      };

      // Add extra fields to metadata for realistic linkage
      if (type === TransactionType.CONTRIBUTION) {
        baseData.metadata = {
          memberId: member?.id,
          contributionTypeId: contributionType?.id,
          paymentMethodId: paymentMethod?.id,
          isAnonymous: faker.datatype.boolean(),
        };
      } else if (type === TransactionType.EXPENSE) {
        baseData.metadata = {
          vendorId: vendor?.id,
          expenseCategoryId: expenseCategory?.id,
        };
      } else if (type === TransactionType.TRANSFER) {
        baseData.metadata = {
          transferToFundId: faker.helpers.arrayElement(funds).id,
        };
      } else if (type === TransactionType.FUND_ALLOCATION) {
        baseData.metadata = {
          allocationReason: faker.lorem.words(3),
        };
      }

      await prisma.transaction.create({ data: baseData });
      seededCount++;
    }
  }
  console.log(`    Seeded ${seededCount} transactions.`);
}

// --- Main Seeder ---
export async function seedFinanceData(
  prisma: PrismaClient,
  coreData: {
    organisation: { id: string };
    branch: { id: string };
    members: Member[];
    users?: User[];
  },
) {
  console.log('  Seeding finance data...');
  const { organisation, branch, members, users = [] } = coreData;

  // Seed Funds
  const funds = await seedFunds(prisma, organisation.id, branch.id);
  // Seed Contribution Types
  const contributionTypes = await seedContributionTypes(prisma, organisation.id, branch.id);
  // Seed Payment Methods
  const paymentMethods = await seedPaymentMethods(prisma, organisation.id, branch.id);
  // Seed Vendors
  const vendors = await seedVendors(prisma, organisation.id, branch.id);
  // Seed Expense Categories
  const expenseCategories = await seedExpenseCategories(prisma, organisation.id, branch.id);

  // Seed all transactions (all types)
  await seedTransactions(
    prisma,
    organisation.id,
    branch.id,
    funds,
    users,
    members,
    contributionTypes,
    paymentMethods,
    vendors,
    expenseCategories,
  );

  console.log('  Finance data seeding complete.');
}

// --- Keep only the supporting seeders for lookup tables (funds, types, methods, vendors, categories) ---
async function seedFunds(prisma: PrismaClient, organisationId: string, branchId: string) {
  const fundNames = [
    'General Fund',
    'Building Fund',
    'Missions Fund',
    'Youth Ministry',
    'Community Outreach',
  ];
  const funds: Fund[] = [];
  for (const name of fundNames) {
    const fund = await prisma.fund.upsert({
      where: { fund_unique_constraint: { name, organisationId, branchId } },
      update: {},
      create: {
        name,
        description: `Fund for ${name}`,
        organisationId,
        branchId,
      },
    });
    funds.push(fund);
  }
  return funds;
}

async function seedContributionTypes(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
) {
  const contributionTypesData = [
    'Tithe',
    'Offering',
    'Pledge',
    'Donation',
    'Special Contribution',
  ];
  const contributionTypes: ContributionType[] = [];
  for (const name of contributionTypesData) {
    const ct = await prisma.contributionType.upsert({
      where: { contribution_type_unique_constraint: { name, organisationId, branchId } },
      update: {},
      create: {
        name,
        description: `Contributions made via ${name}`,
        organisationId,
        branchId,
      },
    });
    contributionTypes.push(ct);
  }
  return contributionTypes;
}

async function seedPaymentMethods(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
) {
  const paymentMethodsData = [
    'Cash',
    'Credit Card',
    'Bank Transfer',
    'Mobile Money',
    'Cheque',
  ];
  const paymentMethods: PaymentMethod[] = [];
  for (const name of paymentMethodsData) {
    const pm = await prisma.paymentMethod.upsert({
      where: { payment_method_unique_constraint: { name, organisationId, branchId } },
      update: {},
      create: {
        name,
        organisationId,
        branchId,
      },
    });
    paymentMethods.push(pm);
  }
  return paymentMethods;
}

async function seedExpenseCategories(prisma: PrismaClient, organisationId: string, branchId: string): Promise<ExpenseCategory[]> {
  const expenseCategoriesData = ['Utilities', 'Salaries', 'Rent', 'Supplies', 'Maintenance', 'Events'];
  const expenseCategories: ExpenseCategory[] = [];
  for (const name of expenseCategoriesData) {
    const category = await prisma.expenseCategory.upsert({
      where: { expense_category_unique_constraint: { name, organisationId, branchId } },
      update: {},
      create: {
        name,
        description: `Expenses related to ${name}`,
        organisationId,
        branchId,
      },
    });
    expenseCategories.push(category);
  }
  return expenseCategories;
}

async function seedVendors(prisma: PrismaClient, organisationId: string, branchId: string): Promise<Vendor[]> {
  const vendorsData = ['Office Depot', 'Power & Light Co', 'City Water', 'Cleaning Services Inc.'];
  const vendors: Vendor[] = [];
  for (const name of vendorsData) {
    const vendor = await prisma.vendor.upsert({
      where: { vendor_unique_constraint: { name, organisationId, branchId } },
      update: {},
      create: {
        name,
        phone: faker.phone.number(),
        organisationId,
        branchId,
      },
    });
    vendors.push(vendor);
  }
  return vendors;
}
