# Dashboard Module Implementation

## Overview

The Dashboard module provides users with a personalized, at-a-glance overview of key information, metrics, pending tasks, and relevant updates from across the Church Management System. The implementation is integrated within the Reporting module rather than as a standalone module, but provides all the functionality specified in the requirements.

## Implementation Details

### Database Schema

The Dashboard module uses the following Prisma model:

```prisma
model UserDashboardPreference {
  id           String    @id @default(uuid())
  userId       String
  branchId     String
  dashboardType String    // Corresponds to DashboardType enum
  layoutConfig Json      // Stores the arrangement and visibility of widgets
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  // Relations
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  branch       Branch    @relation(fields: [branchId], references: [id], onDelete: Cascade)
  
  @@unique([userId, branchId, dashboardType])
  @@index([userId])
  @@index([branchId])
}
```

### Key Components

1. **Entities**:
   - `DashboardData`: Main container for dashboard content
   - `UserDashboardPreference`: Stores user customization preferences
   - Widget entities: `KpiCard`, `ChartData`, `UpcomingEventsWidget`, `TasksWidget`, etc.

2. **Enums**:
   - `DashboardType`: Defines different dashboard types (PASTORAL, ADMIN, FINANCE, MINISTRY, MEMBER)
   - `WidgetType`: Defines available widget types (KPI_CARD, CHART, UPCOMING_EVENTS, etc.)

3. **Resolver**:
   - `DashboardResolver`: Handles GraphQL queries and mutations for dashboard data

4. **Service**:
   - `DashboardService`: Business logic for generating dashboard data and managing preferences

### GraphQL API

This section outlines the GraphQL queries and mutations available for interacting with the dashboard feature. All operations require authentication and appropriate permissions.

#### Queries

1.  **`dashboardData(branchId: ID!, dashboardType: DashboardType!): DashboardData`**
    *   **Description**: Fetches the main data for a specific dashboard. This includes all the necessary information to render the widgets for the given dashboard type and branch.
    *   **Arguments**:
        *   `branchId: ID!`: The unique identifier of the branch for which to fetch dashboard data.
        *   `dashboardType: DashboardType!`: The type of dashboard to retrieve (e.g., `PASTORAL`, `ADMIN`, `FINANCE`, `MINISTRY`, `MEMBER`).
    *   **Returns**: `DashboardData` - An object containing the widgets and their corresponding data for the specified dashboard.
    *   **Permissions**: Requires the user to have 'view' permission on the 'dashboard' subject.
    *   **Example Usage**:
        ```graphql
        query GetPastoralDashboard($branchId: ID!) {
          dashboardData(branchId: $branchId, dashboardType: PASTORAL) {
            branchId
            branchName
            dashboardType
            generatedAt
            widgets {
              __typename # Useful to know which type of widget it is
              ... on KpiCard {
                widgetType
                title
                value
                percentChange
                icon
              }
              ... on ChartData {
                widgetType
                title
                chartType
                data # This is JSON
              }
              ... on UpcomingEventsWidget {
                widgetType
                title
                events {
                  id
                  title
                  startDate
                  endDate
                  location
                  description
                }
              }
              ... on TasksWidget {
                widgetType
                title
                tasks {
                  id
                  title
                  dueDate
                  status
                  priority
                }
              }
              ... on MyGroupsWidget {
                widgetType
                title
                groups {
                  id
                  name
                  type
                  role
                  nextMeeting
                  meetingDay
                  meetingTime
                }
              }
              ... on AnnouncementsWidget {
                widgetType
                title
                announcements {
                  id
                  title
                  content
                  date
                  author
                  priority
                }
              }
              ... on QuickLinksWidget {
                widgetType
                title
                links {
                  title
                  url
                  icon
                }
              }
              ... on NotificationsWidget {
                widgetType
                title
                notifications {
                  id
                  message
                  date
                  type
                  read
                }
              }
              # ... include other widget types from DashboardWidgetUnion as needed
            }
          }
        }
        ```

2.  **`userDashboardPreference(branchId: ID!, dashboardType: DashboardType!): UserDashboardPreference`**
    *   **Description**: Retrieves the current authenticated user's layout preferences for a specific dashboard. This allows users to customize how their dashboard looks (e.g., widget order, visibility).
    *   **Arguments**:
        *   `branchId: ID!`: The unique identifier of the branch.
        *   `dashboardType: DashboardType!`: The type of dashboard.
    *   **Returns**: `UserDashboardPreference` (nullable) - An object containing the user's layout configuration (e.g., as a JSON string or object). Returns `null` if no preference is set for the user, branch, and dashboard type.
    *   **Permissions**: Requires the user to have 'view' permission on the 'dashboard' subject.
    *   **Example Usage**:
        ```graphql
        query GetUserPreferences($branchId: ID!, $dashboardType: DashboardType!) {
          userDashboardPreference(branchId: $branchId, dashboardType: $dashboardType) {
            id
            userId
            branchId
            dashboardType
            layoutConfig # This is a JSON field
            createdAt
            updatedAt
          }
        }
        ```

#### Mutations

1.  **`saveUserDashboardPreference(branchId: ID!, dashboardType: DashboardType!, layoutConfig: JSON!): UserDashboardPreference`**
    *   **Description**: Saves or updates the current authenticated user's layout preferences for a specific dashboard. This allows users to persist their customizations.
    *   **Arguments**:
        *   `branchId: ID!`: The unique identifier of the branch.
        *   `dashboardType: DashboardType!`: The type of dashboard.
        *   `layoutConfig: JSON!`: A JSON object representing the user's desired layout configuration. This could include widget positions, sizes, visibility states, etc.
    *   **Returns**: `UserDashboardPreference` - The saved or updated user dashboard preference object, reflecting the changes.
    *   **Permissions**: Requires the user to have 'update' permission on the 'dashboard' subject.
    *   **Example Usage**:
        ```graphql
        mutation SavePreferences($branchId: ID!, $dashboardType: DashboardType!, $config: JSON!) {
          saveUserDashboardPreference(branchId: $branchId, dashboardType: $dashboardType, layoutConfig: $config) {
            id
            userId
            branchId
            dashboardType
            layoutConfig # The updated layout config
            updatedAt
          }
        }
        ```


### Role-Based Dashboards

The implementation supports different dashboard types based on user roles:

1. **Pastoral Dashboard**: 
   - Focused on member growth, attendance trends, and pastoral care metrics
   - Includes widgets for upcoming events, new members, and prayer requests

2. **Admin Dashboard**:
   - Provides administrative overview of church operations
   - Includes widgets for member statistics, form submissions, and system announcements

3. **Finance Dashboard**:
   - Displays financial metrics, giving trends, and budget status
   - Includes widgets for recent transactions and financial KPIs

4. **Ministry Dashboard**:
   - Shows ministry/group statistics and participation metrics
   - Includes widgets for group attendance and ministry activities

5. **Member Dashboard**:
   - Personalized view for regular church members
   - Includes widgets for their groups, events, and personal giving history

### Widget Types

The implementation includes various widget types:

1. **KPI Cards**: Simple metrics with optional trend indicators
2. **Charts**: Various chart types (bar, line, pie) for data visualization
3. **Upcoming Events**: List of scheduled events
4. **Tasks**: User's pending tasks or assignments
5. **My Groups**: Groups the user belongs to or leads
6. **Announcements**: System or church-wide announcements
7. **Quick Links**: Shortcuts to frequently used features
8. **Notifications**: User-specific notifications

### Customization

Users can customize their dashboards through:

1. **Layout Configuration**: Stored in the `layoutConfig` JSON field
2. **Widget Visibility**: Control which widgets are displayed
3. **Widget Order**: Arrange widgets in preferred order
4. **Widget Size**: Configure widget dimensions (full, half, third, etc.)

### GraphQL API

The module exposes the following GraphQL endpoints:

```graphql
# Queries
dashboardData(branchId: ID!, dashboardType: DashboardType!): DashboardData
userDashboardPreference(branchId: ID!, dashboardType: DashboardType!): UserDashboardPreference

# Mutations
saveUserDashboardPreference(
  branchId: ID!, 
  dashboardType: DashboardType!, 
  layoutConfig: JSON!
): UserDashboardPreference
```

### Security

Access control is implemented using:

1. **Guards**: `GqlAuthGuard` and `PermissionsGuard`
2. **Permission Decorators**: `@RequirePermissions({ action: 'view', subject: 'dashboard' })`
3. **User Context**: Data is filtered based on the current user's permissions and branch context

## Integration with Other Modules

The Dashboard module integrates with various other modules to aggregate and display data:

1. **Member Management**: Member statistics and new member information
2. **Events**: Upcoming events and attendance data
3. **Groups/Ministries**: Group participation and ministry metrics
4. **Financial Management**: Giving trends and financial KPIs
5. **Forms**: Form submission statistics
6. **Communications**: Announcements and notifications

## Usage Examples

### Retrieving Dashboard Data

```typescript
// Example of retrieving dashboard data
const dashboardData = await dashboardService.getDashboardData(
  'branch-123',
  DashboardType.PASTORAL,
  'user-456'
);
```

### Saving User Preferences

```typescript
// Example of saving user dashboard preferences
const preference = await dashboardService.saveUserDashboardPreference(
  'user-456',
  'branch-123',
  DashboardType.PASTORAL,
  {
    widgets: [
      { id: 'upcomingEvents', order: 1, visible: true, size: 'full' },
      { id: 'memberGrowth', order: 2, visible: true, size: 'half' },
      { id: 'attendanceTrend', order: 3, visible: true, size: 'half' }
    ]
  }
);
```

## Future Enhancements

Potential future enhancements include:

1. **Drag-and-Drop Interface**: Client-side implementation for widget arrangement
2. **Custom Widgets**: Allow administrators to create custom widgets
3. **Data Export**: Export dashboard data as PDF or spreadsheet
4. **AI Insights**: Intelligent insights and recommendations based on dashboard data
5. **Mobile Optimization**: Enhanced mobile-specific dashboard layouts
