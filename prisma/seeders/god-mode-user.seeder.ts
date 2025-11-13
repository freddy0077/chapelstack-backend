import { PrismaClient, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedRoleSystem } from './role-system.seeder';

/**
 * Seeds a God Mode admin user with SYSTEM_ADMIN and ADMIN roles.
 * Ensures an organisation and branch exist, then upserts the user and links roles/branch.
 */
export async function seedGodModeUser(
  prisma: PrismaClient,
  {
    email = 'godmode@chapelstack.com',
    password = 'Password123!',
    organisationId,
    branchId,
  }: {
    email?: string;
    password?: string;
    organisationId?: string;
    branchId?: string;
  } = {},
): Promise<User> {
  // 1) Ensure organisation
  let organisation = organisationId
    ? await prisma.organisation.findUnique({ where: { id: organisationId } })
    : await prisma.organisation.findFirst();

  if (!organisation) {
    organisation = await prisma.organisation.create({
      data: {
        name: 'Default Organisation',
        primaryColor: '#003366',
        secondaryColor: '#FFD700',
      },
    });
  }

  // 2) Ensure branch
  let branch = branchId
    ? await prisma.branch.findUnique({ where: { id: branchId } })
    : await prisma.branch.findFirst({ where: { organisationId: organisation.id } });

  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'Main Branch',
        organisationId: organisation.id,
      },
    });
  }

  // 3) Ensure roles exist
  const roleIds = ['GOD_MODE'];
  const roles: Role[] = await prisma.role.findMany({ where: { id: { in: roleIds } } });

  if (roles.length !== roleIds.length) {
    // Fallback minimal upsert (role-system seeder should usually handle this)
    for (const id of roleIds) {
      await prisma.role.upsert({
        where: { id },
        update: { name: id, description: 'Complete system control (system owner)', isSystem: true, level: 1 },
        create: { id, name: id, description: 'Complete system control (system owner)', isSystem: true, level: 1 },
      });
    }
  }

  // 4) Upsert user without organization (GOD_MODE is system-level)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      organisationId: null,
      isEmailVerified: true,
      roles: { connect: roleIds.map((id) => ({ id })) },
    },
    create: {
      email,
      passwordHash: hashedPassword,
      firstName: 'God',
      lastName: 'Mode',
      organisationId: null,
      isEmailVerified: true,
      roles: { connect: roleIds.map((id) => ({ id })) },
    },
  });

  // GOD_MODE role is system-level, no branch association needed

  return user;
}

// Run seeder if called directly (standalone)
if (require.main === module) {
  const prisma = new PrismaClient();
  (async () => {
    try {
      console.log('🚀 Seeding God Mode user (standalone)...');
      // Note: seedRoleSystem is called from main seed.ts, skip here to avoid duplicate junction table inserts
      // await seedRoleSystem(prisma);

      const email = process.env.GODMODE_EMAIL || 'godmode@chapelstack.com';
      const password = process.env.GODMODE_PASSWORD || 'Password123!';
      const user = await seedGodModeUser(prisma, { email, password });
      console.log(`✅ God Mode user ready: ${user.email}`);
    } catch (e) {
      console.error('❌ Error seeding God Mode user:', e);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  })();
}
