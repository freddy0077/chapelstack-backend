import { PrismaClient, Role } from '@prisma/client';

const rolesData = [
  { name: 'SUPER_ADMIN', description: 'Has all permissions' },
  { name: 'BRANCH_ADMIN', description: 'Manages a specific branch' },
  { name: 'MEMBER', description: 'Regular member of the church' },
  { name: 'GUEST', description: 'Guest Role' },
];

export async function seedRoles(prisma: PrismaClient): Promise<Role[]> {
  console.log('Seeding roles...');
  const results: Role[] = [];
  for (const roleData of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: {
        name: roleData.name,
        description: roleData.description,
      },
    });
    results.push(role);
  }
  console.log(`Seeded ${results.length} roles.`);
  return results;
}
