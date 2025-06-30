import { PrismaClient, Member, Guardian } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedChildrenMinistryData(
  prisma: PrismaClient,
  coreData: {
    organisation: { id: string };
    branch: { id: string };
    members: Member[];
  },
) {
  console.log('  Seeding children ministry data...');
  const { organisation, branch, members } = coreData;

  if (members.length < 20) {
    console.log('  Skipping children ministry seeding: not enough members to create data.');
    return;
  }

  // Create guardians from the first 10 members
  const guardians = await seedGuardians(
    prisma,
    organisation.id,
    branch.id,
    members.slice(0, 10),
  );

  // Create children for those guardians
  await seedChildren(prisma, organisation.id, branch.id, guardians);

  // Create volunteers from the next 10 members
  await seedVolunteers(
    prisma,
    organisation.id,
    branch.id,
    members.slice(10, 20),
  );

  console.log('  Children ministry data seeding complete.');
}

async function seedGuardians(prisma: PrismaClient, organisationId: string, branchId: string, members: Member[]) {
  const createdGuardians: Guardian[] = [];
  for (const member of members) {
    const guardian = await prisma.guardian.upsert({
      where: { memberId: member.id },
      update: {},
      create: {
        memberId: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phoneNumber ?? faker.phone.number(),
        relationship: faker.helpers.arrayElement(['Parent', 'Legal Guardian']),
        organisationId,
        branchId,
      },
    });
    createdGuardians.push(guardian);
  }
  return createdGuardians;
}

async function seedChildren(prisma: PrismaClient, organisationId: string, branchId: string, guardians: Guardian[]) {
  for (const guardian of guardians) {
    await createChildrenForGuardian(prisma, guardian, organisationId, branchId);
  }
}

async function createChildrenForGuardian(
  prisma: PrismaClient,
  guardian: Guardian,
  organisationId: string,
  branchId: string,
) {
  const numberOfChildren = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < numberOfChildren; i++) {
    await prisma.child.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: guardian.lastName ?? faker.person.lastName(),
        dateOfBirth: faker.date.past({ years: 10 }),
        gender: faker.helpers.arrayElement(['Male', 'Female']),
        allergies: faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.2,
        }),
        emergencyContactName: `${guardian.firstName} ${guardian.lastName}`.trim(),
        emergencyContactPhone: guardian.phone,
        organisationId,
        branchId,
        guardianRelations: {
          create: {
            relationship: guardian.relationship,
            guardian: {
              connect: { id: guardian.id },
            },
          },
        },
      },
    });
  }
}

async function seedVolunteers(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
  members: Member[],
) {
  for (const member of members) {
    await prisma.childrenMinistryVolunteer.upsert({
      where: { children_ministry_volunteer_unique_constraint: { memberId: member.id, organisationId, branchId } },
      update: {},
      create: {
        memberId: member.id,
        role: faker.helpers.arrayElement(['Teacher', 'Assistant', 'Coordinator']),
        backgroundCheckStatus: 'PASSED',
        trainingCompleted: true,
        organisationId,
        branchId,
      },
    });
  }
}
