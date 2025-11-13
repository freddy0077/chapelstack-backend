import { PrismaClient } from '@prisma/client';
import { seedRoleSystem } from '../seeders/role-system.seeder';
import { seedGodModeUser } from '../seeders/god-mode-user.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding God Mode user...');

  // 1) Ensure roles, permissions, modules exist
  await seedRoleSystem(prisma);

  // 2) Seed God Mode user with SYSTEM_ADMIN + ADMIN
  const email = process.env.GODMODE_EMAIL || 'godmode@chapelstack.com';
  const password = process.env.GODMODE_PASSWORD || 'Password123!';

  const user = await seedGodModeUser(prisma, { email, password });

  console.log(`✅ God Mode user ready: ${user.email}`);
}

main()
  .catch((e) => {
    console.error('🔥 Error seeding God Mode user:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
