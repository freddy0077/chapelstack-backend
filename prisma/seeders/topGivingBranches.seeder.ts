import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTopGivingBranches() {
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

  // Create contribution types for each giving type if not exists (branchId: null for org-level)
  const contributionTypes = [
    'Tithe',
    'Offering',
    'Donation',
    'Pledge',
    'Special Contribution',
  ];

  // Create a fund (if not exists)
  let fund = await prisma.fund.findFirst({
    where: { name: 'General Fund', organisationId },
  });
  if (!fund) {
    fund = await prisma.fund.create({
      data: { name: 'General Fund', organisationId },
    });
  }

  // Get start and end of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  // For each branch, create contribution types and payment method, then seed contributions
  for (let i = 0; i < branches.length; i++) {
    const branch = branches[i];
    const ctMap: Record<string, string> = {};
    // Create contribution types for this branch
    for (const name of contributionTypes) {
      const whereObj: any = {
        name,
        organisationId,
        branchId: branch.id,
      };
      const ct = await prisma.contributionType.upsert({
        where: {
          contribution_type_unique_constraint: whereObj,
        },
        update: {},
        create: { name, organisationId, branchId: branch.id },
      });
      ctMap[name] = ct.id;
    }
    // Create payment method for this branch
    const pmWhereObj: any = {
      name: 'Cash',
      organisationId,
      branchId: branch.id,
    };
    const paymentMethod = await prisma.paymentMethod.upsert({
      where: {
        payment_method_unique_constraint: pmWhereObj,
      },
      update: {},
      create: { name: 'Cash', organisationId, branchId: branch.id },
    });
    // Seed contributions for each giving type for this branch for this month
    for (const type of contributionTypes) {
      await prisma.contribution.create({
        data: {
          amount: 1000 * (branches.length - i),
          date: new Date(
            now.getFullYear(),
            now.getMonth(),
            1 + Math.floor(Math.random() * endOfMonth.getDate()),
            12,
            0,
            0,
            0,
          ), // random day in current month
          branchId: branch.id,
          organisationId,
          contributionTypeId: ctMap[type],
          fundId: fund.id,
          paymentMethodId: paymentMethod.id,
        },
      });
    }
    // Seed expenses for each branch for this month using Transaction model
    const expenseCategories = [
      'Utilities',
      'Salaries',
      'Rent',
      'Supplies',
      'Maintenance',
      'Events',
    ];
    for (const category of expenseCategories) {
      await prisma.transaction.create({
        data: {
          organisationId,
          branchId: branch.id,
          amount: 500 * (i + 1),
          type: 'EXPENSE',
          date: new Date(
            now.getFullYear(),
            now.getMonth(),
            1 + Math.floor(Math.random() * endOfMonth.getDate()),
            15,
            0,
            0,
            0,
          ), // random day in current month
          description: `Seeded ${category} expense for ${branch.name}`,
          metadata: { expenseCategory: category },
        },
      });
    }
  }

  console.log('Seeded top giving branches data.');
}

// For standalone execution
if (require.main === module) {
  seedTopGivingBranches()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
