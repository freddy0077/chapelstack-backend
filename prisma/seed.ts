import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/userSeeder';
import { seedCoreData } from './seeders/core.seeder';
import { seedSubscriptionManager } from './seeders/subscription-manager.seeder';
import { seedFinanceData } from './seeders/finance.seeder';
import { seedSystemTemplates } from './seeders/system-templates.seeder';
import { seedRoleSystem } from './seeders/role-system.seeder';
import { seedModules } from './seeders/module.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...');

  // Seed modules (all 42 modules with dependencies and settings)
  await seedModules(prisma);
  console.log('✅ Modules seeded (42 modules with dependencies and settings).');

  // Seed role system (centralized roles, permissions, modules)
  // await seedRoleSystem(prisma);
  // console.log('✅ Role system seeded (roles, permissions, modules).');

  // Seed core data (Organisation, Branch, Roles)
  // const coreData = await seedCoreData(prisma);
  // console.log('✅ Core data seeded (Organisation, Branch, Roles).');

  // Seed users for all roles
  // await seedUsers(
  //   prisma,
  //   coreData.roles,
  //   coreData.branch.id,
  //   coreData.organisation.id,
  // );
  // console.log('✅ Users seeded for all roles.');

  // // Seed subscription manager user (optional - can be run separately)
  // const seedSubscriptionManagerUser = true
  //   // process.env.SEED_SUBSCRIPTION_MANAGER === 'true';
  // if (seedSubscriptionManagerUser) {
  //   console.log('🔧 Seeding subscription manager user...');
  //   await seedSubscriptionManager(prisma);
  //   console.log('✅ Subscription manager user seeded.');
  // } else {
  //   console.log(
  //     'ℹ️  Skipping subscription manager user seeding. Set SEED_SUBSCRIPTION_MANAGER=true to include it.',
  //   );
  // }

  // Seed finance module (Chart of Accounts, Offering Types, Fiscal Periods)
  // const seedFinanceModule = process.env.SEED_FINANCE !== 'false'; // Default to true
  // if (seedFinanceModule) {
  //   console.log('🏦 Seeding finance module...');
  //   await seedFinanceData(prisma, coreData.organisation.id, coreData.branch.id);
  //   console.log('✅ Finance module seeded.');
  // } else {
  //   console.log('ℹ️  Skipping finance module seeding. Set SEED_FINANCE=true to include it.');
  // }
}

main()
  .catch((e) => {
    console.error('🔥 An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
