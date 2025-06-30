import { PrismaClient } from '@prisma/client';

export async function seedOrganisation(prisma: PrismaClient) {
  return prisma.organisation.upsert({
    where: { email: 'hello@chapelstack.com' },
    update: {},
    create: {
      name: 'Chapel Stack',
      description: 'Default organization for Chapel Stack',
      email: 'hello@chapelstack.com',
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
    },
  });
}
