import { PrismaClient } from '@prisma/client';
import { seedCoreData } from './seeders/core.seeder';
import { seedFinanceData } from './seeders/finance.seeder';
import { seedEventData } from './seeders/event.seeder';
import { seedCommunicationData } from './seeders/communication.seeder';
import { seedContentData } from './seeders/content.seeder';
import { seedChildrenMinistryData } from './seeders/children.seeder';
import { seedMinistries } from './seeders/ministry.seeder';
import { seedSacraments } from './seeders/sacrament.seeder';
import { seedPrayerRequests } from './seeders/prayer.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting comprehensive database seeding...');

  // Seeding core data is foundational as other modules depend on it.
  const coreData = await seedCoreData(prisma);
  console.log('✅ Core data seeded successfully (Organisation, Branch, Roles, Users, Members).');

  // Seed other modules using IDs from the core data.
  // These can be run in parallel if they don't have inter-dependencies.
  await Promise.all([
    seedFinanceData(prisma, coreData).then(() => console.log('✅ Finance data seeded.')),
    seedEventData(prisma, coreData).then(() => console.log('✅ Event data seeded.')),
    seedCommunicationData(prisma, coreData).then(() => console.log('✅ Communication data seeded.')),
    seedContentData(prisma, coreData).then(() => console.log('✅ Content data seeded.')),
    seedChildrenMinistryData(prisma, coreData).then(() => console.log('✅ Children ministry data seeded.')),
    seedMinistries(prisma, coreData.members, coreData.organisation.id, coreData.branch.id).then(() => console.log('✅ Ministry data seeded.')),
    seedSacraments(prisma, coreData.members, coreData.organisation.id, coreData.branch.id).then(() => console.log('✅ Sacrament data seeded.')),
    seedPrayerRequests(prisma, coreData.members, coreData.organisation.id, coreData.branch.id).then(() => console.log('✅ Prayer request data seeded.')),
  ]);

  console.log('🎉 Seeding finished successfully!');
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
