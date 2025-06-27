# Dashboard Module (`dashboard.md`)

## 1. Overview

The Dashboard module provides users with a personalized, at-a-glance overview of key information, metrics, pending tasks, and relevant updates from across the Church Management System. Dashboards are typically role-based and customizable to suit the needs of different users (e.g., pastors, administrators, group leaders, members).

Dashboard content is usually contextualized to the user's branch and role.

## 2. Core Responsibilities

-   **Data Aggregation & Summarization**: Pulling key data points from various modules (e.g., attendance, giving, upcoming events, pending tasks).
-   **Widget-Based Display**: Presenting information in configurable widgets or cards.
-   **Role-Specific Views**: Offering different dashboard layouts and information for different user roles.
-   **Key Performance Indicators (KPIs)**: Displaying important metrics relevant to the user's responsibilities (e.g., weekly attendance for a pastor, new members for an outreach coordinator, upcoming tasks for a volunteer).
-   **Quick Actions**: Providing shortcuts to common tasks or frequently accessed areas of the system.
-   **Alerts & Notifications Summary**: Displaying recent important notifications or alerts.
-   **Customization**: Allowing users (or administrators for roles) to customize their dashboard layout and the widgets displayed.

## 3. Key Elements & Widgets (Examples)

*(This module primarily focuses on presenting data from other modules. It doesn't usually have its own core data entities beyond user preferences for dashboard layout.)*

**Potential Dashboard Widgets:**
-   **Today's/This Week's Events**: List of upcoming events.
-   **Attendance Snapshot**: Quick view of recent attendance figures (e.g., last Sunday's attendance vs. average).
-   **Giving Summary**: Recent giving totals or trends (for authorized roles).
-   **My Tasks/Assignments**: List of pending tasks, follow-ups, or volunteer assignments.
-   **Recent Prayer Requests**: (For prayer teams or pastors, respecting confidentiality).
-   **New Members/Visitors**: (For welcome teams or pastors).
-   **My Groups**: Quick links to small groups the user is part of or leads.
-   **System Announcements**: Important messages from administrators.
-   **Quick Links**: Links to frequently used features.
-   **Birthday/Anniversary Reminders**: (For staff or group leaders).

```typescript
// Example Placeholder for User Dashboard Preferences
model UserDashboardPreference {
  id          String    @id @default(cuid())
  userId      String    @unique
  // user     User      @relation(fields: [userId], references: [id])
  branchId    String    // Context of the dashboard (user might have different dashboards per branch role)
  // branch   Branch    @relation(fields: [branchId], references: [id])
  layoutConfig Json     // Stores the arrangement and visibility of widgets
  // e.g., { widgets: [{id: "upcomingEvents", order: 1, visible: true}, {id: "givingSummary", order: 2, size: "half"}] }
  updatedAt   DateTime  @updatedAt
}
```

## 4. Core Functionalities & Use Cases

-   A pastor logs in and sees a dashboard with this week's service attendance, recent giving, and a list of new visitor follow-ups assigned to them.
-   A small group leader's dashboard shows upcoming meetings for their group, member birthdays, and any unread messages from group members.
-   A finance administrator sees a dashboard with key financial metrics, pending contribution batches, and budget alerts.
-   A general member might see upcoming events they're registered for, their giving history, and links to their small groups.

## 5. API Endpoints

*(Detail the relevant GraphQL queries. These queries will likely aggregate data from multiple services/resolvers.)*

### GraphQL (Example)

**Queries:**
-   `dashboardData(branchId: ID!, roleContext: String): Dashboard`
    -   `Dashboard` type would be a composite object containing data for various widgets, tailored by `roleContext` or inferred from user's roles.
    -   Example `Dashboard` structure:
        ```graphql
        type Dashboard {
          upcomingEvents: [Event!]!
          attendanceSummary: AttendanceSummaryData
          givingSummary: GivingSummaryData # (null if not authorized)
          myTasks: [Task!]!
          systemAnnouncements: [Announcement!]!
          # ... other widget data fields
        }
        ```
-   `userDashboardPreference(userId: ID!, branchId: ID!): UserDashboardPreference`

**Mutations:**
-   `saveUserDashboardPreference(userId: ID!, branchId: ID!, layoutConfig: Json!): UserDashboardPreference`

## 6. Integration with Other Modules

-   **All Modules**: The dashboard module reads and summarizes data from nearly every other module in the system to provide a holistic view.
-   **Authentication & User Management**: Determines user roles, which dictates the dashboard content and layout.
-   **Reporting & Analytics**: May leverage some reporting queries or present summarized report data.
-   **Branch Management**: Dashboard data is scoped by branch.

## 7. Security Considerations

-   **Data Segregation**: Strictly ensuring that users only see data they are authorized to access based on their role and branch assignments.
-   **Performance**: Dashboard queries can be complex and data-intensive. Optimization is key to ensure fast load times.
-   Protecting sensitive summaries (e.g., financial data) from unauthorized access.

## 8. Future Considerations

-   User-configurable dashboards with a drag-and-drop interface for widgets.
-   AI-powered insights or recommendations on the dashboard.
-   Push notifications for critical dashboard updates.
-   Exportable dashboard views (e.g., PDF summary).
 