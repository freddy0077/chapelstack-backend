import { PrismaClient, AttendanceSession } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAttendanceSessions(
  prisma: PrismaClient,
  organisationId: string,
  branchId: string,
  count = 5,
): Promise<AttendanceSession[]> {
  const sessions: AttendanceSession[] = [];

  for (let i = 0; i < count; i++) {
    const startTime = faker.date.recent();
    const session = await prisma.attendanceSession.create({
      data: {
        name: `Sunday Service ${i + 1}`,
        description: faker.lorem.sentence(),
        startTime,
        endTime: faker.date.future({ refDate: startTime }),
        organisationId,
        branchId,
        date: startTime,
        type: 'SERVICE',
      },
    });
    sessions.push(session);
  }

  return sessions;
}
