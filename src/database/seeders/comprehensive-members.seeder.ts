import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MemberIdGenerationService } from '../../common/services/member-id-generation.service';
import {
  Gender,
  MaritalStatus,
  MembershipStatus,
  MembershipType,
  MemberStatus,
  PrivacyLevel,
  RelationshipType,
} from '@prisma/client';

@Injectable()
export class ComprehensiveMembersSeeder {
  constructor(
    private readonly prisma: PrismaService,
    private readonly memberIdService: MemberIdGenerationService,
  ) {}

  async seed() {
    console.log('🌱 Starting comprehensive members seeder...');

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

    // Create a super admin user for audit trail
    const superAdminUser = await this.prisma.user.findFirst({
      where: {
        roles: {
          some: {
            name: 'super_admin',
          },
        },
      },
    });

    const auditUserId =
      superAdminUser?.id || '5453df9a-003a-4319-a532-84b527b9e285';

    // Generate 1000 comprehensive members
    const memberCount = 1000;
    const batchSize = 50; // Process in batches to avoid memory issues

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

    console.log('✅ Comprehensive members seeder completed successfully!');
    console.log(`📊 Created ${memberCount} members with full complements:`);
    console.log('   • Complete personal and contact information');
    console.log('   • Communication preferences');
    console.log('   • Member analytics and engagement data');
    console.log('   • Membership history records');
    console.log('   • Search index entries');
    console.log('   • Audit trail entries');
    console.log('   • Family relationships');
  }

  private async seedMemberBatch(
    startIndex: number,
    endIndex: number,
    organisationId: string,
    branchId: string,
    auditUserId: string,
  ) {
    const members: any[] = [];
    const createdMembers: any[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      const memberData = await this.generateComprehensiveMemberData(
        i,
        organisationId,
        branchId,
        auditUserId,
      );
      members.push(memberData);
    }

    // Create members in batch
    for (const memberData of members) {
      const createdMember =
        await this.createMemberWithAllComplements(memberData);
      if (createdMember) {
        createdMembers.push(createdMember);
      }
    }

    return createdMembers;
  }

  private async generateComprehensiveMemberData(
    index: number,
    organisationId: string,
    branchId: string,
    auditUserId: string,
  ) {
    // Realistic name pools for diversity
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
        'Kevin',
        'Brian',
        'George',
        'Edward',
        'Ronald',
        'Timothy',
        'Jason',
        'Jeffrey',
        'Ryan',
        'Jacob',
        'Gary',
        'Nicholas',
        'Eric',
        'Jonathan',
        'Stephen',
        'Larry',
        'Justin',
        'Scott',
        'Brandon',
        'Benjamin',
        'Samuel',
        'Gregory',
        'Alexander',
        'Patrick',
        'Frank',
        'Raymond',
        'Jack',
        'Dennis',
        'Jerry',
        'Tyler',
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
        'Laura',
        'Sarah',
        'Kimberly',
        'Deborah',
        'Dorothy',
        'Lisa',
        'Nancy',
        'Karen',
        'Betty',
        'Helen',
        'Sandra',
        'Donna',
        'Carol',
        'Ruth',
        'Sharon',
        'Michelle',
        'Laura',
        'Sarah',
        'Kimberly',
        'Deborah',
        'Amy',
        'Angela',
        'Ashley',
        'Brenda',
        'Emma',
        'Olivia',
        'Cynthia',
        'Marie',
        'Janet',
        'Catherine',
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
      'Gonzalez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
      'Perez',
      'Thompson',
      'White',
      'Harris',
      'Sanchez',
      'Clark',
      'Ramirez',
      'Lewis',
      'Robinson',
      'Walker',
      'Young',
      'Allen',
      'King',
      'Wright',
      'Scott',
      'Torres',
      'Nguyen',
      'Hill',
      'Flores',
      'Green',
      'Adams',
      'Nelson',
      'Baker',
      'Hall',
      'Rivera',
      'Campbell',
      'Mitchell',
      'Carter',
      'Roberts',
    ];

    const middleNames = [
      'Alexander',
      'James',
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
      'Kevin',
      'Brian',
      'George',
      'Edward',
      'Ronald',
      'Timothy',
      'Jason',
      'Jeffrey',
      'Ryan',
      'Jacob',
      'Gary',
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
      'Musician',
      'Chef',
      'Mechanic',
      'Electrician',
      'Plumber',
      'Carpenter',
      'Farmer',
      'Police Officer',
      'Firefighter',
      'Paramedic',
      'Social Worker',
      'Therapist',
      'Pharmacist',
      'Dentist',
      'Veterinarian',
      'Pilot',
      'Driver',
      'Cashier',
      'Waiter',
      'Barber',
      'Hairdresser',
      'Cleaner',
      'Security Guard',
      'Receptionist',
      'Secretary',
      'Administrator',
      'Coordinator',
      'Supervisor',
      'Director',
      'Executive',
      'Entrepreneur',
      'Student',
      'Retired',
      'Homemaker',
      'Volunteer',
      'Unemployed',
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
      'Austin',
      'Jacksonville',
      'Fort Worth',
      'Columbus',
      'Charlotte',
      'San Francisco',
      'Indianapolis',
      'Seattle',
      'Denver',
      'Washington',
      'Boston',
      'El Paso',
      'Nashville',
      'Detroit',
      'Oklahoma City',
      'Portland',
      'Las Vegas',
      'Memphis',
      'Louisville',
      'Baltimore',
      'Milwaukee',
      'Albuquerque',
      'Tucson',
      'Fresno',
      'Mesa',
      'Sacramento',
      'Atlanta',
      'Kansas City',
      'Colorado Springs',
      'Omaha',
      'Raleigh',
      'Miami',
      'Long Beach',
      'Virginia Beach',
      'Oakland',
      'Minneapolis',
      'Tulsa',
      'Arlington',
      'Tampa',
      'New Orleans',
    ];

    // Generate realistic demographic distribution
    const gender = Math.random() < 0.52 ? Gender.FEMALE : Gender.MALE; // Slightly more females (realistic church demographics)
    const firstName =
      firstNames[gender.toLowerCase() as keyof typeof firstNames][
        Math.floor(
          Math.random() *
            firstNames[gender.toLowerCase() as keyof typeof firstNames].length,
        )
      ];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const middleName =
      Math.random() < 0.7
        ? middleNames[Math.floor(Math.random() * middleNames.length)]
        : null;

    // Age distribution (realistic church demographics)
    const ageDistribution = Math.random();
    let age: number;
    if (ageDistribution < 0.15)
      age = Math.floor(Math.random() * 18) + 5; // Children (5-22)
    else if (ageDistribution < 0.35)
      age = Math.floor(Math.random() * 20) + 23; // Young adults (23-42)
    else if (ageDistribution < 0.65)
      age = Math.floor(Math.random() * 20) + 43; // Middle-aged (43-62)
    else age = Math.floor(Math.random() * 25) + 63; // Seniors (63-87)

    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);
    dateOfBirth.setMonth(Math.floor(Math.random() * 12));
    dateOfBirth.setDate(Math.floor(Math.random() * 28) + 1);

    // Membership tenure distribution
    const membershipTenure = Math.random();
    let membershipYears: number;
    if (membershipTenure < 0.3)
      membershipYears = Math.random() * 2; // New members (0-2 years)
    else if (membershipTenure < 0.5)
      membershipYears = Math.random() * 3 + 2; // Recent (2-5 years)
    else if (membershipTenure < 0.8)
      membershipYears = Math.random() * 10 + 5; // Established (5-15 years)
    else membershipYears = Math.random() * 20 + 15; // Veterans (15-35 years)

    const membershipDate = new Date();
    membershipDate.setFullYear(
      membershipDate.getFullYear() - Math.floor(membershipYears),
    );
    membershipDate.setMonth(Math.floor(Math.random() * 12));
    membershipDate.setDate(Math.floor(Math.random() * 28) + 1);

    // Generate comprehensive member data
    return {
      // Basic Information
      firstName,
      middleName,
      lastName,
      title:
        Math.random() < 0.3
          ? ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Rev.', 'Prof.'][
              Math.floor(Math.random() * 6)
            ]
          : null,
      gender,
      dateOfBirth,

      // Contact Information
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@example.com`,
      phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      alternatePhone:
        Math.random() < 0.4
          ? `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
          : null,

      // Address Information
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Park', 'Hill', 'Lake', 'River'][Math.floor(Math.random() * 10)]} ${['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Ct'][Math.floor(Math.random() * 6)]}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      state: ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'][
        Math.floor(Math.random() * 10)
      ],
      postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: 'United States',

      // Demographics
      maritalStatus:
        age < 18
          ? MaritalStatus.SINGLE
          : age < 25
            ? Math.random() < 0.7
              ? MaritalStatus.SINGLE
              : MaritalStatus.MARRIED
            : age < 35
              ? Math.random() < 0.4
                ? MaritalStatus.SINGLE
                : MaritalStatus.MARRIED
              : age < 50
                ? Math.random() < 0.2
                  ? MaritalStatus.SINGLE
                  : MaritalStatus.MARRIED
                : Math.random() < 0.1
                  ? MaritalStatus.WIDOWED
                  : MaritalStatus.MARRIED,
      occupation: occupations[Math.floor(Math.random() * occupations.length)],
      employerName:
        Math.random() < 0.8
          ? `${['ABC', 'XYZ', 'Global', 'United', 'Premier', 'Elite', 'Dynamic', 'Innovative', 'Strategic', 'Advanced'][Math.floor(Math.random() * 10)]} ${['Corp', 'Inc', 'LLC', 'Group', 'Solutions', 'Services', 'Systems', 'Technologies', 'Enterprises', 'Industries'][Math.floor(Math.random() * 10)]}`
          : null,

      // Family Information
      fatherName:
        Math.random() < 0.8
          ? `${firstNames.male[Math.floor(Math.random() * firstNames.male.length)]} ${lastName}`
          : null,
      motherName:
        Math.random() < 0.8
          ? `${firstNames.female[Math.floor(Math.random() * firstNames.female.length)]} ${lastName}`
          : null,
      fatherOccupation:
        Math.random() < 0.7
          ? occupations[Math.floor(Math.random() * occupations.length)]
          : null,
      motherOccupation:
        Math.random() < 0.7
          ? occupations[Math.floor(Math.random() * occupations.length)]
          : null,

      // Emergency Contact
      emergencyContactName: `${firstNames[Math.random() < 0.5 ? 'male' : 'female'][Math.floor(Math.random() * 20)]} ${lastNames[Math.floor(Math.random() * 20)]}`,
      emergencyContactPhone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      emergencyContactRelation: [
        'Spouse',
        'Parent',
        'Sibling',
        'Child',
        'Friend',
        'Relative',
      ][Math.floor(Math.random() * 6)],

      // Church Information
      membershipDate,
      membershipStatus:
        membershipYears < 0.5
          ? MembershipStatus.VISITOR
          : membershipYears < 1
            ? MembershipStatus.REGULAR_ATTENDEE
            : membershipYears < 2
              ? MembershipStatus.MEMBER
              : Math.random() < 0.9
                ? MembershipStatus.ACTIVE_MEMBER
                : MembershipStatus.INACTIVE_MEMBER,
      membershipType:
        age < 13
          ? MembershipType.CHILD
          : age < 18
            ? MembershipType.YOUTH
            : age > 65
              ? MembershipType.SENIOR
              : Math.random() < 0.05
                ? MembershipType.CLERGY
                : Math.random() < 0.1
                  ? MembershipType.HONORARY
                  : Math.random() < 0.15
                    ? MembershipType.ASSOCIATE
                    : MembershipType.REGULAR,
      status:
        Math.random() < 0.95
          ? MemberStatus.ACTIVE
          : Math.random() < 0.8
            ? MemberStatus.INACTIVE
            : MemberStatus.TRANSFERRED,

      // Spiritual Information
      baptismDate:
        Math.random() < 0.8
          ? new Date(
              membershipDate.getTime() +
                Math.random() * 365 * 24 * 60 * 60 * 1000,
            )
          : null,
      baptismLocation: Math.random() < 0.8 ? `${branchId} Church` : null,
      confirmationDate:
        Math.random() < 0.6
          ? new Date(
              membershipDate.getTime() +
                Math.random() * 730 * 24 * 60 * 60 * 1000,
            )
          : null,
      salvationDate:
        Math.random() < 0.9
          ? new Date(
              membershipDate.getTime() -
                Math.random() * 365 * 24 * 60 * 60 * 1000,
            )
          : null,

      // Additional Information
      nationality: [
        'American',
        'Canadian',
        'Mexican',
        'British',
        'German',
        'French',
        'Italian',
        'Spanish',
        'Nigerian',
        'Ghanaian',
        'Kenyan',
        'South African',
        'Indian',
        'Chinese',
        'Japanese',
        'Korean',
        'Brazilian',
        'Argentine',
        'Australian',
        'Other',
      ][Math.floor(Math.random() * 20)],
      placeOfBirth: cities[Math.floor(Math.random() * cities.length)],
      education: [
        'High School',
        'Associate Degree',
        "Bachelor's Degree",
        "Master's Degree",
        'Doctorate',
        'Professional Degree',
        'Trade School',
        'Some College',
        'Elementary',
        'Other',
      ][Math.floor(Math.random() * 10)],
      preferredLanguage:
        Math.random() < 0.85
          ? 'en'
          : ['es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'][
              Math.floor(Math.random() * 10)
            ],
      privacyLevel:
        Math.random() < 0.6
          ? PrivacyLevel.STANDARD
          : Math.random() < 0.8
            ? PrivacyLevel.PUBLIC
            : Math.random() < 0.9
              ? PrivacyLevel.RESTRICTED
              : PrivacyLevel.PRIVATE,

      // Attendance and Engagement
      isRegularAttendee: Math.random() < 0.7,
      lastAttendanceDate:
        Math.random() < 0.9
          ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
          : null,
      headOfHousehold: Math.random() < 0.3,

      // GDPR and Data Management
      consentDate: new Date(
        membershipDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000,
      ),
      consentVersion: '1.0',
      dataRetentionDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years from now

      // System Information
      organisationId,
      branchId,
      createdBy: auditUserId,
      lastModifiedBy: auditUserId,

      // Profile Image (realistic S3 URLs)
      profileImageUrl:
        Math.random() < 0.6
          ? `https://chapelstack-bucket.s3.eu-west-1.amazonaws.com/profile-images/member-${index + 1}.jpg`
          : null,

      // Notes
      notes:
        Math.random() < 0.3
          ? [
              'Active in community outreach programs',
              'Volunteers regularly for church events',
              'Has leadership experience',
              'New to the area, looking to get involved',
              'Interested in joining the choir',
              'Has special dietary requirements',
              'Prefers evening service attendance',
              'Active in youth mentorship',
              'Skilled in technical support',
              'Available for emergency pastoral care',
            ][Math.floor(Math.random() * 10)]
          : null,
    };
  }

  private async createMemberWithAllComplements(memberData: any) {
    try {
      // Generate unique member ID
      const memberId = await this.memberIdService.generateMemberId(
        memberData.branchId,
        memberData.organisationId,
      );

      // Create the main member record
      const member = await this.prisma.member.create({
        data: {
          ...memberData,
          memberId,
          memberIdGeneratedAt: new Date(),
          cardIssued: Math.random() < 0.4,
          cardIssuedAt: Math.random() < 0.4 ? new Date() : null,
          cardType:
            Math.random() < 0.4
              ? ['NFC', 'RFID', 'BARCODE'][Math.floor(Math.random() * 3)]
              : null,
        },
      });

      // Create Communication Preferences
      await this.createCommunicationPreferences(member.id);

      // Create Member Analytics
      await this.createMemberAnalytics(member.id);

      // Create Membership History
      await this.createMembershipHistory(member.id, memberData);

      // Create Member Search Index
      await this.createMemberSearchIndex(member.id, memberData);

      // Create Audit Trail Entry
      await this.createAuditTrailEntry(member.id, memberData.createdBy);

      console.log(
        `✅ Created comprehensive member: ${memberData.firstName} ${memberData.lastName} (${memberId})`,
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
        emailPrayer: Math.random() < 0.7,
        smsEnabled: Math.random() < 0.6,
        smsEvents: Math.random() < 0.5,
        smsReminders: Math.random() < 0.4,
        smsEmergency: Math.random() < 0.95,
        phoneCallsEnabled: Math.random() < 0.8,
        phoneEmergency: Math.random() < 0.98,
        physicalMail: Math.random() < 0.7,
        pushNotifications: Math.random() < 0.85,
        preferredCallTime:
          Math.random() < 0.6
            ? JSON.stringify({ start: '09:00', end: '17:00' })
            : null,
        doNotDisturbDays: Math.random() < 0.3 ? ['SUNDAY'] : [],
      },
    });
  }

  private async createMemberAnalytics(memberId: string) {
    await this.prisma.memberAnalytics.create({
      data: {
        memberId,
        totalAttendances: Math.floor(Math.random() * 200),
        attendanceRate: Math.floor(Math.random() * 100) + 1,
        lastAttendanceDate: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        ),
        totalContributions: Math.floor(Math.random() * 50000),
        lastContributionDate:
          Math.random() < 0.8
            ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
            : null,
        engagementScore: Math.floor(Math.random() * 100) + 1,
        engagementLevel: ['NEW', 'LOW', 'MEDIUM', 'HIGH'][
          Math.floor(Math.random() * 4)
        ],
        ministriesCount: Math.floor(Math.random() * 5),
        volunteerHours: Math.floor(Math.random() * 500),
        leadershipRoles: Math.floor(Math.random() * 3),
        emailOpenRate: Math.floor(Math.random() * 100) + 1,
        smsResponseRate: Math.floor(Math.random() * 100) + 1,
      },
    });
  }

  private async createMembershipHistory(memberId: string, memberData: any) {
    // Create initial membership history record
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

    // Potentially add status change history
    if (Math.random() < 0.3) {
      await this.prisma.membershipHistory.create({
        data: {
          memberId,
          fromStatus: 'VISITOR',
          toStatus: memberData.membershipStatus,
          changeDate: new Date(
            memberData.membershipDate.getTime() + 90 * 24 * 60 * 60 * 1000,
          ),
          changeReason: 'Membership progression',
          notes: 'Member progressed from visitor to active member',
          approvedBy: memberData.createdBy,
        },
      });
    }
  }

  private async createMemberSearchIndex(memberId: string, memberData: any) {
    const fullName =
      `${memberData.firstName} ${memberData.middleName || ''} ${memberData.lastName}`.trim();
    await this.prisma.memberSearchIndex.create({
      data: {
        memberId,
        fullName,
        searchName: fullName.toLowerCase(),
        phoneNumbers: [
          memberData.phoneNumber,
          memberData.alternatePhone,
        ].filter(Boolean),
        emails: [memberData.email].filter(Boolean),
        addresses: [
          `${memberData.address}, ${memberData.city}, ${memberData.state} ${memberData.postalCode}`,
        ].filter(Boolean),
        tags: [
          memberData.occupation,
          memberData.membershipType,
          memberData.membershipStatus,
          memberData.maritalStatus,
          memberData.gender,
          memberData.nationality,
        ]
          .filter(Boolean)
          .map((tag) => tag.toLowerCase()),
        searchRank: Math.floor(Math.random() * 100) + 1,
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
      if (Math.random() < 0.7 && member.maritalStatus === 'MARRIED') {
        // Create spouse relationship
        const spouse = createdMembers.find(
          (m) =>
            m.id !== member.id &&
            m.maritalStatus === 'MARRIED' &&
            m.gender !== member.gender,
        );
        if (spouse) {
          await this.prisma.memberRelationship.create({
            data: {
              primaryMemberId: member.id,
              relatedMemberId: spouse.id,
              relationshipType: RelationshipType.SPOUSE,
              relationshipStart: new Date(member.membershipDate),
            },
          });
        }
      }

      if (Math.random() < 0.5) {
        // Create child relationship
        const child = createdMembers.find(
          (m) =>
            m.id !== member.id &&
            new Date().getFullYear() - m.dateOfBirth.getFullYear() < 18,
        );
        if (child) {
          await this.prisma.memberRelationship.create({
            data: {
              primaryMemberId: member.id,
              relatedMemberId: child.id,
              relationshipType: RelationshipType.CHILD,
              relationshipStart: child.dateOfBirth,
            },
          });
        }
      }

      if (Math.random() < 0.3) {
        // Create parent relationship
        const parent = createdMembers.find(
          (m) =>
            m.id !== member.id &&
            new Date().getFullYear() - m.dateOfBirth.getFullYear() > 40,
        );
        if (parent) {
          await this.prisma.memberRelationship.create({
            data: {
              primaryMemberId: member.id,
              relatedMemberId: parent.id,
              relationshipType: RelationshipType.PARENT,
              relationshipStart: member.dateOfBirth,
            },
          });
        }
      }
    }
  }
}
