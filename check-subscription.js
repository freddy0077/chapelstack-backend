const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserSubscription() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'test@chapelstack.com' },
      include: {
        organisation: {
          include: {
            subscriptions: {
              include: {
                plan: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found: test@chapelstack.com');
      return;
    }

    console.log('👤 User Found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Organization ID: ${user.organisationId}`);
    console.log(`   Active: ${user.isActive}`);

    if (!user.organisation) {
      console.log('❌ No organization found for user');
      return;
    }

    console.log('\n🏢 Organization:');
    console.log(`   Name: ${user.organisation.name}`);
    console.log(`   Email: ${user.organisation.email}`);
    console.log(`   Status: ${user.organisation.status}`);

    const subscription = user.organisation.subscriptions[0];
    if (!subscription) {
      console.log('\n❌ No subscription found for organization');
      return;
    }

    console.log('\n💳 Latest Subscription:');
    console.log(`   ID: ${subscription.id}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Plan: ${subscription.plan.name}`);
    console.log(`   Amount: ${subscription.plan.currency} ${subscription.plan.amount / 100}`);
    console.log(`   Current Period: ${subscription.currentPeriodStart} - ${subscription.currentPeriodEnd}`);
    
    if (subscription.trialStart && subscription.trialEnd) {
      console.log(`   Trial Period: ${subscription.trialStart} - ${subscription.trialEnd}`);
    }

    // Check if subscription is active
    const now = new Date();
    const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
    const trialEnd = subscription.trialEnd ? new Date(subscription.trialEnd) : null;
    
    const isSubscriptionExpired = now > currentPeriodEnd;
    const isTrialExpired = trialEnd && now > trialEnd;
    
    console.log('\n🔍 Subscription Analysis:');
    console.log(`   Current Time: ${now.toISOString()}`);
    console.log(`   Period End: ${currentPeriodEnd.toISOString()}`);
    console.log(`   Is Period Expired: ${isSubscriptionExpired}`);
    
    if (trialEnd) {
      console.log(`   Trial End: ${trialEnd.toISOString()}`);
      console.log(`   Is Trial Expired: ${isTrialExpired}`);
    }

    // Determine overall status
    let overallStatus = 'UNKNOWN';
    if (subscription.status === 'ACTIVE' && !isSubscriptionExpired) {
      overallStatus = '✅ ACTIVE';
    } else if (subscription.status === 'TRIALING' && !isTrialExpired) {
      overallStatus = '🔵 TRIAL ACTIVE';
    } else if (subscription.status === 'PAST_DUE') {
      overallStatus = '⚠️ PAST DUE';
    } else if (subscription.status === 'CANCELLED') {
      overallStatus = '❌ CANCELLED';
    } else if (isSubscriptionExpired || isTrialExpired) {
      overallStatus = '❌ EXPIRED';
    }

    console.log(`\n🎯 Overall Status: ${overallStatus}`);
    
    // Check if user should be blocked from login
    const shouldBlockLogin = subscription.status === 'CANCELLED' ||
                           (subscription.status === 'TRIALING' && isTrialExpired) ||
                           (subscription.status === 'ACTIVE' && isSubscriptionExpired) ||
                           subscription.status === 'PAST_DUE';

    console.log(`🚫 Should Block Login: ${shouldBlockLogin ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error checking subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserSubscription();
