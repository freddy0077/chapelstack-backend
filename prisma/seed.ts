import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/userSeeder';
import { seedCoreData } from './seeders/core.seeder';
import { seedSubscriptionManager } from './seeders/subscription-manager.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting user-only database seeding...');

  // Seed core data (Organisation, Branch, Roles)
  const coreData = await seedCoreData(prisma);
  console.log('✅ Core data seeded (Organisation, Branch, Roles).');

  // Seed users for all roles
  await seedUsers(
    prisma,
    coreData.roles,
    coreData.branch.id,
    coreData.organisation.id,
  );
  console.log('✅ Users seeded for all roles.');

  // Seed subscription manager user (optional - can be run separately)
  const seedSubscriptionManagerUser =
    process.env.SEED_SUBSCRIPTION_MANAGER === 'true';
  if (seedSubscriptionManagerUser) {
    console.log('🔧 Seeding subscription manager user...');
    await seedSubscriptionManager(prisma);
    console.log('✅ Subscription manager user seeded.');
  } else {
    console.log(
      'ℹ️  Skipping subscription manager user seeding. Set SEED_SUBSCRIPTION_MANAGER=true to include it.',
    );
  }
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
