import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('SuperAdminDashboardResolver (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Optionally, authenticate as a super admin and get a JWT token
    // jwtToken = await getSuperAdminToken(app); // Implement this helper if needed
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns all super admin dashboard data', async () => {
    const query = `
      query {
        superAdminDashboardData {
          organisationOverview { total organisations { id name branchCount adminCount } }
          branchesSummary { total branches { id name organisation status } }
          memberSummary { total }
          financialOverview { totalContributions }
          attendanceOverview { totalAttendance }
          sacramentsOverview { totalSacraments }
          activityEngagement { recentEvents { id title startDate } }
          systemHealth { healthy }
          announcements { announcements { id title startDate } }
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      // .set('Authorization', `Bearer ${jwtToken}`) // Uncomment if auth is required
      ;
    expect(res.status).toBe(200);
    expect(res.body.data.superAdminDashboardData).toBeDefined();
    expect(res.body.data.superAdminDashboardData.organisationOverview).toHaveProperty('total');
    expect(res.body.data.superAdminDashboardData.branchesSummary).toHaveProperty('total');
    expect(res.body.data.superAdminDashboardData.memberSummary).toHaveProperty('total');
    // ...add more assertions as needed
  });
});
