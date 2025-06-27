# Attendance Tracking Module (`attendance.md`)

## 1. Overview

The Attendance Tracking module is responsible for recording, managing, and reporting attendance for various church activities, including services, events, small groups, and children's ministry programs. It supports different methods of check-in and provides insights into engagement patterns.

This module is branch-specific, meaning all attendance data is associated with a particular church branch.

## 2. Core Responsibilities

-   **Recording Attendance**: Capturing attendance for individuals and families.
-   **Check-in/Check-out System**: Especially for children's ministry, ensuring secure drop-off and pick-up.
-   **Visitor Tracking**: Recording attendance of visitors and facilitating follow-up.
-   **Attendance Reporting**: Generating reports on attendance trends, individual attendance history, and event participation.
-   **Integration with Member Profiles**: Linking attendance records to member profiles.
-   **Multiple Check-in Methods**: Supporting manual entry, self-service kiosks, mobile check-in, and potentially barcode/QR code scanning.

## 3. Key Entities & Data Models

*(Detail the Prisma/TypeORM entities or database schema here. Include entities like `AttendanceSession`, `AttendanceRecord`, `CheckInMethod`, etc.)*

```typescript
// Example Placeholder Schema
model AttendanceSession {
  id          String    @id @default(cuid())
  eventId     String?   // Link to an Event, Service, or Group Meeting
  // event    Event?    @relation(fields: [eventId], references: [id])
  sessionName String    // e.g., "Sunday Morning Service - 2024-07-21"
  sessionDate DateTime
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  records     AttendanceRecord[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model AttendanceRecord {
  id                  String    @id @default(cuid())
  sessionId           String
  // session          AttendanceSession @relation(fields: [sessionId], references: [id])
  memberId            String?
  // member           Member?   @relation(fields: [memberId], references: [id])
  guestName           String?   // For visitors not yet in the system
  checkInTime         DateTime  @default(now())
  checkOutTime        DateTime?
  checkInMethod       String?   // e.g., MANUAL, KIOSK, MOBILE_APP
  notes               String?
  attendedByHeadcount Int?      // For simple headcount vs individual check-ins
  branchId            String
  // branch           Branch    @relation(fields: [branchId], references: [id])
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

## 4. Core Functionalities & Use Cases

-   Staff records attendance for a Sunday service.
-   Parent checks in their child for children's ministry using a kiosk.
-   Small group leader takes attendance for their meeting.
-   Admin generates a report of members who haven't attended in the last month.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here.)*

### GraphQL (Example)

**Queries:**
-   `getAttendanceSession(id: ID!): AttendanceSession`
-   `listAttendanceRecords(sessionId: ID!, filter: AttendanceFilterInput): [AttendanceRecord!]`
-   `memberAttendanceHistory(memberId: ID!): [AttendanceRecord!]`

**Mutations:**
-   `createAttendanceSession(input: CreateAttendanceSessionInput!): AttendanceSession`
-   `recordAttendance(input: RecordAttendanceInput!): AttendanceRecord` // For individual check-in
-   `recordBulkAttendance(input: RecordBulkAttendanceInput!): Boolean` // For headcounts or multiple check-ins
-   `checkOut(recordId: ID!, checkOutTime: DateTime): AttendanceRecord`

## 6. Integration with Other Modules

-   **Member Management**: Links attendance to member profiles.
-   **Event & Calendar Management**: Associates attendance sessions with specific events or services.
-   **Ministry & Small Group Management**: Tracks attendance for group meetings.
-   **Children's Ministry**: Core for check-in/check-out processes.
-   **Reporting & Analytics**: Provides data for attendance reports.

## 7. Security Considerations

-   Protecting children's check-in/check-out data with strict access controls.
-   Ensuring accuracy of attendance records.
-   Privacy of individual attendance history.

## 8. Future Considerations

-   RFID and NFC card scanning for check-in.
-   Automated absence alerts for regular members.
-   Progressive Web App (PWA) for mobile check-in.
