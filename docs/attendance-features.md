# New Attendance Module Features

## 1. Attendance Statistics

The attendance statistics feature provides comprehensive metrics about church attendance patterns over configurable time periods. These statistics help church leadership make data-driven decisions about ministry planning and resource allocation.

### Available Statistics Types

- **Total Attendance**: Counts all attendees (members and visitors) for each period
- **Unique Members**: Counts distinct members who attended in each period
- **Visitors**: Counts non-member attendees for each period
- **First-Time Visitors**: Identifies first-time visitors in each period
- **Growth Rate**: Calculates attendance growth compared to previous periods
- **Retention Rate**: Measures the percentage of members who continue attending

### Period Groupings

Statistics can be grouped by different time periods:
- Daily
- Weekly
- Monthly
- Quarterly
- Yearly

### GraphQL API

#### Query

```graphql
query GetAttendanceStats($input: AttendanceStatsInput!) {
  attendanceStats(input: $input) {
    branchId
    TOTAL_ATTENDANCE {
      period
      total
    }
    UNIQUE_MEMBERS {
      period
      unique_members
    }
    VISITORS {
      period
      visitors
    }
    # Other stat types as needed
  }
}
```

#### Input Parameters

```graphql
input AttendanceStatsInput {
  branchId: String!
  sessionTypeId: String
  startDate: DateTime!
  endDate: DateTime!
  period: AttendanceStatsPeriod = WEEKLY
  statsTypes: [AttendanceStatsType!] = [TOTAL_ATTENDANCE]
}

enum AttendanceStatsPeriod {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}

enum AttendanceStatsType {
  TOTAL_ATTENDANCE
  UNIQUE_MEMBERS
  VISITORS
  FIRST_TIME_VISITORS
  GROWTH_RATE
  RETENTION_RATE
}
```

## 2. Absence Alerts

The absence alerts feature helps churches maintain connection with members who haven't attended in a specified period. This proactive approach to member care can improve retention and demonstrate pastoral concern.

### Features

- **Configurable Absence Threshold**: Set the number of days after which a member is considered absent
- **Member Identification**: Find members who haven't attended in the specified period
- **Alert Generation**: Generate alerts for absent members
- **Notification Options**: Configure email and/or SMS notifications
- **Scheduled Checks**: Schedule regular absence checks (foundation for automation)

### GraphQL API

#### Queries

```graphql
# Find members who haven't attended in the specified period
query FindAbsentMembers($config: AbsenceAlertConfigInput!) {
  findAbsentMembers(config: $config) {
    success
    count
    members {
      id
      firstName
      lastName
      email
      phone
      lastAttendance
    }
  }
}
```

#### Mutations

```graphql
# Generate alerts for absent members
mutation GenerateAbsenceAlerts($config: AbsenceAlertConfigInput!) {
  generateAbsenceAlerts(config: $config) {
    success
    count
    members {
      id
      firstName
      lastName
      email
      phone
      lastAttendance
    }
  }
}

# Schedule regular absence checks (for automation)
mutation ScheduleAbsenceCheck($config: AbsenceAlertConfigInput!) {
  scheduleAbsenceCheck(config: $config) {
    success
    count
  }
}
```

#### Input Parameters

```graphql
input AbsenceAlertConfigInput {
  branchId: String!
  absenceThresholdDays: Int!
  sendEmailAlerts: Boolean = true
  sendSmsAlerts: Boolean = false
}
```

## 3. Implementation Details

### Service Architecture

The new features are implemented using two main services:

1. **AttendanceStatsService**: Handles generation of attendance statistics
   - Uses raw SQL queries for complex aggregations
   - Supports multiple statistics types and period groupings
   - Returns structured data for GraphQL responses

2. **AttendanceAlertsService**: Manages absence detection and alerts
   - Identifies members absent beyond the threshold
   - Generates alerts with configurable notification channels
   - Provides foundation for scheduled absence checks

### Database Queries

The implementation uses optimized SQL queries to efficiently process attendance data:

- For statistics, we use period-based grouping with PostgreSQL's `TO_CHAR` function
- For absence detection, we use subqueries to find the most recent attendance date for each member

### Future Enhancements

1. **Real Notification Integration**:
   - Integrate with email service provider (SendGrid, Mailgun, etc.)
   - Integrate with SMS service provider (Twilio, Vonage, etc.)

2. **Automated Scheduling**:
   - Implement NestJS scheduled tasks for regular absence checks
   - Allow configuration of check frequency and timing

3. **Enhanced Analytics**:
   - Implement more sophisticated growth and retention rate calculations
   - Add demographic breakdowns of attendance patterns
   - Provide predictive analytics for future attendance trends

4. **UI Integration**:
   - Create dashboard visualizations for attendance statistics
   - Build member care workflow for following up with absent members
