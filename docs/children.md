# Children's Ministry Module (`children.md`)

## 1. Overview

The Children's Ministry module is specifically designed to support the unique needs of managing children's programs within the church. This includes secure check-in/check-out, class management, allergy and medical information tracking, and communication with parents/guardians.

This module is highly branch-specific, as children's programs are typically run independently at each location.

## 2. Core Responsibilities

-   **Secure Child Check-in/Check-out**: Providing a robust system for parents/guardians to check children into and out of classes or events, often involving security tags or codes.
-   **Family Management**: Linking children to their parents/guardians (from the Member module).
-   **Class & Roster Management**: Organizing children into age-appropriate classes or groups and managing rosters.
-   **Allergy & Medical Information**: Securely storing and making accessible important allergy, medical, and emergency contact information for each child to authorized personnel.
-   **Attendance Tracking**: Recording attendance for children's ministry classes and activities (integrates with or specializes the main Attendance module).
-   **Volunteer Management (Specific to Children's Ministry)**: Managing volunteers who work with children, including tracking certifications (e.g., background checks, child safety training) – integrates with Volunteer module.
-   **Parent Communication**: Tools for communicating with parents/guardians regarding their children (e.g., alerts, updates, class information).

## 3. Key Entities & Data Models

*(Detail the Prisma/TypeORM entities or database schema here. Child profiles might be a specialized version of Member, or a related entity. Focus on `ChildCheckIn`, `ChildClass`, `MedicalInfo`, `GuardianAssignment`.)*

```typescript
// Example Placeholder Schema
// Child information might be part of the Member model with a 'child' role or specific fields.
// Alternatively, a dedicated ChildProfile model if significantly different.

// Assuming Member model has a way to identify children and link to guardians (parents).
model ChildClass {
  id          String    @id @default(cuid())
  name        String    // e.g., "Nursery (0-2 years)", "Preschool (3-5 years)"
  ageMin      Int?
  ageMax      Int?
  gradeMin    String?   // e.g., K, 1st
  gradeMax    String?
  roomNumber  String?
  // teacherId String?   // Link to User/Member (Volunteer/Staff)
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  // checkIns ChildCheckIn[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Medical/Allergy info might be stored as a related entity to Member (if child is a Member)
model ChildMedicalInfo {
  id             String    @id @default(cuid())
  childMemberId  String    @unique // Link to the Member record of the child
  // childMember Member    @relation(fields: [childMemberId], references: [id])
  allergies      String[]  // List of known allergies
  medications    String[]  // List of medications
  medicalNotes   String?
  emergencyContactName String?
  emergencyContactPhone String?
  branchId       String
  // branch      Branch    @relation(fields: [branchId], references: [id])
  updatedAt      DateTime  @updatedAt
}

model ChildCheckIn {
  id              String    @id @default(cuid())
  childMemberId   String    // Link to the Member record of the child
  // childMember  Member    @relation(fields: [childMemberId], references: [id])
  classId         String?   // Link to ChildClass
  // childClass   ChildClass? @relation(fields: [classId], references: [id])
  // eventId      String?   // Link to Event if it's a special event check-in
  checkedInById   String    // UserId or MemberId of guardian who checked in
  // checkedInBy  User      @relation(name: "GuardianCheckIn", fields: [checkedInById], references: [id])
  checkInTime     DateTime  @default(now())
  checkedOutById  String?   // UserId or MemberId of guardian who checked out
  // checkedOutBy User?     @relation(name: "GuardianCheckOut", fields: [checkedOutById], references: [id])
  checkOutTime    DateTime?
  securityCode    String    @unique // Unique code for matching parent/child at pick-up
  notes           String?   // e.g., "Child was upset at drop-off"
  branchId        String
  // branch       Branch    @relation(fields: [branchId], references: [id])
  createdAt       DateTime  @default(now())
}
```

## 4. Core Functionalities & Use Cases

-   Parent checks in their two children at a self-service kiosk, receiving printed security tags.
-   Teacher views a list of children checked into their class, along with any allergy information.
-   At pick-up, parent presents their security tag, which is matched by the teacher before releasing the child.
-   Admin updates a child's medical information after being notified by a parent.
-   Children's ministry director assigns volunteers to different classrooms for Sunday service.
-   System sends an SMS to a parent if their child needs attention during the service.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here.)*

### GraphQL (Example)

**Queries:**
-   `childClasses(branchId: ID!): [ChildClass!]`
-   `childMedicalInfo(childMemberId: ID!): ChildMedicalInfo`
-   `activeCheckIns(branchId: ID!, classId: ID): [ChildCheckIn!]` // Children currently checked in
-   `childCheckInHistory(childMemberId: ID!, dateRange: DateRangeInput): [ChildCheckIn!]`

**Mutations:**
-   `checkInChildren(input: CheckInChildrenInput!): [ChildCheckIn!]` // Input includes parentId, childIds, classId
-   `checkOutChild(checkInId: ID!, guardianId: ID!, securityCode: String!): ChildCheckIn`
-   `updateChildMedicalInfo(childMemberId: ID!, input: UpdateMedicalInfoInput!): ChildMedicalInfo`
-   `createChildClass(input: CreateChildClassInput!): ChildClass`
-   `assignChildToClass(childMemberId: ID!, classId: ID!): Boolean` // For pre-assignment
-   `sendParentAlert(childMemberId: ID!, message: String!): Boolean`

## 6. Integration with Other Modules

-   **Member Management**: Essential for parent/guardian and child profiles, family relationships.
-   **Attendance Tracking**: Specializes attendance for children, focusing on security.
-   **Volunteer Management**: For managing and scheduling children's ministry volunteers, including background checks and training status.
-   **Event & Calendar Management**: Children's programs may be tied to specific church events or services.
-   **Communication Tools**: For parent alerts and communication.
-   **Branch Management**: All children's ministry operations are branch-specific.

## 7. Security Considerations

-   **Child Safety**: Paramount. Secure check-in/check-out procedures are critical.
-   **Data Privacy**: Protecting sensitive information about children, including medical data and attendance records.
-   **Access Control**: Strict limits on who can view children's data (e.g., only authorized teachers, parents/guardians for their own children).
-   Compliance with child protection laws and policies (e.g., background checks for volunteers).

## 8. Future Considerations

-   Mobile app for parents for check-in/check-out and receiving alerts.
-   Curriculum management for children's classes.
-   Tracking developmental milestones or prayer requests specific to children.
-   Integration with photo/video consent forms.
