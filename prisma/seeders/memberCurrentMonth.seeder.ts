import { PrismaClient } from '@prisma/client';
import { seedMembers } from './memberSeeder';

const prisma = new PrismaClient();

async function seedCurrentMonthMembers() {
  // Find first organisation and branch
  const organisation = await prisma.organisation.findFirst();
  if (!organisation) throw new Error('No organisation found');
  const branch = await prisma.branch.findFirst({
    where: { organisationId: organisation.id },
  });
  if (!branch) throw new Error('No branch found for organisation');

  // Seed 10 members in current month
  await seedMembers(prisma, branch.id, organisation.id, 10, true);
  console.log('Seeded 10 members for current month');
}

if (require.main === module) {
  seedCurrentMonthMembers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
