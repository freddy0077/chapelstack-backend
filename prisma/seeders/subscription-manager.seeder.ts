import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedSubscriptionManager(prisma: PrismaClient) {
  console.log('🔧 Seeding subscription manager user...');

  // Get or create the SUBSCRIPTION_MANAGER role
  let subscriptionManagerRole = await prisma.role.findUnique({
    where: { name: 'SUBSCRIPTION_MANAGER' },
  });

  if (!subscriptionManagerRole) {
    subscriptionManagerRole = await prisma.role.create({
      data: {
        name: 'SUBSCRIPTION_MANAGER',
        description:
          'Subscription Manager - Can manage subscriptions and organization status',
      },
    });
    console.log('✅ Created SUBSCRIPTION_MANAGER role');
  }

  // Get the default organisation and branch
  const organisation = await prisma.organisation.findFirst();
  const branch = await prisma.branch.findFirst();

  if (!organisation || !branch) {
    throw new Error(
      'No organisation or branch found. Please run the core seeder first.',
    );
  }

  // Create subscription manager user
  const saltRounds = 10;
  const email = 'subscription.manager@chapelstack.com';
  const password = 'subscription123'; // You should change this in production
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const subscriptionManager = await prisma.user.upsert({
    where: { email },
    update: {
      organisationId: organisation.id,
      roles: { connect: { id: subscriptionManagerRole.id } },
    },
    create: {
      email,
      passwordHash: hashedPassword,
      firstName: 'Subscription',
      lastName: 'Manager',
      organisationId: organisation.id,
      isEmailVerified: true,
      roles: { connect: { id: subscriptionManagerRole.id } },
      userBranches: {
        create: {
          branchId: branch.id,
          roleId: subscriptionManagerRole.id,
        },
      },
    },
    include: {
      roles: true,
      userBranches: {
        include: {
          branch: true,
          role: true,
        },
      },
    },
  });

  console.log('✅ Subscription manager user created/updated:');
  console.log(`   📧 Email: ${subscriptionManager.email}`);
  console.log(`   🔑 Password: ${password}`);
  console.log(
    `   👤 Name: ${subscriptionManager.firstName} ${subscriptionManager.lastName}`,
  );
  console.log(`   🏢 Organisation: ${organisation.name}`);
  console.log(`   🏪 Branch: ${branch.name}`);
  console.log(`   🎭 Role: ${subscriptionManagerRole.name}`);

  // Create subscription manager permissions if they don't exist
  const subscriptionPermissions = [
    // Core subscription management permissions from Permission enum
    {
      action: 'MANAGE_ORGANIZATION_SUBSCRIPTIONS',
      subject: 'Organization',
      description: 'Can manage organization subscriptions',
    },
    {
      action: 'VIEW_SUBSCRIPTION_ANALYTICS',
      subject: 'Subscription',
      description: 'Can view subscription analytics',
    },
    {
      action: 'ENABLE_DISABLE_ORGANIZATIONS',
      subject: 'Organization',
      description: 'Can enable/disable organizations',
    },
    {
      action: 'MANAGE_SUBSCRIPTION_PLANS',
      subject: 'SubscriptionPlan',
      description: 'Can manage subscription plans',
    },
    {
      action: 'VIEW_SUBSCRIPTION_PAYMENTS',
      subject: 'SubscriptionPayment',
      description: 'Can view subscription payments',
    },
    {
      action: 'HANDLE_SUBSCRIPTION_DISPUTES',
      subject: 'SubscriptionPayment',
      description: 'Can handle subscription disputes',
    },
  ];

  for (const permission of subscriptionPermissions) {
    await prisma.permission.upsert({
      where: {
        action_subject: {
          action: permission.action,
          subject: permission.subject,
        },
      },
      update: {
        description: permission.description,
      },
      create: {
        action: permission.action,
        subject: permission.subject,
        description: permission.description,
      },
    });
  }

  console.log('✅ Subscription manager permissions created/updated');

  // Connect permissions to the SUBSCRIPTION_MANAGER role
  const permissionIds: string[] = [];
  for (const permission of subscriptionPermissions) {
    const createdPermission = await prisma.permission.findUnique({
      where: {
        action_subject: {
          action: permission.action,
          subject: permission.subject,
        },
      },
    });

    if (createdPermission) {
      permissionIds.push(createdPermission.id);
    }
  }

  // Update the role to connect all permissions
  await prisma.role.update({
    where: { id: subscriptionManagerRole.id },
    data: {
      permissions: {
        connect: permissionIds.map((id) => ({ id })),
      },
    },
  });

  console.log('✅ Subscription manager role permissions connected');

  return {
    user: subscriptionManager,
    role: subscriptionManagerRole,
    credentials: {
      email,
      password,
    },
  };
}
