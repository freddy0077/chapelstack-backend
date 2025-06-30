// Usage: node scripts/test-super-admin-dashboard.js [organisationId]
const fetch = require('node-fetch');

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3003/graphql';
const ORGANISATION_ID = process.argv[2]; // optional

const SUPER_ADMIN_EMAIL = 'super_admin@chapelstack.com';
const SUPER_ADMIN_PASSWORD = 'password';

async function getAuthToken() {
  const loginQuery = `
    mutation Login($input: SignInDto!) {
      login(input: $input) {
        accessToken
      }
    }
  `;
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: loginQuery,
      variables: { input: { email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD } },
    }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error('Login failed: ' + JSON.stringify(json.errors));
  }
  return json.data.login.accessToken;
}

const dashboardQuery = `
  query SuperAdminDashboardData($organisationId: ID) {
    superAdminDashboardData(organisationId: $organisationId) {
      organisationOverview { total organisations { id name branchCount adminCount } }
      branchesSummary { total branches { id name organisation status } }
      memberSummary { total }
      financialOverview { totalContributions }
      attendanceOverview { totalAttendance }
      sacramentsOverview { totalSacraments }
      activityEngagement {
        recentEvents { id title startDate }
        upcomingEvents { id title startDate }
      }
      systemHealth {
        timestamp
        database { status latency }
        system { platform nodeVersion totalMemory freeMemory }
      }
      announcements { announcements { id title startDate } }
    }
  }
`;

const variables = ORGANISATION_ID ? { organisationId: ORGANISATION_ID } : {};

(async () => {
  try {
    const token = await getAuthToken();
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: dashboardQuery, variables }),
    });
    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      process.exit(1);
    }
    console.log('Super Admin Dashboard Data:', JSON.stringify(json.data.superAdminDashboardData, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
