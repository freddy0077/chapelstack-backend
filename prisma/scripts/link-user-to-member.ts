/**
 * Script to create a Member record for an existing User
 * 
 * Usage:
 * ts-node prisma/scripts/link-user-to-member.ts <user-email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkUserToMember(userEmail: string) {
  try {
    console.log(`\n🔍 Looking for user with email: ${userEmail}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        member: true,
        organisation: true,
        userBranches: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`);
      return;
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    // Check if user already has a member record
    if (user.member) {
      console.log(`ℹ️  User already has a member record (ID: ${user.member.id})`);
      console.log(`   Member: ${user.member.firstName} ${user.member.lastName}`);
      return;
    }

    // Get the user's branch
    const userBranch = user.userBranches?.[0];
    if (!userBranch) {
      console.error(`❌ User has no branch assigned`);
      return;
    }

    console.log(`\n📝 Creating member record...`);
    console.log(`   Organisation: ${user.organisation?.name || user.organisationId}`);
    console.log(`   Branch: ${userBranch.branch?.name || userBranch.branchId}`);

    // Create member record
    const member = await prisma.member.create({
      data: {
        userId: user.id,
        firstName: user.firstName || 'Unknown',
        lastName: user.lastName || 'Unknown',
        email: user.email,
        phoneNumber: user.phoneNumber,
        organisationId: user.organisationId!,
        branchId: userBranch.branchId!,
        membershipStatus: 'ACTIVE' as any,
        membershipType: 'REGULAR' as any,
        membershipDate: new Date(),
      },
    });

    console.log(`\n✅ Member record created successfully!`);
    console.log(`   Member ID: ${member.id}`);
    console.log(`   Name: ${member.firstName} ${member.lastName}`);
    console.log(`   Email: ${member.email}`);
    console.log(`   Branch: ${userBranch.branch?.name || userBranch.branchId}`);
    console.log(`\n🎉 User is now linked to member record!`);
    console.log(`   You can now access the profile at /dashboard/profile`);

  } catch (error) {
    console.error(`\n❌ Error:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.error(`\n❌ Usage: ts-node prisma/scripts/link-user-to-member.ts <user-email>`);
  console.error(`   Example: ts-node prisma/scripts/link-user-to-member.ts admin@church.com\n`);
  process.exit(1);
}

linkUserToMember(userEmail);
