import { PrismaClient } from '@prisma/client';

/**
 * Finance Module Seeder
 * Seeds default Chart of Accounts, Offering Types, and Fiscal Periods
 * Ghana Church-Specific Configuration
 * BRANCH-LEVEL: All data is scoped to organisationId and branchId
 */

export async function seedFinanceData(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
) {
  console.log(`🏦 Seeding Finance Module for Branch: ${branchId}...`);

  // 1. Create Default Chart of Accounts
  await seedChartOfAccounts(prisma, organisationId, branchId);

  // 2. Create Default Offering Types
  await seedOfferingTypes(prisma, organisationId, branchId);

  // 3. Create Fiscal Periods for 2024-2025
  await seedFiscalPeriods(prisma, organisationId, branchId);

  console.log('✅ Finance Module seeded successfully!');
}

/**
 * Seed Chart of Accounts - Ghana Church Standard
 * Branch-specific COA
 */
async function seedChartOfAccounts(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
) {
  console.log('  📊 Creating Chart of Accounts...');

  const accountsData = [
    // ASSETS
    { code: '1000', name: 'ASSETS', type: 'ASSET', subType: null, balance: 'DEBIT', desc: 'All Assets', system: true, parent: null },
    { code: '1010', name: 'Cash - Operating', type: 'ASSET', subType: 'CASH_AND_BANK', balance: 'DEBIT', desc: 'Main operating cash', system: true, parent: '1000' },
    { code: '1011', name: 'Cash - Petty Cash', type: 'ASSET', subType: 'CASH_AND_BANK', balance: 'DEBIT', desc: 'Petty cash', system: false, parent: '1000' },
    { code: '1020', name: 'Mobile Money - MTN', type: 'ASSET', subType: 'MOBILE_MONEY', balance: 'DEBIT', desc: 'MTN MoMo wallet', system: false, parent: '1000' },
    { code: '1021', name: 'Mobile Money - Vodafone', type: 'ASSET', subType: 'MOBILE_MONEY', balance: 'DEBIT', desc: 'Vodafone Cash', system: false, parent: '1000' },
    { code: '1022', name: 'Mobile Money - AirtelTigo', type: 'ASSET', subType: 'MOBILE_MONEY', balance: 'DEBIT', desc: 'AirtelTigo Money', system: false, parent: '1000' },
    { code: '1030', name: 'Bank - GCB Current', type: 'ASSET', subType: 'CASH_AND_BANK', balance: 'DEBIT', desc: 'GCB current account', system: false, parent: '1000' },
    { code: '1031', name: 'Bank - Ecobank Current', type: 'ASSET', subType: 'CASH_AND_BANK', balance: 'DEBIT', desc: 'Ecobank current', system: false, parent: '1000' },
    
    // LIABILITIES
    { code: '2000', name: 'LIABILITIES', type: 'LIABILITY', subType: null, balance: 'CREDIT', desc: 'All Liabilities', system: true, parent: null },
    { code: '2010', name: 'Accounts Payable', type: 'LIABILITY', subType: 'ACCOUNTS_PAYABLE', balance: 'CREDIT', desc: 'Vendor payables', system: true, parent: '2000' },
    
    // EQUITY
    { code: '3000', name: 'NET ASSETS', type: 'EQUITY', subType: null, balance: 'CREDIT', desc: 'All Net Assets', system: true, parent: null },
    { code: '3010', name: 'Net Assets - Unrestricted', type: 'EQUITY', subType: 'NET_ASSETS_UNRESTRICTED', balance: 'CREDIT', desc: 'Unrestricted', system: true, parent: '3000' },
    { code: '3020', name: 'Net Assets - Restricted', type: 'EQUITY', subType: 'NET_ASSETS_RESTRICTED', balance: 'CREDIT', desc: 'Restricted', system: true, parent: '3000' },
    
    // REVENUE
    { code: '4000', name: 'REVENUE', type: 'REVENUE', subType: null, balance: 'CREDIT', desc: 'All Revenue', system: true, parent: null },
    { code: '4010', name: 'Tithe Revenue', type: 'REVENUE', subType: 'TITHE_INCOME', balance: 'CREDIT', desc: 'Tithes', system: true, parent: '4000' },
    { code: '4020', name: 'General Offering Revenue', type: 'REVENUE', subType: 'OFFERING_INCOME', balance: 'CREDIT', desc: 'Sunday offerings', system: true, parent: '4000' },
    { code: '4030', name: 'Harvest Offering Revenue', type: 'REVENUE', subType: 'OFFERING_INCOME', balance: 'CREDIT', desc: 'Harvest', system: false, parent: '4000' },
    { code: '4040', name: 'Building Fund Revenue', type: 'REVENUE', subType: 'DONATION_INCOME', balance: 'CREDIT', desc: 'Building projects', system: false, parent: '4000' },
    { code: '4050', name: 'Missions Revenue', type: 'REVENUE', subType: 'DONATION_INCOME', balance: 'CREDIT', desc: 'Missions support', system: false, parent: '4000' },
    { code: '4060', name: 'Thanksgiving Offering Revenue', type: 'REVENUE', subType: 'OFFERING_INCOME', balance: 'CREDIT', desc: 'Thanksgiving', system: false, parent: '4000' },
    
    // EXPENSES
    { code: '6000', name: 'EXPENSES', type: 'EXPENSE', subType: null, balance: 'DEBIT', desc: 'All Expenses', system: true, parent: null },
    { code: '6010', name: 'Salaries & Wages', type: 'EXPENSE', subType: 'SALARY_EXPENSE', balance: 'DEBIT', desc: 'Staff salaries', system: false, parent: '6000' },
    { code: '6020', name: 'Utilities Expense', type: 'EXPENSE', subType: 'FACILITY_EXPENSE', balance: 'DEBIT', desc: 'Electricity, water', system: false, parent: '6000' },
    { code: '6030', name: 'Rent Expense', type: 'EXPENSE', subType: 'FACILITY_EXPENSE', balance: 'DEBIT', desc: 'Building rent', system: false, parent: '6000' },
    { code: '6040', name: 'Ministry Expense', type: 'EXPENSE', subType: 'MINISTRY_EXPENSE', balance: 'DEBIT', desc: 'Ministry activities', system: false, parent: '6000' },
    { code: '6050', name: 'Administrative Expense', type: 'EXPENSE', subType: 'ADMINISTRATIVE_EXPENSE', balance: 'DEBIT', desc: 'Admin costs', system: false, parent: '6000' },
  ];

  // Create accounts with parent relationships
  const accountMap = new Map();

  for (const acc of accountsData) {
    const exists = await prisma.account.findFirst({
      where: { accountCode: acc.code, organisationId, branchId },
    });

    if (!exists) {
      const parentId = acc.parent ? accountMap.get(acc.parent) : null;
      
      const account = await prisma.account.create({
        data: {
          accountCode: acc.code,
          accountName: acc.name,
          accountType: acc.type as any,
          accountSubType: acc.subType as any,
          normalBalance: acc.balance as any,
          description: acc.desc,
          isSystemAccount: acc.system,
          parentAccountId: parentId,
          organisationId,
          branchId,
          currency: 'GHS',
          isActive: true,
        },
      });
      
      accountMap.set(acc.code, account.id);
      console.log(`    ✓ Created account: ${acc.code} - ${acc.name}`);
    }
  }

  console.log(`  ✅ Chart of Accounts created (${accountsData.length} accounts)`);
}

/**
 * Seed Offering Types - Ghana Church Standard
 * Branch-specific offering types
 */
async function seedOfferingTypes(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
) {
  console.log('  🎁 Creating Offering Types...');

  // Get revenue accounts for linking
  const titheAccount = await prisma.account.findFirst({
    where: { accountCode: '4010', organisationId, branchId },
  });
  const offeringAccount = await prisma.account.findFirst({
    where: { accountCode: '4020', organisationId, branchId },
  });
  const harvestAccount = await prisma.account.findFirst({
    where: { accountCode: '4030', organisationId, branchId },
  });
  const buildingAccount = await prisma.account.findFirst({
    where: { accountCode: '4040', organisationId, branchId },
  });
  const missionsAccount = await prisma.account.findFirst({
    where: { accountCode: '4050', organisationId, branchId },
  });
  const thanksgivingAccount = await prisma.account.findFirst({
    where: { accountCode: '4060', organisationId, branchId },
  });

  const offeringTypes = [
    { name: 'Tithes', desc: '10% of income', accountId: titheAccount?.id, order: 1 },
    { name: 'General Offering', desc: 'Regular Sunday offerings', accountId: offeringAccount?.id, order: 2 },
    { name: 'Harvest Offering', desc: 'Annual harvest celebrations', accountId: harvestAccount?.id, order: 3 },
    { name: 'Building Fund', desc: 'Construction projects', accountId: buildingAccount?.id, order: 4 },
    { name: 'Missions & Outreach', desc: 'Missionary support', accountId: missionsAccount?.id, order: 5 },
    { name: 'Thanksgiving Offering', desc: 'Special thanksgiving', accountId: thanksgivingAccount?.id, order: 6 },
    { name: 'First Fruit Offering', desc: 'Beginning of year/month', accountId: offeringAccount?.id, order: 7 },
    { name: 'Seed Offering', desc: 'Faith-based giving', accountId: offeringAccount?.id, order: 8 },
    { name: 'Welfare/Benevolence', desc: 'Support for needy', accountId: offeringAccount?.id, order: 9 },
  ];

  for (const type of offeringTypes) {
    const exists = await prisma.offeringType.findFirst({
      where: { name: type.name, organisationId, branchId },
    });

    if (!exists) {
      await prisma.offeringType.create({
        data: {
          name: type.name,
          description: type.desc,
          revenueAccountId: type.accountId,
          displayOrder: type.order,
          isActive: true,
          organisationId,
          branchId,
        },
      });
      console.log(`    ✓ Created offering type: ${type.name}`);
    }
  }

  console.log(`  ✅ Offering Types created (${offeringTypes.length} types)`);
}

/**
 * Seed Fiscal Periods - 2024-2025
 * Branch-specific fiscal periods
 */
async function seedFiscalPeriods(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
) {
  console.log('  📅 Creating Fiscal Periods...');

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      const exists = await prisma.fiscalPeriod.findFirst({
        where: {
          fiscalYear: year,
          periodNumber: month,
          organisationId,
          branchId,
        },
      });

      if (!exists) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const monthName = startDate.toLocaleString('default', { month: 'long' });

        await prisma.fiscalPeriod.create({
          data: {
            fiscalYear: year,
            periodNumber: month,
            periodName: `${monthName} ${year}`,
            startDate,
            endDate,
            status: 'OPEN',
            isAdjustmentPeriod: false,
            organisationId,
            branchId,
          },
        });
      }
    }
    console.log(`    ✓ Created fiscal periods for ${year}`);
  }

  console.log(`  ✅ Fiscal Periods created (24 periods)`);
}
