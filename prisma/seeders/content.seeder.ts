import { PrismaClient, Speaker, Series } from '@prisma/client';
import { faker } from '@faker-js/faker';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function seedContentData(
  prisma: PrismaClient,
  coreData: {
    organisation: { id: string };
    branch: { id: string };
  },
) {
  console.log('  Seeding content data...');
  const { organisation, branch } = coreData;

  const speakers = await seedSpeakers(prisma, organisation.id, branch.id);
  const series = await seedSeries(prisma, organisation.id, branch.id);
  await seedSermons(prisma, organisation.id, branch.id, speakers, series);

  console.log('  Content data seeding complete.');
}

async function seedSpeakers(prisma: PrismaClient, organisationId: string, branchId: string): Promise<Speaker[]> {
  const createdSpeakers: Speaker[] = [];
  for (let i = 0; i < 5; i++) {
    const name = faker.person.fullName();
    const speaker = await prisma.speaker.upsert({
      where: { speaker_unique_constraint: { name, organisationId, branchId } },
      update: {},
      create: {
        name,
        bio: faker.lorem.paragraph(),
        organisationId,
        branchId,
      },
    });
    createdSpeakers.push(speaker);
  }
  return createdSpeakers;
}

async function seedSeries(prisma: PrismaClient, organisationId: string, branchId: string): Promise<Series[]> {
  const createdSeries: Series[] = [];
  for (let i = 0; i < 3; i++) {
    const title = faker.lorem.words(3);
    const series = await prisma.series.upsert({
      where: { series_unique_constraint: { title, organisationId, branchId } },
      update: {},
      create: {
        title,
        description: faker.lorem.sentence(),
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        organisationId,
        branchId,
      },
    });
    createdSeries.push(series);
  }
  return createdSeries;
}

async function seedSermons(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
  speakers: Speaker[],
  series: Series[],
) {
  if (speakers.length === 0) return;

  for (let i = 0; i < 15; i++) {
    const title = faker.lorem.sentence(5);
    await prisma.sermon.upsert({
      where: { sermon_unique_constraint: { title, organisationId, branchId } },
      update: {},
      create: {
        title,
        description: faker.lorem.paragraph(),
        datePreached: faker.date.past(),
        speakerId: faker.helpers.arrayElement(speakers).id,
        seriesId: faker.helpers.arrayElement(series).id,
        organisationId,
        branchId,
      },
    });
  }
}
