import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from './../src/app.module';
import {
  DashboardType,
  WidgetType,
} from '../src/reporting/entities/dashboard-data.entity';

// Generic GraphQL Error and Response Interfaces (similar to auth.e2e-spec.ts)
interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, any>;
}

interface GraphQLResponse<T = any> {
  data?: T | null;
  errors?: GraphQLError[];
}

// Interfaces for Dashboard entities (mirroring GraphQL types)
interface KpiCard {
  __typename: 'KpiCard';
  widgetType: WidgetType;
  title: string;
  value: string;
  percentChange?: number;
  icon?: string;
}

interface ChartData {
  __typename: 'ChartData';
  widgetType: WidgetType;
  title: string;
  chartType: string;
  data: Record<string, any>; // GraphQLJSON
}

interface EventItem {
  id: string;
  title: string;
  startDate: string; // Dates will be strings in JSON response
  endDate?: string;
  location?: string;
  description?: string;
}

interface UpcomingEventsWidget {
  __typename: 'UpcomingEventsWidget';
  widgetType: WidgetType;
  title: string;
  events: EventItem[];
}

interface TaskItem {
  id: string;
  title: string;
  dueDate?: string;
  status?: string;
  priority?: string;
}

interface TasksWidget {
  __typename: 'TasksWidget';
  widgetType: WidgetType;
  title: string;
  tasks: TaskItem[];
}

interface GroupItem {
  id: string;
  name: string;
  type?: string;
  role?: string;
  nextMeeting?: string;
  meetingDay?: string;
  meetingTime?: string;
}

interface MyGroupsWidget {
  __typename: 'MyGroupsWidget';
  widgetType: WidgetType;
  title: string;
  groups: GroupItem[];
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  author?: string;
  priority?: string;
}

interface AnnouncementsWidget {
  __typename: 'AnnouncementsWidget';
  widgetType: WidgetType;
  title: string;
  announcements: AnnouncementItem[];
}

interface QuickLinkItem {
  title: string;
  url: string;
  icon?: string;
}

interface QuickLinksWidget {
  __typename: 'QuickLinksWidget';
  widgetType: WidgetType;
  title: string;
  links: QuickLinkItem[];
}

interface NotificationItem {
  id: string;
  message: string;
  date: string;
  type: string;
  read: boolean;
}

interface NotificationsWidget {
  __typename: 'NotificationsWidget';
  widgetType: WidgetType;
  title: string;
  notifications: NotificationItem[];
}

type DashboardWidget =
  | KpiCard
  | ChartData
  | UpcomingEventsWidget
  | TasksWidget
  | MyGroupsWidget
  | AnnouncementsWidget
  | QuickLinksWidget
  | NotificationsWidget;

interface DashboardDataPayload {
  branchId: string;
  branchName?: string;
  dashboardType: DashboardType;
  generatedAt: string;
  widgets?: DashboardWidget[];
  // Explicit widget fields also exist, but 'widgets' union is more flexible for testing all
}

interface UserDashboardPreferencePayload {
  id: string;
  userId: string;
  branchId: string;
  dashboardType: DashboardType;
  layoutConfig: Record<string, any>; // GraphQLJSON
  createdAt: string;
  updatedAt: string;
}

// For the login mutation to get Super Admin token
interface LoginData {
  login: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      userBranches?: Array<{
        branchId: string;
        branch?: { id: string; name: string };
      }>;
    };
  };
}

describe('DashboardResolver (e2e) - /graphql', () => {
  let app: INestApplication;
  let httpServer: Server;
  let accessToken: string;
  let branchId: string; // To be populated from Super Admin's userBranches
  const graphqlEndpoint = '/graphql';

  const superAdminCredentials = {
    email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@churchsystem.org',
    password: process.env.SUPER_ADMIN_PASSWORD || 'Password123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    httpServer = app.getHttpServer();

    // Login as Super Admin to get access token and branchId
    const loginMutation = `
      mutation Login($input: SignInDto!) {
        login(input: $input) {
          accessToken
          user {
            id
            email
            userBranches {
              branchId
              branch { id name }
            }
          }
        }
      }
    `;
    const loginResponse = await request(httpServer)
      .post(graphqlEndpoint)
      .send({
        query: loginMutation,
        variables: { input: superAdminCredentials },
      });

    const loginBody = loginResponse.body as GraphQLResponse<LoginData>;
    expect(loginBody.errors).toBeUndefined();
    expect(loginBody.data?.login.accessToken).toBeDefined();
    accessToken = loginBody.data!.login.accessToken;

    // Get the first branchId from the super admin's userBranches
    const firstUserBranch = loginBody.data?.login.user.userBranches?.[0];
    expect(firstUserBranch?.branchId).toBeDefined();
    branchId = firstUserBranch!.branchId;
    console.log(`Using branchId for dashboard tests: ${branchId}`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Query: dashboardData', () => {
    it('should fetch dashboard data for a given branch and type', async () => {
      const dashboardQuery = `
        query GetDashboard($branchId: ID!, $dashboardType: DashboardType!) {
          dashboardData(branchId: $branchId, dashboardType: $dashboardType) {
            branchId
            branchName
            dashboardType
            generatedAt
            widgets {
              __typename
              ... on KpiCard { title value widgetType }
              ... on ChartData { title chartType widgetType }
              # Add more specific widget fields as needed for assertions
            }
          }
        }
      `;

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: dashboardQuery,
          variables: {
            branchId: branchId,
            dashboardType: DashboardType.ADMIN, // Example type
          },
        });

      const body = response.body as GraphQLResponse<{
        dashboardData: DashboardDataPayload;
      }>;
      expect(response.status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.dashboardData).toBeDefined();
      expect(body.data?.dashboardData.branchId).toEqual(branchId);
      expect(body.data?.dashboardData.dashboardType).toEqual(
        DashboardType.ADMIN,
      );
      expect(body.data?.dashboardData.widgets).toBeInstanceOf(Array);
    });

    it('should return an error if branchId is invalid or user lacks permission (handled by guards)', async () => {
      // This test assumes guards correctly deny access for invalid scenarios.
      // We're testing a case where the query itself is valid but data access might be restricted.
      const dashboardQuery = `
        query GetDashboard($branchId: ID!, $dashboardType: DashboardType!) {
          dashboardData(branchId: $branchId, dashboardType: $dashboardType) {
            branchId
          }
        }
      `;
      const invalidBranchId = '00000000-0000-0000-0000-000000000000'; // A likely non-existent UUID

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: dashboardQuery,
          variables: {
            branchId: invalidBranchId,
            dashboardType: DashboardType.ADMIN,
          },
        });
      const body = response.body as GraphQLResponse<{
        dashboardData: DashboardDataPayload;
      }>;
      // Depending on implementation, this might be a GraphQL error or null data with an error in the errors array.
      // If service throws NotFoundException, it becomes a GraphQL error.
      expect(response.status).toBe(200); // GraphQL itself returns 200
      expect(body.errors).toBeDefined();
      // Example: expect(body.errors?.[0].message).toContain('Cannot read properties of null'); or similar based on actual error
      // Or if it returns null data: expect(body.data?.dashboardData).toBeNull();
      // For now, just check errors are defined, specific message depends on service layer error handling for not found branch.
    });
  });

  describe('Query: userDashboardPreference', () => {
    it('should fetch user dashboard preferences', async () => {
      const preferenceQuery = `
        query GetUserPrefs($branchId: ID!, $dashboardType: DashboardType!) {
          userDashboardPreference(branchId: $branchId, dashboardType: $dashboardType) {
            id
            userId
            branchId
            dashboardType
            layoutConfig
          }
        }
      `;
      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: preferenceQuery,
          variables: {
            branchId: branchId,
            dashboardType: DashboardType.ADMIN,
          },
        });

      const body = response.body as GraphQLResponse<{
        userDashboardPreference: UserDashboardPreferencePayload | null;
      }>;
      expect(response.status).toBe(200);
      expect(body.errors).toBeUndefined();
      // It can be null if no preference is set, which is a valid state
      if (body.data?.userDashboardPreference) {
        expect(body.data.userDashboardPreference.branchId).toEqual(branchId);
        expect(body.data.userDashboardPreference.dashboardType).toEqual(
          DashboardType.ADMIN,
        );
      }
    });
  });

  describe('Mutation: saveUserDashboardPreference', () => {
    it('should save user dashboard preferences', async () => {
      const savePreferenceMutation = `
        mutation SaveUserPrefs($branchId: ID!, $dashboardType: DashboardType!, $layoutConfig: JSON!) {
          saveUserDashboardPreference(branchId: $branchId, dashboardType: $dashboardType, layoutConfig: $layoutConfig) {
            id
            userId
            branchId
            dashboardType
            layoutConfig
            updatedAt
          }
        }
      `;
      const testLayoutConfig = {
        version: 1,
        layout: [{ widget: 'kpi', x: 0, y: 0 }],
      };

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: savePreferenceMutation,
          variables: {
            branchId: branchId,
            dashboardType: DashboardType.ADMIN,
            layoutConfig: testLayoutConfig,
          },
        });

      const body = response.body as GraphQLResponse<{
        saveUserDashboardPreference: UserDashboardPreferencePayload;
      }>;
      expect(response.status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.saveUserDashboardPreference).toBeDefined();
      expect(body.data?.saveUserDashboardPreference.branchId).toEqual(branchId);
      expect(body.data?.saveUserDashboardPreference.dashboardType).toEqual(
        DashboardType.ADMIN,
      );
      expect(body.data?.saveUserDashboardPreference.layoutConfig).toEqual(
        testLayoutConfig,
      );
    });
  });
});
