import { PrismaClient, Member, Ministry } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedMinistries(
  prisma: PrismaClient,
  members: Member[],
  organisationId: string,
  branchId: string,
) {
  const ministryTypes = [
    'WORSHIP',
    'OUTREACH',
    'EDUCATION',
    'PRAYER',
    'YOUTH',
    'CHILDREN',
    'MISSIONS',
    'ADMINISTRATION',
  ];

  const ministries: Ministry[] = [];
  for (const type of ministryTypes) {
    const ministryName = `${type.charAt(0)}${type.slice(1).toLowerCase()} Ministry`;
    let ministry = await prisma.ministry.findFirst({
      where: { name: ministryName, branchId },
    });

    if (!ministry) {
      ministry = await prisma.ministry.create({
        data: {
          name: ministryName,
          description: `The ${type.toLowerCase()} ministry of the church.`,
          type: type,
          status: 'ACTIVE',
          organisationId,
          branchId,
        },
      });
    }
    ministries.push(ministry);
  }

  // Assign members to ministries
  for (const ministry of ministries) {
    // Assign a few members to each ministry
    const membersToAssign = faker.helpers.arrayElements(members, {
      min: 5,
      max: 15,
    });
    for (const member of membersToAssign) {
      const existingAssignment = await prisma.groupMember.findFirst({
        where: {
          memberId: member.id,
          ministryId: ministry.id,
        },
      });

      if (!existingAssignment) {
        await prisma.groupMember.create({
          data: {
            role: faker.helpers.arrayElement(['LEADER', 'MEMBER', 'CO_LEADER']),
            status: 'ACTIVE',
            memberId: member.id,
            ministryId: ministry.id,
          },
        });
      }
    }
  }

  console.log(`Seeded ${ministries.length} ministries and assigned members.`);
  return ministries;
}
