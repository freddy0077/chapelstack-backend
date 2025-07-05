import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateRfidCardId(
  year: number,
  branchCode: string,
  id: number,
) {
  const prefix = 'M';
  const paddedId = String(id).padStart(6, '0');
  return `${prefix}-${year}-${branchCode}-${paddedId}`;
}

async function seedRfidCardIds() {
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
  });
  const year = new Date().getFullYear();

  for (const branch of branches) {
    const branchCode = branch.name.slice(0, 3).toUpperCase();
    // Get all members in this branch who do not have an RFID card ID
    const members = await prisma.member.findMany({
      where: {
        branchId: branch.id,
        OR: [{ rfidCardId: null }, { rfidCardId: '' }],
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    let counter = 1;
    for (const member of members) {
      const rfidCardId = await generateRfidCardId(year, branchCode, counter);
      await prisma.member.update({
        where: { id: member.id },
        data: { rfidCardId },
      });
      counter++;
    }
  }
  console.log('RFID Card ID seeding complete.');
}

if (require.main === module) {
  seedRfidCardIds()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
