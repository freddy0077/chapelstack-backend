import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGroupMembershipTrailDemo() {
  console.log('🌱 Starting Group Membership Trail Demo Seeder...\n');

  try {
    // Use specific IDs
    const organisationId = '8903fc4d-5422-4bce-8318-32f2bda7aa24';
    const branchId = '3deb28b3-214e-4723-9f00-09355b80218c';
    const existingMemberId = '1625b435-01c7-4666-a998-cefbfb897265';

    // Verify they exist
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) {
      throw new Error(`Branch with ID ${branchId} not found`);
    }

    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
    });
    if (!organisation) {
      throw new Error(`Organisation with ID ${organisationId} not found`);
    }

    console.log(`✅ Using Branch: ${branch.name} (${branchId})`);
    console.log(`✅ Using Organisation: ${organisation.name} (${organisationId})`);
    console.log(`✅ Using Existing Member ID: ${existingMemberId}\n`);

    // Get existing member and create additional test members
    console.log('👥 Getting/Creating test members...');
    
    // Use the existing member (Frederick Ankamah)
    const member1 = await prisma.member.findUnique({
      where: { id: existingMemberId },
    });
    if (!member1) {
      throw new Error(`Member with ID ${existingMemberId} not found`);
    }
    console.log(`  ✓ Using existing member: ${member1.firstName} ${member1.lastName}`);

    const member2 = await prisma.member.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+1234567891',
        dateOfBirth: new Date('1992-08-20'),
        gender: 'FEMALE',
        status: 'ACTIVE',
        membershipStatus: 'MEMBER',
        membershipType: 'REGULAR',
        branchId: branchId,
        organisationId: organisationId,
      },
    });
    console.log(`  ✓ Created: ${member2.firstName} ${member2.lastName}`);

    const member3 = await prisma.member.upsert({
      where: { email: 'mike.johnson@example.com' },
      update: {},
      create: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phoneNumber: '+1234567892',
        dateOfBirth: new Date('1988-03-10'),
        gender: 'MALE',
        status: 'ACTIVE',
        membershipStatus: 'MEMBER',
        membershipType: 'REGULAR',
        branchId: branchId,
        organisationId: organisationId,
      },
    });
    console.log(`  ✓ Created: ${member3.firstName} ${member3.lastName}\n`);

    // Create ministries
    console.log('🏛️  Creating ministries...');
    
    const youthMinistry = await prisma.ministry.upsert({
      where: { id: 'youth-ministry-demo' },
      update: {},
      create: {
        id: 'youth-ministry-demo',
        name: 'Youth Ministry',
        type: 'YOUTH',
        status: 'ACTIVE',
        description: 'Ministry for young people',
        branchId: branchId,
        organisationId: organisationId,
      },
    });
    console.log(`  ✓ Created: ${youthMinistry.name}`);

    const worshipMinistry = await prisma.ministry.upsert({
      where: { id: 'worship-ministry-demo' },
      update: {},
      create: {
        id: 'worship-ministry-demo',
        name: 'Worship Ministry',
        type: 'WORSHIP',
        status: 'ACTIVE',
        description: 'Ministry for worship and music',
        branchId: branchId,
        organisationId: organisationId,
      },
    });
    console.log(`  ✓ Created: ${worshipMinistry.name}\n`);

    // Create small groups
    console.log('👥 Creating small groups...');
    
    const youthGroup = await prisma.smallGroup.upsert({
      where: { id: 'youth-group-demo' },
      update: {},
      create: {
        id: 'youth-group-demo',
        name: 'Young Adults Fellowship',
        type: 'FELLOWSHIP',
        status: 'ACTIVE',
        description: 'Fellowship for young adults aged 18-30',
        ministryId: youthMinistry.id,
        branchId: branchId,
        organisationId: organisationId,
      },
    });
    console.log(`  ✓ Created: ${youthGroup.name}`);

    const worshipTeam = await prisma.smallGroup.upsert({
      where: { id: 'worship-team-demo' },
      update: {},
      create: {
        id: 'worship-team-demo',
        name: 'Worship Team',
        type: 'SERVICE',
        status: 'ACTIVE',
        description: 'Main worship team for Sunday services',
        ministryId: worshipMinistry.id,
        branchId: branchId,
        organisationId: organisationId,
      },
    });
    console.log(`  ✓ Created: ${worshipTeam.name}`);

    const prayerGroup = await prisma.smallGroup.upsert({
      where: { id: 'prayer-group-demo' },
      update: {},
      create: {
        id: 'prayer-group-demo',
        name: 'Morning Prayer Group',
        type: 'PRAYER',
        status: 'ACTIVE',
        description: 'Early morning prayer group',
        branchId: branchId,
        organisationId: organisationId,
      },
    });
    console.log(`  ✓ Created: ${prayerGroup.name}\n`);

    // Scenario 1: Active memberships (current members)
    console.log('📝 Scenario 1: Creating ACTIVE memberships...');
    
    await prisma.groupMember.upsert({
      where: { id: 'gm-active-1' },
      update: {},
      create: {
        id: 'gm-active-1',
        memberId: member1.id,
        smallGroupId: youthGroup.id,
        role: 'LEADER',
        status: 'ACTIVE',
        joinDate: new Date('2024-01-15'),
      },
    });
    console.log(`  ✓ ${member1.firstName} joined ${youthGroup.name} as LEADER`);

    await prisma.groupMember.upsert({
      where: { id: 'gm-active-2' },
      update: {},
      create: {
        id: 'gm-active-2',
        memberId: member2.id,
        smallGroupId: worshipTeam.id,
        role: 'MEMBER',
        status: 'ACTIVE',
        joinDate: new Date('2024-03-01'),
      },
    });
    console.log(`  ✓ ${member2.firstName} joined ${worshipTeam.name} as MEMBER`);

    await prisma.groupMember.upsert({
      where: { id: 'gm-active-3' },
      update: {},
      create: {
        id: 'gm-active-3',
        memberId: member3.id,
        smallGroupId: prayerGroup.id,
        role: 'CO_LEADER',
        status: 'ACTIVE',
        joinDate: new Date('2024-02-10'),
      },
    });
    console.log(`  ✓ ${member3.firstName} joined ${prayerGroup.name} as CO_LEADER\n`);

    // Scenario 2: Past memberships (members who left)
    console.log('📝 Scenario 2: Creating PAST memberships (with trail)...');
    
    await prisma.groupMember.upsert({
      where: { id: 'gm-past-1' },
      update: {},
      create: {
        id: 'gm-past-1',
        memberId: member1.id,
        smallGroupId: worshipTeam.id,
        role: 'MEMBER',
        status: 'INACTIVE',
        joinDate: new Date('2023-06-01'),
        leaveDate: new Date('2024-05-15'),
        leaveReason: 'Member requested to leave to focus on youth ministry',
      },
    });
    console.log(`  ✓ ${member1.firstName} left ${worshipTeam.name}`);
    console.log(`    - Joined: Jun 1, 2023`);
    console.log(`    - Left: May 15, 2024`);
    console.log(`    - Duration: 11 months`);
    console.log(`    - Reason: Member requested to leave to focus on youth ministry`);

    await prisma.groupMember.upsert({
      where: { id: 'gm-past-2' },
      update: {},
      create: {
        id: 'gm-past-2',
        memberId: member2.id,
        smallGroupId: prayerGroup.id,
        role: 'MEMBER',
        status: 'INACTIVE',
        joinDate: new Date('2023-01-10'),
        leaveDate: new Date('2023-12-31'),
        leaveReason: 'Relocated to another city',
      },
    });
    console.log(`  ✓ ${member2.firstName} left ${prayerGroup.name}`);
    console.log(`    - Joined: Jan 10, 2023`);
    console.log(`    - Left: Dec 31, 2023`);
    console.log(`    - Duration: 12 months`);
    console.log(`    - Reason: Relocated to another city`);

    await prisma.groupMember.upsert({
      where: { id: 'gm-past-3' },
      update: {},
      create: {
        id: 'gm-past-3',
        memberId: member3.id,
        smallGroupId: youthGroup.id,
        role: 'MEMBER',
        status: 'INACTIVE',
        joinDate: new Date('2022-09-01'),
        leaveDate: new Date('2023-08-31'),
        leaveReason: 'Aged out of youth group',
      },
    });
    console.log(`  ✓ ${member3.firstName} left ${youthGroup.name}`);
    console.log(`    - Joined: Sep 1, 2022`);
    console.log(`    - Left: Aug 31, 2023`);
    console.log(`    - Duration: 12 months`);
    console.log(`    - Reason: Aged out of youth group\n`);

    // Scenario 3: Deactivated group (all members left)
    console.log('📝 Scenario 3: Creating DEACTIVATED group scenario...');
    
    const oldGroup = await prisma.smallGroup.upsert({
      where: { id: 'old-group-demo' },
      update: {},
      create: {
        id: 'old-group-demo',
        name: 'College Students Group',
        type: 'FELLOWSHIP',
        status: 'ACTIVE',
        description: 'Fellowship for college students (now deactivated)',
        branchId: branchId,
        organisationId: organisationId,
      },
    });
    console.log(`  ✓ Created: ${oldGroup.name}`);

    await prisma.groupMember.upsert({
      where: { id: 'gm-deactivated-1' },
      update: {},
      create: {
        id: 'gm-deactivated-1',
        memberId: member1.id,
        smallGroupId: oldGroup.id,
        role: 'MEMBER',
        status: 'INACTIVE',
        joinDate: new Date('2021-09-01'),
        leaveDate: new Date('2023-06-30'),
        leaveReason: `Group "${oldGroup.name}" was deactivated`,
      },
    });
    console.log(`  ✓ ${member1.firstName} was in ${oldGroup.name} (group deactivated)`);

    await prisma.groupMember.upsert({
      where: { id: 'gm-deactivated-2' },
      update: {},
      create: {
        id: 'gm-deactivated-2',
        memberId: member2.id,
        smallGroupId: oldGroup.id,
        role: 'LEADER',
        status: 'INACTIVE',
        joinDate: new Date('2021-09-01'),
        leaveDate: new Date('2023-06-30'),
        leaveReason: `Group "${oldGroup.name}" was deactivated`,
      },
    });
    console.log(`  ✓ ${member2.firstName} was in ${oldGroup.name} (group deactivated)`);

    await prisma.groupMember.upsert({
      where: { id: 'gm-deactivated-3' },
      update: {},
      create: {
        id: 'gm-deactivated-3',
        memberId: member3.id,
        smallGroupId: oldGroup.id,
        role: 'MEMBER',
        status: 'INACTIVE',
        joinDate: new Date('2021-09-01'),
        leaveDate: new Date('2023-06-30'),
        leaveReason: `Group "${oldGroup.name}" was deactivated`,
      },
    });
    console.log(`  ✓ ${member3.firstName} was in ${oldGroup.name} (group deactivated)\n`);

    // Create audit logs
    console.log('📋 Creating audit logs...');
    
    const auditLogs = [
      {
        entityType: 'GroupMember',
        entityId: 'gm-past-1',
        action: 'UPDATE',
        description: `Removed ${member1.firstName} ${member1.lastName} from ${worshipTeam.name}`,
        metadata: {
          memberId: member1.id,
          memberName: `${member1.firstName} ${member1.lastName}`,
          groupId: worshipTeam.id,
          groupName: worshipTeam.name,
          groupType: 'SmallGroup',
          role: 'MEMBER',
          leaveDate: new Date('2024-05-15'),
          leaveReason: 'Member requested to leave to focus on youth ministry',
        },
      },
      {
        entityType: 'GroupMember',
        entityId: 'gm-past-2',
        action: 'UPDATE',
        description: `Removed ${member2.firstName} ${member2.lastName} from ${prayerGroup.name}`,
        metadata: {
          memberId: member2.id,
          memberName: `${member2.firstName} ${member2.lastName}`,
          groupId: prayerGroup.id,
          groupName: prayerGroup.name,
          groupType: 'SmallGroup',
          role: 'MEMBER',
          leaveDate: new Date('2023-12-31'),
          leaveReason: 'Relocated to another city',
        },
      },
      {
        entityType: 'GroupMember',
        entityId: 'gm-deactivated-1',
        action: 'UPDATE',
        description: `${member1.firstName} ${member1.lastName} removed from ${oldGroup.name} (group deactivated)`,
        metadata: {
          memberId: member1.id,
          memberName: `${member1.firstName} ${member1.lastName}`,
          groupId: oldGroup.id,
          groupName: oldGroup.name,
          groupType: 'SmallGroup',
          role: 'MEMBER',
          leaveDate: new Date('2023-06-30'),
          leaveReason: `Group "${oldGroup.name}" was deactivated`,
          reason: 'GROUP_DEACTIVATED',
        },
      },
    ];

    for (const log of auditLogs) {
      await prisma.auditLog.create({ data: log });
    }
    console.log(`  ✓ Created ${auditLogs.length} audit log entries\n`);

    // Summary
    console.log('📊 Summary:');
    console.log('─────────────────────────────────────────────────────');
    console.log(`✅ Members created: 3`);
    console.log(`   - ${member1.firstName} ${member1.lastName} (${member1.email})`);
    console.log(`   - ${member2.firstName} ${member2.lastName} (${member2.email})`);
    console.log(`   - ${member3.firstName} ${member3.lastName} (${member3.email})`);
    console.log('');
    console.log(`✅ Ministries created: 2`);
    console.log(`   - ${youthMinistry.name}`);
    console.log(`   - ${worshipMinistry.name}`);
    console.log('');
    console.log(`✅ Small Groups created: 4`);
    console.log(`   - ${youthGroup.name} (ACTIVE)`);
    console.log(`   - ${worshipTeam.name} (ACTIVE)`);
    console.log(`   - ${prayerGroup.name} (ACTIVE)`);
    console.log(`   - ${oldGroup.name} (DEACTIVATED)`);
    console.log('');
    console.log(`✅ Group Memberships created: 9`);
    console.log(`   - Active: 3`);
    console.log(`   - Past (with trail): 6`);
    console.log('');
    console.log(`✅ Audit Logs created: ${auditLogs.length}`);
    console.log('─────────────────────────────────────────────────────\n');

    console.log('🎯 What to check in the UI:');
    console.log('');
    console.log(`1️⃣  Open ${member1.firstName} ${member1.lastName}'s details:`);
    console.log(`   - Active Groups: ${youthGroup.name} (Leader)`);
    console.log(`   - Past Groups: ${worshipTeam.name}, ${oldGroup.name}`);
    console.log('');
    console.log(`2️⃣  Open ${member2.firstName} ${member2.lastName}'s details:`);
    console.log(`   - Active Groups: ${worshipTeam.name} (Member)`);
    console.log(`   - Past Groups: ${prayerGroup.name}, ${oldGroup.name}`);
    console.log('');
    console.log(`3️⃣  Open ${member3.firstName} ${member3.lastName}'s details:`);
    console.log(`   - Active Groups: ${prayerGroup.name} (Co-Leader)`);
    console.log(`   - Past Groups: ${youthGroup.name}, ${oldGroup.name}`);
    console.log('');
    console.log('✨ Each past membership should show:');
    console.log('   ✓ Join date');
    console.log('   ✓ Leave date (in red)');
    console.log('   ✓ Leave reason');
    console.log('   ✓ Duration calculation');
    console.log('   ✓ "Past Member" badge');
    console.log('');

    console.log('✅ Group Membership Trail Demo Seeder completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding group membership trail demo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedGroupMembershipTrailDemo()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
