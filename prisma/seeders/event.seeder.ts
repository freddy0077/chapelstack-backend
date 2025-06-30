import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedEventData(
  prisma: PrismaClient,
  coreData: {
    organisation: { id: string };
    branch: { id: string };
    users: User[];
  },
) {
  console.log('  Seeding event data...');
  const { organisation, branch, users } = coreData;

  if (users.length === 0) {
    console.log('  Skipping event seeding as no users are available.');
    return;
  }

  const eventTitles = [
    'Sunday Worship Service',
    'Mid-week Bible Study',
    'Youth Fellowship Night',
    'Community Outreach Program',
    'Annual Church Conference',
    'Womens Ministry Meeting',
    'Mens Breakfast Fellowship',
    'Choir Practice',
    'Leadership Training Session',
    'Childrens Sunday School',
  ];

  for (const title of eventTitles) {
    const existingEvent = await prisma.event.findFirst({
      where: {
        title,
        branchId: branch.id,
      },
    });

    if (!existingEvent) {
      const randomUser = faker.helpers.arrayElement(users);
      await prisma.event.create({
        data: {
          title,
          description: faker.lorem.paragraph(),
          startDate: faker.date.future(),
          endDate: faker.date.future(),
          location: faker.location.streetAddress(),
          category: faker.helpers.arrayElement(['Service', 'Meeting', 'Community', 'Worship']),
          organisationId: organisation.id,
          branchId: branch.id,
          createdBy: randomUser.id,
          updatedBy: randomUser.id,
        },
      });
    }
  }
  console.log('  Event data seeding complete.');
}
