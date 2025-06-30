import { PrismaClient, Member, SacramentType } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedSacraments(
  prisma: PrismaClient,
  members: Member[],
  organisationId: string,
  branchId: string,
) {
  const sacramentTypes = Object.values(SacramentType);
  let seededCount = 0;

  // Create a sacramental record for about a quarter of the members
  const membersForSacraments = faker.helpers.arrayElements(
    members,
    Math.floor(members.length / 4),
  );

  for (const member of membersForSacraments) {
    await prisma.sacramentalRecord.create({
      data: {
        memberId: member.id,
        sacramentType: faker.helpers.arrayElement(sacramentTypes),
        dateOfSacrament: faker.date.past({ years: 10 }),
        locationOfSacrament: `Main Church Sanctuary, ${faker.location.city()}`,
        officiantName: `Rev. ${faker.person.firstName()} ${faker.person.lastName()}`,
        organisationId,
        branchId,
        certificateNumber: faker.string.uuid(),
      },
    });
    seededCount++;
  }

  console.log(`Seeded ${seededCount} sacramental records.`);
}
