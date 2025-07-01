import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function seedBranchAdminUser() {
  const prisma = new PrismaClient();
  try {
    // 1. Get the BRANCH_ADMIN role
    const branchAdminRole = await prisma.role.findUnique({
      where: { name: 'BRANCH_ADMIN' },
    });
    if (!branchAdminRole) throw new Error('BRANCH_ADMIN role not found');

    // 2. Get the first organisation and branch
    const organisation = await prisma.organisation.findFirst();
    if (!organisation) throw new Error('No organisation found');
    const branch = await prisma.branch.findFirst({
      where: { organisationId: organisation.id },
    });
    if (!branch) throw new Error('No branch found');

    // 3. Create the user
    const email = 'branchadmin@chapelstack.com';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashedPassword,
        firstName: 'Branch',
        lastName: 'Admin',
        organisationId: organisation.id,
        isEmailVerified: true,
        roles: { connect: { id: branchAdminRole.id } },
        userBranches: {
          create: {
            branchId: branch.id,
            roleId: branchAdminRole.id,
          },
        },
      },
    });
    console.log('Created branch admin user:', user.email);
  } finally {
    await prisma.$disconnect();
  }
}

seedBranchAdminUser().catch((e) => {
  console.error(e);
  process.exit(1);
});
