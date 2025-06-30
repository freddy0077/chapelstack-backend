import { PrismaClient, Member, PrayerRequestStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedPrayerRequests(
  prisma: PrismaClient,
  members: Member[],
  organisationId: string,
  branchId: string,
) {
  const prayerRequestStatuses = Object.values(PrayerRequestStatus);
  let seededCount = 0;

  // Create a prayer request for about a fifth of the members
  const membersForPrayerRequests = faker.helpers.arrayElements(
    members,
    Math.floor(members.length / 5),
  );

  for (const member of membersForPrayerRequests) {
    await prisma.prayerRequest.create({
      data: {
        memberId: member.id,
        requestText: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(prayerRequestStatuses),
        organisationId,
        branchId,
      },
    });
    seededCount++;
  }

  console.log(`Seeded ${seededCount} prayer requests.`);
}
