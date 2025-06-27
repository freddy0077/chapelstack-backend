# Ministry & Small Group Management Module (`ministries.md`)

## 1. Overview

The Ministry & Small Group Management module enables churches to organize, manage, and facilitate the activities of their various ministries and small groups. This includes managing group memberships, leadership roles, scheduling meetings, and communication within groups.

All ministry and group data is scoped to a specific church branch.

## 2. Core Responsibilities

-   **Ministry/Group Creation**: Allowing authorized staff to define new ministries or small groups (e.g., Youth Ministry, Women's Bible Study, Welcome Team).
-   **Membership Management**: Tracking members who belong to each ministry or group.
-   **Leadership Assignment**: Assigning leaders (e.g., ministry heads, small group facilitators) to oversee groups.
-   **Meeting & Event Scheduling**: Facilitating the scheduling of group meetings or ministry-specific events (often integrates with the main Event module).
-   **Communication Tools**: Providing mechanisms for leaders to communicate with their group members (e.g., sending emails, notifications).
-   **Resource Sharing**: Allowing groups to share documents, links, or other resources.
-   **Attendance Tracking**: Recording attendance for group meetings or ministry activities (integrates with Attendance module).

## 3. Key Entities & Data Models

*(Detail the Prisma/TypeORM entities or database schema here. Include entities like `Ministry`, `SmallGroup`, `GroupMember`, `MinistryRole`, etc.)*

```typescript
// Example Placeholder Schema
model Ministry {
  id          String    @id @default(cuid())
  name        String
  description String?
  leaderId    String?   // Link to a User or Member acting as leader
  // leader   User?     @relation(fields: [leaderId], references: [id])
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  // smallGroups SmallGroup[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model SmallGroup {
  id          String    @id @default(cuid())
  name        String
  description String?
  ministryId  String?   // Optional: if the small group belongs to a larger ministry
  // ministry Ministry? @relation(fields: [ministryId], references: [id])
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  members     GroupMember[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model GroupMember {
  id          String    @id @default(cuid())
  groupId     String
  // group    SmallGroup @relation(fields: [groupId], references: [id])
  memberId    String
  // member   Member    @relation(fields: [memberId], references: [id])
  roleInGroup String    // e.g., LEADER, MEMBER, ASSISTANT_LEADER
  joinedAt    DateTime  @default(now())
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([groupId, memberId])
}
```

## 4. Core Functionalities & Use Cases

-   Staff creates a new "Youth Ministry".
-   A member joins a "Wednesday Bible Study" small group.
-   A small group leader sends a message to all their group members.
-   Admin views a list of all small groups within a specific branch.
-   A ministry leader schedules a recurring meeting for their team.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here.)*

### GraphQL (Example)

**Queries:**
-   `ministry(id: ID!): Ministry`
-   `ministries(branchId: ID!, filter: MinistryFilterInput): [Ministry!]`
-   `smallGroup(id: ID!): SmallGroup`
-   `smallGroups(branchId: ID!, filter: SmallGroupFilterInput): [SmallGroup!]`
-   `groupMembers(groupId: ID!): [GroupMember!]`

**Mutations:**
-   `createMinistry(input: CreateMinistryInput!): Ministry`
-   `updateMinistry(id: ID!, input: UpdateMinistryInput!): Ministry`
-   `createSmallGroup(input: CreateSmallGroupInput!): SmallGroup`
-   `updateSmallGroup(id: ID!, input: UpdateSmallGroupInput!): SmallGroup`
-   `addMemberToGroup(groupId: ID!, memberId: ID!, roleInGroup: String): GroupMember`
-   `removeMemberFromGroup(groupId: ID!, memberId: ID!): Boolean`
-   `assignGroupLeader(groupId: ID!, memberId: ID!): GroupMember`

## 6. Integration with Other Modules

-   **Member Management**: Links members to groups and ministries.
-   **Event & Calendar Management**: For scheduling group meetings and ministry events.
-   **Attendance Tracking**: To record attendance for group activities.
-   **Communication Tools**: To facilitate communication within groups.
-   **Authentication & User Management**: Group leaders may have specific permissions.

## 7. Security Considerations

-   Ensuring only authorized leaders can manage their respective groups/ministries.
-   Privacy of group discussions or shared resources if applicable.
-   Controlling visibility of groups (e.g., some groups might be private or invitation-only).

## 8. Future Considerations

-   Discussion forums or chat features within groups.
-   Curriculum management for study groups.
-   Reporting on group health and engagement.
