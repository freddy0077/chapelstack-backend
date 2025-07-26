const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserOrganisation() {
  try {
    console.log('🔍 Checking user organisationId for branch_admin@chapelstack.com...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'branch_admin@chapelstack.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organisationId: true,
        userBranches: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                organisationId: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', `${user.firstName} ${user.lastName}`);
    console.log('User organisationId:', user.organisationId);
    console.log('User organisationId type:', typeof user.organisationId);
    console.log('User organisationId is null:', user.organisationId === null);
    
    console.log('\n📋 User Branches:');
    if (user.userBranches && user.userBranches.length > 0) {
      user.userBranches.forEach((ub, index) => {
        console.log(`Branch ${index + 1}:`);
        console.log('  Branch ID:', ub.branch.id);
        console.log('  Branch Name:', ub.branch.name);
        console.log('  Branch organisationId:', ub.branch.organisationId);
      });
      
      // If user.organisationId is null, we can get it from the branch
      if (user.organisationId === null && user.userBranches[0]?.branch?.organisationId) {
        console.log('\n💡 Suggested fix:');
        console.log('User organisationId is null, but branch has organisationId:', user.userBranches[0].branch.organisationId);
        console.log('We should update the user record with this organisationId');
      }
    } else {
      console.log('No branches found for user');
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserOrganisation();
