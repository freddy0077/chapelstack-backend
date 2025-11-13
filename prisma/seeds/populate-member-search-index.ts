import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateMemberSearchIndex() {
  console.log('Starting to populate MemberSearchIndex...');

  try {
    // Get all members without search index
    const members = await prisma.member.findMany({
      where: {
        deletedAt: null,
        searchIndex: null,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        alternatePhone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
      },
    });

    console.log(`Found ${members.length} members without search index`);

    let successCount = 0;
    let errorCount = 0;

    for (const member of members) {
      try {
        await prisma.memberSearchIndex.create({
          data: {
            memberId: member.id,
            fullName: [member.firstName, member.middleName, member.lastName]
              .filter(Boolean)
              .join(' '),
            searchName: [member.firstName, member.middleName, member.lastName]
              .filter(Boolean)
              .join(' ')
              .toLowerCase(),
            phoneNumbers: [member.phoneNumber, member.alternatePhone].filter(
              (phone): phone is string => Boolean(phone),
            ),
            emails: [member.email].filter(
              (email): email is string => Boolean(email),
            ),
            addresses: [
              [
                member.address,
                member.city,
                member.state,
                member.postalCode,
                member.country,
              ]
                .filter(Boolean)
                .join(', '),
            ].filter(Boolean),
            tags: [],
            searchRank: 1.0,
          },
        });
        successCount++;
        console.log(`✓ Created search index for: ${member.firstName} ${member.lastName}`);
      } catch (error) {
        errorCount++;
        console.error(
          `✗ Error creating search index for member ${member.id}:`,
          error,
        );
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total members processed: ${members.length}`);
    console.log(`Successfully created: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('MemberSearchIndex population complete!');
  } catch (error) {
    console.error('Error populating MemberSearchIndex:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

populateMemberSearchIndex()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
