import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the first organisation
  const organisation = await prisma.organisation.findFirst();
  if (!organisation) {
    throw new Error('No organisation found in the database.');
  }
  const organisationId = organisation.id;

  // Create 5 branches
  const branches = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.branch.create({
        data: {
          name: `Branch ${i + 1}`,
          organisationId,
          isActive: true,
        },
      }),
    ),
  );

  // Create a contribution type for each giving type if not exists
  const contributionTypes = [
    'Tithe',
    'Offering',
    'Donation',
    'Pledge',
    'Special Contribution',
  ];
  const ctMap: Record<string, string> = {};
  for (const name of contributionTypes) {
    // Use the compound unique constraint for upsert
    const whereObj: any = {
      name,
      organisationId,
    };
    const ct = await prisma.contributionType.upsert({
      where: {
        contribution_type_unique_constraint: whereObj,
      },
      update: {},
      create: { name, organisationId },
    });
    ctMap[name] = ct.id;
  }

  // Create a fund since this is required (workaround for unique constraint)
  let fund = await prisma.fund.findFirst({
    where: { name: 'General Fund', organisationId },
  });
  if (!fund) {
    fund = await prisma.fund.create({
      data: { name: 'General Fund', organisationId },
    });
  }

  // Create a payment method since this is required
  const pmWhereObj: any = {
    name: 'Cash',
    organisationId,
  };
  const paymentMethod = await prisma.paymentMethod.upsert({
    where: {
      payment_method_unique_constraint: pmWhereObj,
    },
    update: {},
    create: { name: 'Cash', organisationId },
  });

  // Seed contributions for each branch
  for (let i = 0; i < branches.length; i++) {
    const branch = branches[i];
    // Each branch gets a different total amount
    for (const type of contributionTypes) {
      await prisma.contribution.create({
        data: {
          amount: 1000 * (branches.length - i), // Branch 1 gets most, Branch 5 least
          date: new Date(),
          branchId: branch.id,
          organisationId,
          contributionTypeId: ctMap[type],
          fundId: fund.id,
          paymentMethodId: paymentMethod.id,
        },
      });
    }
  }

  console.log('Seeded top giving branches data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
