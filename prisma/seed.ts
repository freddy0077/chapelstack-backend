import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const saltRounds = 10;

  // Create Organisation
  const organisation = await prisma.organisation.upsert({
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

  // Create Branch
  const branch = await prisma.branch.upsert({
    where: { email: 'main@chapelstack.com' },
    update: {},
    create: {
      name: 'Main Branch',
      organisationId: organisation.id,
      email: 'main@chapelstack.com',
      city: 'Accra',
      country: 'Ghana',
    },
  });

  // Define Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Super Admin Role' },
    { name: 'BRANCH_ADMIN', description: 'Branch Admin Role' },
    { name: 'MEMBER', description: 'Member Role' },
    { name: 'GUEST', description: 'Guest Role' },
  ];

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });

    const email = `${role.name.toLowerCase().replace('_', '')}@chapelstack.com`;
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create User
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashedPassword,
        firstName: role.name.split('_')[0],
        lastName: 'User',
        organisationId: organisation.id,
        roles: {
          connect: { id: role.id },
        },
      },
    });

    // Create Member
    await prisma.member.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        firstName: user.firstName || role.name.split('_')[0],
        lastName: user.lastName || 'User',
        email: user.email,
        userId: user.id,
        branchId: branch.id,
        organisationId: organisation.id,
        status: 'ACTIVE',
        gender: 'NOT_SPECIFIED',
      },
    });

    console.log(`Created ${role.name} user with email: ${email}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
