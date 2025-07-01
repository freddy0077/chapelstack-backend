import { PrismaClient, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(
  prisma: PrismaClient,
  roles: Role[],
  branchId: string,
  organisationId: string,
): Promise<User[]> {
  const saltRounds = 10;
  const users: User[] = [];

  for (const role of roles) {
    const email = `${role.name.toLowerCase().replace(/ /g, '_')}@chapelstack.com`;
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        organisationId,
      },
      create: {
        email,
        passwordHash: hashedPassword,
        firstName:
          role.name.charAt(0).toUpperCase() + role.name.slice(1).toLowerCase(),
        lastName: 'User',
        organisationId,
        isEmailVerified: true,
        roles: { connect: { id: role.id } },
        userBranches: {
          create: {
            branchId,
            roleId: role.id,
          },
        },
      },
    });
    users.push(user);
  }
  return users;
}
