import { PrismaClient, Member } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedMembers(
  prisma: PrismaClient,
  branchId: string,
  organisationId: string,
  count = 10,
  inCurrentMonth = false,
): Promise<Member[]> {
  const members: Member[] = [];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    // If inCurrentMonth, pick a random date in current month; else random
    let createdAt: Date | undefined = undefined;
    if (inCurrentMonth) {
      const day = 1 + Math.floor(Math.random() * endOfMonth.getDate());
      createdAt = new Date(now.getFullYear(), now.getMonth(), day, 12, 0, 0, 0);
    }
    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }),
        phoneNumber: faker.phone.number(),
        branchId,
        organisationId,
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
        maritalStatus: 'SINGLE',
        membershipStatus: 'ACTIVE',
        dateOfBirth: faker.date.birthdate(),
        ...(createdAt ? { createdAt } : {}),
      },
    });
    members.push(member);
  }
  return members;
}
