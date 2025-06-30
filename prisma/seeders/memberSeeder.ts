import { PrismaClient, Member } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedMembers(
  prisma: PrismaClient,
  branchId: string,
  organisationId: string,
  count = 10,
): Promise<Member[]> {
  const members: Member[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
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
      },
    });
    members.push(member);
  }
  return members;
}
