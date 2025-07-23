import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedExpiredSubscriptionOrganisation() {
  try {
    console.log('🏢 Creating organisation with expired subscription...');

    // Check if organisation already exists
    const existingOrg = await prisma.organisation.findFirst({
      where: { email: 'expired@chapelstack.com' },
    });

    if (existingOrg) {
      console.log('⚠️ Organisation with expired subscription already exists');
      return;
    }

    // 1. Create the organisation
    const organisation = await prisma.organisation.create({
      data: {
        name: 'Expired Church Organisation',
        email: 'expired@chapelstack.com',
        phoneNumber: '+233-555-0003',
        website: 'https://expired.church',
        address: '789 Expired Lane',
        city: 'Accra',
        state: 'Greater Accra',
        country: 'Ghana',
        currency: 'GHS',
        timezone: 'Africa/Accra',
        primaryColor: '#1f2937',
        secondaryColor: '#3b82f6',
        status: 'SUSPENDED', // Organisation is suspended due to expired subscription
        suspensionReason: 'Subscription expired',
        suspendedAt: new Date('2025-07-01T00:00:00Z'), // Suspended 18 days ago
      },
    });

    console.log(
      `✅ Created organisation: ${organisation.name} (${organisation.id})`,
    );

    // 2. Create main branch for the organisation
    const branch = await prisma.branch.create({
      data: {
        name: 'Main Branch',
        address: '789 Expired Lane',
        city: 'Accra',
        state: 'Greater Accra',
        country: 'Ghana',
        phoneNumber: '+233-555-0003',
        email: 'main@expired.church',
        organisationId: organisation.id,
        isActive: false, // Branch is inactive due to expired subscription
      },
    });

    console.log(`✅ Created branch: ${branch.name} (${branch.id})`);

    // 3. Get roles
    const superAdminRole = await prisma.role.findFirst({
      where: { name: 'SUPER_ADMIN' },
    });

    const memberRole = await prisma.role.findFirst({
      where: { name: 'MEMBER' },
    });

    if (!superAdminRole || !memberRole) {
      throw new Error('Required roles not found');
    }

    // 4. Create Super Admin user for the expired organisation
    const hashedPassword = await bcrypt.hash('expired123', 10);

    const superAdminUser = await prisma.user.create({
      data: {
        email: 'expired.admin@chapelstack.com',
        firstName: 'Expired',
        lastName: 'Admin',
        phoneNumber: '+233-555-0003',
        passwordHash: hashedPassword,
        isActive: false, // User is inactive due to expired subscription
        isEmailVerified: true,
        organisationId: organisation.id,
        createdAt: new Date('2025-06-01T00:00:00Z'), // Created before expiry
        updatedAt: new Date('2025-07-01T00:00:00Z'), // Last updated when suspended
      },
    });

    console.log(
      `✅ Created Super Admin user: ${superAdminUser.email} (${superAdminUser.id})`,
    );

    // 5. Assign Super Admin role
    await prisma.user.update({
      where: { id: superAdminUser.id },
      data: {
        roles: {
          connect: { id: superAdminRole.id },
        },
      },
    });

    // 6. Create user branch relationship
    await prisma.userBranch.create({
      data: {
        userId: superAdminUser.id,
        branchId: branch.id,
        roleId: superAdminRole.id,
      },
    });

    // 7. Create a system member for the subscription (required by current model)
    const systemMember = await prisma.member.create({
      data: {
        firstName: 'System',
        lastName: 'Customer',
        email: `system-customer-${organisation.id}@chapelstack.com`,
        phoneNumber: '+233-555-0003',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'OTHER',
        maritalStatus: 'SINGLE',
        address: '789 Expired Lane',
        city: 'Accra',
        state: 'Greater Accra',
        country: 'Ghana',
        organisationId: organisation.id,
        branchId: branch.id,
        status: 'INACTIVE', // Inactive due to expired subscription
        membershipDate: new Date('2025-06-01T00:00:00Z'),
        createdAt: new Date('2025-06-01T00:00:00Z'),
      },
    });

    console.log(
      `✅ Created system member: ${systemMember.email} (${systemMember.id})`,
    );

    // 8. Get subscription plan
    const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'Annual Professional Plan' },
    });

    if (!subscriptionPlan) {
      throw new Error('Annual Professional Plan not found');
    }

    // 9. Create EXPIRED subscription
    const expiredSubscription = await prisma.subscription.create({
      data: {
        organisationId: organisation.id,
        customerId: organisation.id, // Using organisation as customer (organization-centric model)
        planId: subscriptionPlan.id,
        status: 'PAST_DUE', // Subscription is past due (expired)

        // Subscription period: June 1, 2024 - June 1, 2025 (EXPIRED)
        currentPeriodStart: new Date('2024-06-01T00:00:00Z'),
        currentPeriodEnd: new Date('2025-06-01T00:00:00Z'), // Expired 48 days ago

        // Trial period: June 1-15, 2024 (also expired)
        trialStart: new Date('2024-06-01T00:00:00Z'),
        trialEnd: new Date('2024-06-15T00:00:00Z'),

        // Billing dates
        nextBillingDate: new Date('2025-06-01T00:00:00Z'), // Missed billing date
        lastPaymentDate: new Date('2024-06-01T00:00:00Z'), // Last payment was a year ago

        // Cancellation info
        cancelledAt: null, // Not cancelled, just expired
        cancelReason: null,

        // Paystack info (optional)
        paystackSubscriptionCode: `sub_expired_${Date.now()}`,
        paystackCustomerCode: `cus_expired_${Date.now()}`,

        // Metadata
        metadata: {
          createdBy: 'seeder',
          organisationType: 'church',
          testData: true,
          expiredForTesting: true,
        },

        createdAt: new Date('2024-06-01T00:00:00Z'), // Created a year ago
        updatedAt: new Date('2025-06-01T00:00:00Z'), // Last updated when it expired
      },
    });

    console.log(`✅ Created expired subscription: ${expiredSubscription.id}`);
    console.log(`   Status: ${expiredSubscription.status}`);
    console.log(
      `   Period: ${expiredSubscription.currentPeriodStart} - ${expiredSubscription.currentPeriodEnd}`,
    );
    console.log(
      `   Expired: ${Math.ceil((new Date().getTime() - new Date(expiredSubscription.currentPeriodEnd).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
    );

    // 10. Create a payment record for the original subscription
    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: expiredSubscription.id,
        amount: subscriptionPlan.amount,
        currency: subscriptionPlan.currency,
        status: 'SUCCESSFUL',
        paystackReference: `ref_expired_${Date.now()}`,
        paidAt: new Date('2024-06-01T00:00:00Z'), // Paid a year ago
        periodStart: new Date('2024-06-01T00:00:00Z'), // Payment period start
        periodEnd: new Date('2025-06-01T00:00:00Z'), // Payment period end
        createdAt: new Date('2024-06-01T00:00:00Z'),
      },
    });

    console.log('✅ Created payment record for expired subscription');

    // 11. Create a regular member user (will be blocked from login)
    const regularUser = await prisma.user.create({
      data: {
        email: 'expired.user@chapelstack.com',
        firstName: 'Expired',
        lastName: 'User',
        phoneNumber: '+233-555-0004',
        passwordHash: hashedPassword,
        isActive: false, // Inactive due to expired subscription
        isEmailVerified: true,
        organisationId: organisation.id,
        createdAt: new Date('2025-06-15T00:00:00Z'),
        updatedAt: new Date('2025-07-01T00:00:00Z'),
      },
    });

    // Assign member role
    await prisma.user.update({
      where: { id: regularUser.id },
      data: {
        roles: {
          connect: { id: memberRole.id },
        },
      },
    });

    await prisma.userBranch.create({
      data: {
        userId: regularUser.id,
        branchId: branch.id,
        roleId: memberRole.id,
      },
    });

    console.log(
      `✅ Created regular user: ${regularUser.email} (${regularUser.id})`,
    );

    console.log('\n🎯 EXPIRED SUBSCRIPTION TEST DATA CREATED:');
    console.log('==========================================');
    console.log(`Organisation: ${organisation.name}`);
    console.log(`Organisation ID: ${organisation.id}`);
    console.log(`Organisation Status: ${organisation.status} (SUSPENDED)`);
    console.log(
      `Subscription Status: ${expiredSubscription.status} (PAST_DUE)`,
    );
    console.log(
      `Subscription Expired: ${Math.ceil((new Date().getTime() - new Date(expiredSubscription.currentPeriodEnd).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
    );
    console.log('\n👤 Test Users:');
    console.log(
      `Super Admin: ${superAdminUser.email} / expired123 (Can login to renew)`,
    );
    console.log(
      `Regular User: ${regularUser.email} / expired123 (Should be BLOCKED)`,
    );
    console.log('\n🧪 Testing Scenarios:');
    console.log(
      '1. Login as regular user → Should be blocked with "subscription expired" message',
    );
    console.log('2. Login as Super Admin → Should work (bypasses validation)');
    console.log('3. Super Admin can view expired subscription in dashboard');
    console.log('4. Super Admin can renew subscription');
    console.log('5. After renewal, regular user should be able to login');
  } catch (error) {
    console.error(
      '❌ Error creating expired subscription organisation:',
      error,
    );
    throw error;
  }
}

// Run the seeder if called directly
if (require.main === module) {
  seedExpiredSubscriptionOrganisation()
    .then(() => {
      console.log('✅ Expired subscription seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Expired subscription seeder failed:', error);
      process.exit(1);
    });
}
