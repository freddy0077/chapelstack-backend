const { PrismaClient } = require('@prisma/client');

async function checkSubscriptionManager() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking subscription manager user...');
    
    // Find the subscription manager user
    const user = await prisma.user.findUnique({
      where: { email: 'subscription.manager@chapelstack.com' },
      include: {
        roles: true,
        userBranches: {
          include: {
            role: true,
            branch: true
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ Subscription manager user not found');
      return;
    }
    
    console.log('✅ Subscription manager user found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Organisation ID: ${user.organisationId}`);
    
    console.log('\n🎭 User Roles:');
    if (user.roles && user.roles.length > 0) {
      user.roles.forEach(role => {
        console.log(`   - ${role.name} (ID: ${role.id})`);
      });
    } else {
      console.log('   No roles assigned');
    }
    
    console.log('\n🏢 User Branches:');
    if (user.userBranches && user.userBranches.length > 0) {
      user.userBranches.forEach(ub => {
        console.log(`   - Branch: ${ub.branch.name}, Role: ${ub.role.name}`);
      });
    } else {
      console.log('   No branch assignments');
    }
    
    // Check if user has SUBSCRIPTION_MANAGER role
    const hasSubscriptionManagerRole = user.roles.some(role => role.name === 'SUBSCRIPTION_MANAGER');
    console.log(`\n🔐 Has SUBSCRIPTION_MANAGER role: ${hasSubscriptionManagerRole ? '✅ YES' : '❌ NO'}`);
    
    // Check SUBSCRIPTION_MANAGER role exists
    const subscriptionManagerRole = await prisma.role.findUnique({
      where: { name: 'SUBSCRIPTION_MANAGER' }
    });
    
    console.log(`\n🎭 SUBSCRIPTION_MANAGER role exists: ${subscriptionManagerRole ? '✅ YES' : '❌ NO'}`);
    if (subscriptionManagerRole) {
      console.log(`   Role ID: ${subscriptionManagerRole.id}`);
      console.log(`   Description: ${subscriptionManagerRole.description}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking subscription manager:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptionManager();
