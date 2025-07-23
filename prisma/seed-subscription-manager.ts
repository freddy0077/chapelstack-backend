#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { seedSubscriptionManager } from './seeders/subscription-manager.seeder';
import { seedCoreData } from './seeders/core.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting subscription manager seeding...');

  try {
    // Ensure core data exists (organisation, branch, roles)
    console.log('📋 Checking core data...');
    const organisation = await prisma.organisation.findFirst();
    const branch = await prisma.branch.findFirst();

    if (!organisation || !branch) {
      console.log('🔧 Core data not found. Creating core data first...');
      await seedCoreData(prisma);
      console.log('✅ Core data created.');
    } else {
      console.log('✅ Core data already exists.');
    }

    // Seed subscription manager user
    const result = await seedSubscriptionManager(prisma);

    console.log('\n🎉 Subscription manager seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    ${result.credentials.email}`);
    console.log(`🔑 Password: ${result.credentials.password}`);
    console.log(`🎭 Role:     ${result.role.name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 Security Note:');
    console.log('   Please change the default password after first login!');
    console.log(
      '\n🚀 You can now log in to the subscription dashboard with these credentials.',
    );
  } catch (error) {
    console.error('🔥 Error during subscription manager seeding:');
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('🔥 Fatal error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
