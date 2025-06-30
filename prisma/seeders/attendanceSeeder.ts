import { PrismaClient, AttendanceRecord, AttendanceSession } from '@prisma/client';
import { subDays, setHours, setMinutes } from 'date-fns';

export async function seedAttendance(
  prisma: PrismaClient,
  memberIds: string[],
  branchId: string,
  organisationId: string,
  sessions: AttendanceSession[],
  days = 30
): Promise<AttendanceRecord[]> {
  const attendanceRecords: AttendanceRecord[] = [];
  if (sessions.length === 0) {
    console.log('No attendance sessions found, skipping attendance seeding.');
    return [];
  }

  const now = new Date();
  for (let i = 0; i < days; i++) {
    const date = subDays(now, i);
    for (const memberId of memberIds) {
      // Randomly decide if this member attended on this day
      if (Math.random() < 0.7) { // 70% chance attended
        const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
        const checkInTime = setMinutes(setHours(date, 9), Math.floor(Math.random() * 30));
        const record = await prisma.attendanceRecord.create({
          data: {
            memberId,
            branchId,
            organisationId,
            sessionId: randomSession.id,
            checkInTime,
            checkInMethod: 'MANUAL',
          },
        });
        attendanceRecords.push(record);
      }
    }
  }
  return attendanceRecords;
}
