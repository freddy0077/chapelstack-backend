import { PrismaClient } from '@prisma/client';

export async function seedBranch(prisma: PrismaClient, organisationId: string) {
  return prisma.branch.upsert({
    where: { email: 'main@chapelstack.com' },
    update: {},
    create: {
      name: 'Main Branch',
      organisationId,
      email: 'main@chapelstack.com',
      city: 'Accra',
      country: 'Ghana',
    },
  });
}
