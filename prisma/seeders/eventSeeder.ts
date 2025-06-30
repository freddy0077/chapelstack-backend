import { PrismaClient, Event, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedEvents(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
  users: User[],
  count = 5,
): Promise<Event[]> {
  const events: Event[] = [];
  const eventCreator = users[0]; // Use the first user as the creator

  for (let i = 0; i < count; i++) {
    const event = await prisma.event.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        startDate: faker.date.recent({ days: 30 }),
        endDate: faker.date.soon({ days: 7 }),
        location: faker.location.streetAddress(),
        category: faker.helpers.arrayElement(['Service', 'Meeting', 'Community']),
        organisationId,
        branchId,
        createdBy: eventCreator.id,
        updatedBy: eventCreator.id,
      },
    });
    events.push(event);
  }
  return events;
}
