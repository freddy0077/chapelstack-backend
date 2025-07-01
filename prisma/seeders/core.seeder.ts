import { PrismaClient } from '@prisma/client';
import { seedOrganisation } from './organisationSeeder';
import { seedBranch } from './branchSeeder';
import { seedRoles } from './roleSeeder';
import { seedUsers } from './userSeeder';
import { seedMembers } from './memberSeeder';
import { seedAttendanceSessions } from './attendanceSessionSeeder';
import { seedAttendance } from './attendanceSeeder';

export async function seedCoreData(prisma: PrismaClient) {
  // 1. Organisation
  const organisation = await seedOrganisation(prisma);

  // 2. Branch
  const branch = await seedBranch(prisma, organisation.id);

  // 3. Roles
  const roles = await seedRoles(prisma);

  // 4. Users
  const users = await seedUsers(prisma, roles, branch.id, organisation.id);

  // 5. Members
  const members = await seedMembers(prisma, branch.id, organisation.id, 50); // Create 50 members

  // 6. Attendance Sessions
  const sessions = await seedAttendanceSessions(
    prisma,
    organisation.id,
    branch.id,
    10,
  ); // Create 10 sessions

  // 7. Attendance Records
  await seedAttendance(
    prisma,
    members.map((m) => m.id),
    branch.id,
    organisation.id,
    sessions,
    100, // Create 100 attendance records
  );

  return { organisation, branch, roles, users, members };
}
