import { PrismaClient } from '@prisma/client';
import { seedUsers } from './userSeeder';

export async function seedCoreData(prisma: PrismaClient) {
  // 1. Organisation
  const organisation = await prisma.organisation.create({
    data: {
      name: 'Default Organisation',
      primaryColor: '#003366',
      secondaryColor: '#FFD700',
    },
  });

  // 2. Branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      organisationId: organisation.id,
    },
  });

  // 3. Roles (seed if not present)
  const defaultRoles = [
    { name: 'SUPER_ADMIN', description: 'Super Administrator' },
    { name: 'ADMIN', description: 'Administrator' },
    { name: 'FINANCE', description: 'Finance Role' },
    { name: 'PASTORAL', description: 'Pastoral Role' },
    { name: 'BRANCH_ADMIN', description: 'Branch Administrator' },
    { name: 'MEMBER', description: 'Member' },
  ];
  for (const role of defaultRoles) {
    const exists = await prisma.role.findUnique({ where: { name: role.name } });
    if (!exists) {
      await prisma.role.create({
        data: { name: role.name, description: role.description },
      });
    }
  }
  const roles = await prisma.role.findMany();

  // 4. Payment Methods
  const paymentMethods = [
    { name: 'Cash', description: 'Cash payment', isActive: true },
    { name: 'Bank Transfer', description: 'Bank transfer', isActive: true },
    { name: 'Mobile Money', description: 'Mobile money', isActive: true },
    { name: 'Cheque', description: 'Cheque payment', isActive: true },
    { name: 'Card', description: 'Debit/Credit card', isActive: true },
  ];
  for (const method of paymentMethods) {
    const exists = await prisma.paymentMethod.findFirst({
      where: {
        name: method.name,
        organisationId: organisation.id,
        branchId: branch.id,
      },
    });
    if (!exists) {
      await prisma.paymentMethod.create({
        data: {
          name: method.name,
          description: method.description,
          isActive: method.isActive,
          organisationId: organisation.id,
          branchId: branch.id,
        },
      });
    }
  }

  // 5. Contribution Types
  const contributionTypes = [
    { name: 'Tithe', description: 'Tithes', isActive: true },
    { name: 'Offering', description: 'Offerings', isActive: true },
    { name: 'Donation', description: 'Donations', isActive: true },
    { name: 'Pledge', description: 'Pledges', isActive: true },
    { name: 'Thanksgiving', description: 'Thanksgiving', isActive: true },
  ];
  for (const type of contributionTypes) {
    const exists = await prisma.contributionType.findFirst({
      where: {
        name: type.name,
        organisationId: organisation.id,
        branchId: branch.id,
      },
    });
    if (!exists) {
      await prisma.contributionType.create({
        data: {
          name: type.name,
          description: type.description,
          isActive: type.isActive,
          organisationId: organisation.id,
          branchId: branch.id,
        },
      });
    }
  }

  return { organisation, branch, roles };
}
