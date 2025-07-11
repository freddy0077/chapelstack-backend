import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/userSeeder';
import { seedCoreData } from './seeders/core.seeder';

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
