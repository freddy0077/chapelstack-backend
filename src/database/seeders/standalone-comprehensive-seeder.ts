#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import {
  Gender,
  MaritalStatus,
  MembershipStatus,
  MembershipType,
  MemberStatus,
  PrivacyLevel,
  RelationshipType,
} from '@prisma/client';

// Standalone comprehensive member seeder that doesn't depend on NestJS context
class StandaloneComprehensiveMembersSeeder {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async seed() {
    console.log('🌱 Starting standalone comprehensive members seeder...');
    console.log(
      '⚠️  This will create 1000 members with full complements of membership data',
    );

    try {
      // Get organization and branch for seeding
      const organisation = await this.prisma.organisation.findFirst();
      const branch = await this.prisma.branch.findFirst();

      if (!organisation || !branch) {
        throw new Error(
          'Organization and branch must exist before seeding members',
        );
      }

      console.log(
        `📍 Using Organization: ${organisation.name}, Branch: ${branch.name}`,
      );

      // Use a fallback user ID for audit trail
      const auditUserId = '5453df9a-003a-4319-a532-84b527b9e285';

      // Generate 1000 comprehensive members
      const memberCount = 1000;
      const batchSize = 50;

      const startTime = Date.now();

      for (let batch = 0; batch < Math.ceil(memberCount / batchSize); batch++) {
        const startIndex = batch * batchSize;
        const endIndex = Math.min(startIndex + batchSize, memberCount);

        console.log(
          `📦 Processing batch ${batch + 1}: Members ${startIndex + 1}-${endIndex}`,
        );

        const createdMembers = await this.seedMemberBatch(
          startIndex,
          endIndex,
          organisation.id,
          branch.id,
          auditUserId,
        );

        // Create family relationships after batch is complete
        if (createdMembers.length > 1) {
          await this.createFamilyRelationships(createdMembers);
        }
      }

      const endTime = Date.now();
      const executionTime = ((endTime - startTime) / 1000).toFixed(2);

      console.log('');
      console.log('🎉 Comprehensive members seeder completed successfully!');
      console.log(`⏱️  Total execution time: ${executionTime} seconds`);
      console.log(`📊 Created ${memberCount} members with full complements:`);
      console.log('   • Complete personal and contact information');
      console.log('   • Communication preferences');
      console.log('   • Member analytics and engagement data');
      console.log('   • Membership history records');
      console.log('   • Search index entries');
      console.log('   • Audit trail entries');
      console.log('   • Family relationships');
      console.log('');
      console.log('✅ You can now:');
      console.log('   • Test member list views with realistic data');
      console.log('   • Validate search and filtering functionality');
      console.log('   • Test member analytics and reporting');
      console.log('   • Demonstrate family relationship features');
      console.log('   • Validate communication preferences');
      console.log('   • Test audit trail functionality');
      console.log('   • Performance test with large datasets');
    } catch (error) {
      console.error('❌ Seeder failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async seedMemberBatch(
    startIndex: number,
    endIndex: number,
    organisationId: string,
    branchId: string,
    auditUserId: string,
  ) {
    const createdMembers: any[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      const memberData = this.generateComprehensiveMemberData(
        i,
        organisationId,
        branchId,
        auditUserId,
      );
      const createdMember =
        await this.createMemberWithAllComplements(memberData);
      if (createdMember) {
        createdMembers.push(createdMember);
      }
    }

    return createdMembers;
  }

  private generateComprehensiveMemberData(
    index: number,
    organisationId: string,
    branchId: string,
    auditUserId: string,
  ) {
    // Realistic name pools
    const firstNames = {
      male: [
        'James',
        'John',
        'Robert',
        'Michael',
        'William',
        'David',
        'Richard',
        'Joseph',
        'Thomas',
        'Christopher',
        'Daniel',
        'Matthew',
        'Anthony',
        'Mark',
        'Donald',
        'Steven',
        'Paul',
        'Andrew',
        'Joshua',
        'Kenneth',
      ],
      female: [
        'Mary',
        'Patricia',
        'Jennifer',
        'Linda',
        'Elizabeth',
        'Barbara',
        'Susan',
        'Jessica',
        'Sarah',
        'Karen',
        'Nancy',
        'Lisa',
        'Betty',
        'Helen',
        'Sandra',
        'Donna',
        'Carol',
        'Ruth',
        'Sharon',
        'Michelle',
      ],
    };

    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
    ];

    const occupations = [
      'Teacher',
      'Engineer',
      'Doctor',
      'Nurse',
      'Lawyer',
      'Accountant',
      'Manager',
      'Sales Representative',
      'Consultant',
      'Analyst',
      'Developer',
      'Designer',
      'Writer',
      'Artist',
      'Student',
      'Retired',
    ];

    const cities = [
      'New York',
      'Los Angeles',
      'Chicago',
      'Houston',
      'Phoenix',
      'Philadelphia',
      'San Antonio',
      'San Diego',
      'Dallas',
      'San Jose',
    ];

    // Generate realistic demographic distribution
    const gender = Math.random() < 0.52 ? Gender.FEMALE : Gender.MALE;
    const firstName =
      firstNames[gender.toLowerCase() as keyof typeof firstNames][
        Math.floor(
          Math.random() *
            firstNames[gender.toLowerCase() as keyof typeof firstNames].length,
        )
      ];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    // Age distribution
    const ageDistribution = Math.random();
    let age: number;
    if (ageDistribution < 0.15) age = Math.floor(Math.random() * 18) + 5;
    else if (ageDistribution < 0.35) age = Math.floor(Math.random() * 20) + 23;
    else if (ageDistribution < 0.65) age = Math.floor(Math.random() * 20) + 43;
    else age = Math.floor(Math.random() * 25) + 63;

    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);
    dateOfBirth.setMonth(Math.floor(Math.random() * 12));
    dateOfBirth.setDate(Math.floor(Math.random() * 28) + 1);

    // Membership date
    const membershipYears = Math.random() * 10;
    const membershipDate = new Date();
    membershipDate.setFullYear(
      membershipDate.getFullYear() - Math.floor(membershipYears),
    );

    // Generate member ID
    const memberId = `MBR-${new Date().getFullYear()}-${String(index + 1).padStart(6, '0')}`;

    return {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@example.com`,
      phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `${Math.floor(Math.random() * 9999) + 1} Main St`,
      city: cities[Math.floor(Math.random() * cities.length)],
      state: 'CA',
      postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: 'United States',
      maritalStatus:
        age < 18
          ? MaritalStatus.SINGLE
          : age < 25
            ? Math.random() < 0.7
              ? MaritalStatus.SINGLE
              : MaritalStatus.MARRIED
            : Math.random() < 0.3
              ? MaritalStatus.SINGLE
              : MaritalStatus.MARRIED,
      occupation: occupations[Math.floor(Math.random() * occupations.length)],
      membershipDate,
      membershipStatus:
        Math.random() < 0.9
          ? MembershipStatus.ACTIVE_MEMBER
          : MembershipStatus.INACTIVE_MEMBER,
      membershipType:
        age < 13
          ? MembershipType.CHILD
          : age < 18
            ? MembershipType.YOUTH
            : age > 65
              ? MembershipType.SENIOR
              : MembershipType.REGULAR,
      status:
        Math.random() < 0.95 ? MemberStatus.ACTIVE : MemberStatus.INACTIVE,
      privacyLevel:
        Math.random() < 0.6 ? PrivacyLevel.STANDARD : PrivacyLevel.PUBLIC,
      isRegularAttendee: Math.random() < 0.7,
      consentDate: new Date(),
      consentVersion: '1.0',
      dataRetentionDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000),
      organisationId,
      branchId,
      createdBy: auditUserId,
      lastModifiedBy: auditUserId,
      memberId,
    };
  }

  private async createMemberWithAllComplements(memberData: any) {
    try {
      // Create the main member record
      const member = await this.prisma.member.create({
        data: {
          ...memberData,
          memberIdGeneratedAt: new Date(),
          cardIssued: Math.random() < 0.4,
          cardIssuedAt: Math.random() < 0.4 ? new Date() : null,
        },
      });

      // Create supporting records
      await Promise.all([
        this.createCommunicationPreferences(member.id),
        this.createMemberAnalytics(member.id),
        this.createMembershipHistory(member.id, memberData),
        this.createMemberSearchIndex(member.id, memberData),
        this.createAuditTrailEntry(member.id, memberData.createdBy),
      ]);

      console.log(
        `✅ Created member: ${memberData.firstName} ${memberData.lastName} (${memberData.memberId})`,
      );
      return member;
    } catch (error) {
      console.error(
        `❌ Error creating member ${memberData.firstName} ${memberData.lastName}:`,
        error,
      );
      return null;
    }
  }

  private async createCommunicationPreferences(memberId: string) {
    await this.prisma.communicationPrefs.create({
      data: {
        memberId,
        emailEnabled: Math.random() < 0.9,
        emailNewsletter: Math.random() < 0.8,
        emailEvents: Math.random() < 0.85,
        emailReminders: Math.random() < 0.9,
        smsEnabled: Math.random() < 0.6,
        smsEvents: Math.random() < 0.5,
        phoneCallsEnabled: Math.random() < 0.8,
        physicalMail: Math.random() < 0.7,
        pushNotifications: Math.random() < 0.85,
      },
    });
  }

  private async createMemberAnalytics(memberId: string) {
    await this.prisma.memberAnalytics.create({
      data: {
        memberId,
        totalAttendances: Math.floor(Math.random() * 200),
        attendanceRate: Math.random() * 100,
        lastAttendanceDate: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        ),
        totalContributions: Math.floor(Math.random() * 50000),
        lastContributionDate:
          Math.random() < 0.8
            ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
            : null,
        engagementScore: Math.random() * 100,
        engagementLevel: ['NEW', 'LOW', 'MEDIUM', 'HIGH'][
          Math.floor(Math.random() * 4)
        ],
        ministriesCount: Math.floor(Math.random() * 5),
        volunteerHours: Math.floor(Math.random() * 500),
        leadershipRoles: Math.floor(Math.random() * 3),
        emailOpenRate: Math.random() * 100,
        smsResponseRate: Math.random() * 100,
      },
    });
  }

  private async createMembershipHistory(memberId: string, memberData: any) {
    await this.prisma.membershipHistory.create({
      data: {
        memberId,
        fromStatus: null,
        toStatus: memberData.membershipStatus,
        changeDate: memberData.membershipDate,
        changeReason: 'Initial membership',
        notes: 'Member joined the church',
        approvedBy: memberData.createdBy,
      },
    });
  }

  private async createMemberSearchIndex(memberId: string, memberData: any) {
    const fullName = `${memberData.firstName} ${memberData.lastName}`;
    await this.prisma.memberSearchIndex.create({
      data: {
        memberId,
        fullName,
        searchName: fullName.toLowerCase(),
        phoneNumbers: [memberData.phoneNumber],
        emails: [memberData.email],
        addresses: [
          `${memberData.address}, ${memberData.city}, ${memberData.state}`,
        ],
        tags: [
          memberData.occupation,
          memberData.membershipType,
          memberData.membershipStatus,
        ].map((tag) => tag.toLowerCase()),
        searchRank: Math.random() * 100,
      },
    });
  }

  private async createAuditTrailEntry(memberId: string, userId: string) {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'Member',
        entityId: memberId,
        action: 'CREATE',
        description: 'Member created via comprehensive seeder',
        metadata: {
          action: 'Member created via comprehensive seeder',
          timestamp: new Date().toISOString(),
        },
        userId,
        ipAddress: '127.0.0.1',
        userAgent: 'ComprehensiveMembersSeeder/1.0',
      },
    });
  }

  private async createFamilyRelationships(createdMembers: any[]) {
    for (const member of createdMembers) {
      if (Math.random() < 0.3 && member.maritalStatus === 'MARRIED') {
        const spouse = createdMembers.find(
          (m) =>
            m.id !== member.id &&
            m.maritalStatus === 'MARRIED' &&
            m.gender !== member.gender,
        );
        if (spouse) {
          try {
            await this.prisma.memberRelationship.create({
              data: {
                primaryMemberId: member.id,
                relatedMemberId: spouse.id,
                relationshipType: RelationshipType.SPOUSE,
                relationshipStart: new Date(member.membershipDate),
              },
            });
          } catch (error) {
            // Ignore relationship creation errors to not stop the seeder
          }
        }
      }
    }
  }
}

// Run the seeder
async function runSeeder() {
  console.log('🚀 Starting Standalone Comprehensive Members Seeder...');

  try {
    const seeder = new StandaloneComprehensiveMembersSeeder();
    await seeder.seed();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Seeder interrupted by user');
  process.exit(1);
});

runSeeder();
