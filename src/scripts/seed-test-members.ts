import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testMembers = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phoneNumber: '+233244123456',
    dateOfBirth: new Date('1995-03-15'),
    gender: 'FEMALE',
    maritalStatus: 'SINGLE',
    address: '123 Cantonments Road',
    city: 'Accra',
    state: 'Greater Accra',
    country: 'Ghana',
    occupation: 'Software Engineer',
    employerName: 'Tech Solutions Ltd',
    status: 'ACTIVE',
    membershipDate: new Date('2023-01-15'),
  },
  {
    firstName: 'Michael',
    lastName: 'Asante',
    email: 'michael.asante@example.com',
    phoneNumber: '+233244234567',
    dateOfBirth: new Date('1988-07-22'),
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    address: '456 Kumasi Road',
    city: 'Kumasi',
    state: 'Ashanti',
    country: 'Ghana',
    occupation: 'Teacher',
    employerName: 'Kumasi Senior High School',
    status: 'ACTIVE',
    membershipDate: new Date('2022-06-10'),
  },
  {
    firstName: 'Grace',
    lastName: 'Mensah',
    email: 'grace.mensah@example.com',
    phoneNumber: '+233244345678',
    dateOfBirth: new Date('1992-11-08'),
    gender: 'FEMALE',
    maritalStatus: 'MARRIED',
    address: '789 Tema Station',
    city: 'Tema',
    state: 'Greater Accra',
    country: 'Ghana',
    occupation: 'Nurse',
    employerName: 'Tema General Hospital',
    status: 'ACTIVE',
    membershipDate: new Date('2023-03-20'),
  },
  {
    firstName: 'Emmanuel',
    lastName: 'Osei',
    email: 'emmanuel.osei@example.com',
    phoneNumber: '+233244456789',
    dateOfBirth: new Date('1975-05-12'),
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    address: '321 Cape Coast Castle Road',
    city: 'Cape Coast',
    state: 'Central',
    country: 'Ghana',
    occupation: 'Business Owner',
    employerName: 'Osei Trading Company',
    status: 'ACTIVE',
    membershipDate: new Date('2020-08-05'),
  },
  {
    firstName: 'Abena',
    lastName: 'Frimpong',
    email: 'abena.frimpong@example.com',
    phoneNumber: '+233244567890',
    dateOfBirth: new Date('1998-09-30'),
    gender: 'FEMALE',
    maritalStatus: 'SINGLE',
    address: '654 University Road',
    city: 'Legon',
    state: 'Greater Accra',
    country: 'Ghana',
    occupation: 'Student',
    employerName: 'University of Ghana',
    status: 'ACTIVE',
    membershipDate: new Date('2024-01-10'),
  },
  {
    firstName: 'Kwame',
    lastName: 'Boateng',
    email: 'kwame.boateng@example.com',
    phoneNumber: '+233244678901',
    dateOfBirth: new Date('1965-12-03'),
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    address: '987 Tamale Market Street',
    city: 'Tamale',
    state: 'Northern',
    country: 'Ghana',
    occupation: 'Farmer',
    employerName: 'Boateng Farms',
    status: 'ACTIVE',
    membershipDate: new Date('2019-04-15'),
  },
  {
    firstName: 'Akosua',
    lastName: 'Adjei',
    email: 'akosua.adjei@example.com',
    phoneNumber: '+233244789012',
    dateOfBirth: new Date('1985-02-18'),
    gender: 'FEMALE',
    maritalStatus: 'DIVORCED',
    address: '147 Takoradi Harbor Road',
    city: 'Takoradi',
    state: 'Western',
    country: 'Ghana',
    occupation: 'Accountant',
    employerName: 'Adjei & Associates',
    status: 'ACTIVE',
    membershipDate: new Date('2021-11-22'),
  },
  {
    firstName: 'Joseph',
    lastName: 'Appiah',
    email: 'joseph.appiah@example.com',
    phoneNumber: '+233244890123',
    dateOfBirth: new Date('1955-08-25'),
    gender: 'MALE',
    maritalStatus: 'WIDOWED',
    address: '258 Ho Township',
    city: 'Ho',
    state: 'Volta',
    country: 'Ghana',
    occupation: 'Retired',
    employerName: 'Ghana Education Service',
    status: 'ACTIVE',
    membershipDate: new Date('2018-02-28'),
  },
  {
    firstName: 'Ama',
    lastName: 'Darko',
    email: 'ama.darko@example.com',
    phoneNumber: '+233244901234',
    dateOfBirth: new Date('2001-06-14'),
    gender: 'FEMALE',
    maritalStatus: 'SINGLE',
    address: '369 Sunyani Central',
    city: 'Sunyani',
    state: 'Bono',
    country: 'Ghana',
    occupation: 'Student',
    employerName: 'University of Energy and Natural Resources',
    status: 'ACTIVE',
    membershipDate: new Date('2024-05-12'),
  },
  {
    firstName: 'Kofi',
    lastName: 'Owusu',
    email: 'kofi.owusu@example.com',
    phoneNumber: '+233245012345',
    dateOfBirth: new Date('1978-04-07'),
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    address: '741 Bolgatanga Market',
    city: 'Bolgatanga',
    state: 'Upper East',
    country: 'Ghana',
    occupation: 'Doctor',
    employerName: 'Bolgatanga Regional Hospital',
    status: 'ACTIVE',
    membershipDate: new Date('2020-12-18'),
  },
  // Add some inactive members for retention analysis
  {
    firstName: 'Yaw',
    lastName: 'Asiedu',
    email: 'yaw.asiedu@example.com',
    phoneNumber: '+233245123456',
    dateOfBirth: new Date('1990-10-11'),
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    address: '852 East Legon',
    city: 'Accra',
    state: 'Greater Accra',
    country: 'Ghana',
    occupation: 'Engineer',
    employerName: 'Ghana Water Company',
    status: 'INACTIVE',
    membershipDate: new Date('2022-03-08'),
  },
  {
    firstName: 'Efua',
    lastName: 'Gyasi',
    email: 'efua.gyasi@example.com',
    phoneNumber: '+233245234567',
    dateOfBirth: new Date('1983-01-29'),
    gender: 'FEMALE',
    maritalStatus: 'MARRIED',
    address: '963 Dansoman Estate',
    city: 'Accra',
    state: 'Greater Accra',
    country: 'Ghana',
    occupation: 'Lawyer',
    employerName: 'Gyasi Law Firm',
    status: 'INACTIVE',
    membershipDate: new Date('2021-07-14'),
  },
];

async function seedTestMembers() {
  console.log('🌱 Starting to seed test members...');

  try {
    // Get the first organization and branch for assignment
    const organization = await prisma.organisation.findFirst();
    const branch = await prisma.branch.findFirst();

    if (!organization) {
      console.error(
        '❌ No organization found. Please create an organization first.',
      );
      return;
    }

    if (!branch) {
      console.error('❌ No branch found. Please create a branch first.');
      return;
    }

    console.log(`📍 Using Organization: ${organization.name}`);
    console.log(`🏢 Using Branch: ${branch.name}`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const memberData of testMembers) {
      try {
        // Check if member already exists
        const existingMember = await prisma.member.findUnique({
          where: { email: memberData.email },
        });

        if (existingMember) {
          console.log(
            `⏭️  Skipping ${memberData.firstName} ${memberData.lastName} - already exists`,
          );
          skippedCount++;
          continue;
        }

        // Create the member
        const member = await prisma.member.create({
          data: {
            ...memberData,
            organisationId: organization.id,
            branchId: branch.id,
            // Cast enum fields to proper types
            gender: memberData.gender as any,
            maritalStatus: memberData.maritalStatus as any,
            status: memberData.status as any,
          },
        });

        console.log(
          `✅ Created member: ${member.firstName} ${member.lastName} (${member.email})`,
        );
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Error creating member ${memberData.firstName} ${memberData.lastName}:`,
          error,
        );
      }
    }

    console.log('\n🎉 Seeding completed!');
    console.log(`✅ Created: ${createdCount} members`);
    console.log(`⏭️  Skipped: ${skippedCount} members (already exist)`);
    console.log(`📊 Total test members: ${createdCount + skippedCount}`);

    // Show summary statistics
    const totalMembers = await prisma.member.count();
    const activeMembers = await prisma.member.count({
      where: { status: 'ACTIVE' },
    });
    const inactiveMembers = await prisma.member.count({
      where: { status: 'INACTIVE' },
    });

    console.log('\n📈 Database Summary:');
    console.log(`👥 Total Members: ${totalMembers}`);
    console.log(`✅ Active Members: ${activeMembers}`);
    console.log(`❌ Inactive Members: ${inactiveMembers}`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedTestMembers();
