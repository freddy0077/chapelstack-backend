import { PrismaClient } from '@prisma/client';
import { seedSystemTemplates } from '../seeders/system-templates.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting message template seeding...\n');

  // Get the first organisation and user
  const organisation = await prisma.organisation.findFirst();
  
  if (!organisation) {
    console.error('❌ No organisation found. Please run the main seed first.');
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { organisationId: organisation.id },
  });

  if (!user) {
    console.error('❌ No user found. Please run the main seed first.');
    process.exit(1);
  }

  console.log(`📋 Organisation: ${organisation.name}`);
  console.log(`👤 User: ${user.email}\n`);

  // Seed templates
  await seedSystemTemplates(organisation.id, user.id);

  console.log('\n✅ Template seeding complete!');
}

main()
  .catch((e) => {
    console.error('🔥 Error seeding templates:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
