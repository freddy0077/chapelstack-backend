import { PrismaClient, User, Member } from '@prisma/client';
import { faker } from '@faker-js/faker';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function seedCommunicationData(
  prisma: PrismaClient,
  coreData: {
    organisation: { id: string };
    branch: { id: string };
    users: User[];
    members: Member[];
  },
) {
  console.log('  Seeding communication data...');
  const { organisation, branch, users, members } = coreData;

  await seedEmailTemplates(prisma, organisation.id, branch.id);
  await seedNotifications(prisma, organisation.id, branch.id, users, members);

  console.log('  Communication data seeding complete.');
}

async function seedEmailTemplates(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
) {
  const templates = [
    {
      name: 'Welcome Email',
      subject: 'Welcome to Our Church!',
      bodyHtml:
        '<p>Dear {{memberName}},</p><p>We are so glad to have you with us. Welcome to the family!</p>',
    },
    {
      name: 'Event Reminder',
      subject: 'Reminder: {{eventName}} is Tomorrow!',
      bodyHtml:
        '<p>Hi {{memberName}},</p><p>This is a friendly reminder that {{eventName}} is happening tomorrow at {{eventTime}}. We look forward to seeing you there!</p>',
    },
    {
      name: 'Weekly Newsletter',
      subject: 'This Week at Our Church',
      bodyHtml:
        '<p>Hello Church Family,</p><p>Here is what is happening this week. {{newsletterContent}}</p>',
    },
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: {
        email_template_unique_constraint: {
          name: t.name,
          organisationId,
          branchId,
        },
      },
      update: { bodyHtml: t.bodyHtml, subject: t.subject },
      create: {
        name: t.name,
        description: `Template for ${t.name}`,
        subject: t.subject,
        bodyHtml: t.bodyHtml,
        bodyText: faker.lorem.paragraph(),
        organisationId,
        branchId,
      },
    });
  }
}

async function seedNotifications(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
  users: User[],
  members: Member[],
) {
  if (users.length === 0) return;

  for (let i = 0; i < 20; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomMember =
      members.length > 0 ? faker.helpers.arrayElement(members) : null;

    await prisma.notification.create({
      data: {
        title: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
        type: faker.helpers.arrayElement([
          'INFO',
          'WARNING',
          'SUCCESS',
          'ERROR',
          'EVENT_REMINDER',
        ]),
        userId: randomUser.id,
        memberId: randomMember?.id,
        organisationId,
        branchId,
      },
    });
  }
}
