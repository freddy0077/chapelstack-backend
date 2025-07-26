const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserOrganisation() {
  try {
    console.log('🔍 Checking user organisation data...');
    
    // First, let's check the current user data
    const user = await prisma.user.findUnique({
      where: { email: 'branch_admin@chapelstack.com' },
      include: {
        userBranches: {
          include: {
            branch: true
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('📋 Current user data:');
    console.log('- User ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Current organisationId:', user.organisationId);
    console.log('- User branches count:', user.userBranches?.length);
    
    if (user.userBranches && user.userBranches.length > 0) {
      const firstBranch = user.userBranches[0].branch;
      console.log('- First branch organisationId:', firstBranch.organisationId);
      
      // If user doesn't have organisationId but branch does, update it
      if (!user.organisationId && firstBranch.organisationId) {
        console.log('🔧 Updating user organisationId from branch...');
        
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            organisationId: firstBranch.organisationId
          }
        });
        
        console.log('✅ User organisationId updated to:', updatedUser.organisationId);
      } else if (user.organisationId) {
        console.log('✅ User already has organisationId:', user.organisationId);
      } else {
        console.log('❌ No organisationId found in user or branch');
      }
    } else {
      console.log('❌ User has no branches');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserOrganisation();
