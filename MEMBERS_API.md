# Member Management GraphQL API

This document outlines the GraphQL queries and mutations available for managing members and their participation in groups within the church management system.

## Core Member Operations

These operations are primarily handled by the `MembersResolver`.

### Queries

1.  **`members(skip: Int, take: Int): [Member]`**
    *   Description: Retrieves a paginated list of all members.
    *   Arguments:
        *   `skip` (Int, optional, default: 0): Number of records to skip for pagination.
        *   `take` (Int, optional, default: 10): Number of records to take for pagination.
    *   Returns: An array of `Member` objects.

2.  **`member(id: String!): Member`**
    *   Description: Retrieves a single member by their unique ID.
    *   Arguments:
        *   `id` (String!): The unique identifier of the member.
    *   Returns: A `Member` object.

3.  **`membersCount: Int`**
    *   Description: Retrieves the total count of all members.
    *   Returns: An integer representing the total number of members.

### Mutations

1.  **`createMember(createMemberInput: CreateMemberInput!): Member`**
    *   Description: Creates a new member in the system.
    *   Arguments:
        *   `createMemberInput` (CreateMemberInput!): An object containing the details for the new member.
    *   Returns: The newly created `Member` object.

2.  **`updateMember(id: String!, updateMemberInput: UpdateMemberInput!): Member`**
    *   Description: Updates the details of an existing member.
    *   Arguments:
        *   `id` (String!): The ID of the member to update.
        *   `updateMemberInput` (UpdateMemberInput!): An object containing the fields to update.
    *   Returns: The updated `Member` object.

3.  **`removeMember(id: String!): Boolean`**
    *   Description: Removes a member from the system. This is typically a soft delete.
    *   Arguments:
        *   `id` (String!): The ID of the member to remove.
    *   Returns: `true` if successful, `false` otherwise.

4.  **`transferMember(id: String!, fromBranchId: String!, toBranchId: String!, reason: String): Member`**
    *   Description: Transfers a member from one branch to another.
    *   Arguments:
        *   `id` (String!): The ID of the member to transfer.
        *   `fromBranchId` (String!): The ID of the branch the member is currently in.
        *   `toBranchId` (String!): The ID of the branch to transfer the member to.
        *   `reason` (String, optional): The reason for the transfer.
    *   Returns: The updated `Member` object reflecting the transfer.

5.  **`addMemberToBranch(memberId: String!, branchId: String!): Member`**
    *   Description: Associates an existing member with an additional branch.
    *   Arguments:
        *   `memberId` (String!): The ID of the member.
        *   `branchId` (String!): The ID of the branch to add the member to.
    *   Returns: The updated `Member` object.

6.  **`removeMemberFromBranch(memberId: String!, branchId: String!): Member`**
    *   Description: Removes a member's association from a specific branch.
    *   Arguments:
        *   `memberId` (String!): The ID of the member.
        *   `branchId` (String!): The ID of the branch to remove the member from.
    *   Returns: The updated `Member` object.

7.  **`updateMemberStatus(id: String!, status: MemberStatus!, reason: String): Member`**
    *   Description: Updates the status of a member (e.g., Active, Inactive, Suspended).
    *   Arguments:
        *   `id` (String!): The ID of the member whose status is to be updated.
        *   `status` (MemberStatus!): The new status for the member.
        *   `reason` (String, optional): The reason for the status change.
    *   Returns: The updated `Member` object.

## Group & Ministry Membership Operations

These operations are primarily handled by the `GroupMembersResolver` and concern a member's involvement in ministries or small groups.

### Queries

1.  **`groupMembers(filters: GroupMemberFilterInput): [GroupMember]`**
    *   Description: Retrieves a list of group membership records, optionally filtered (e.g., by group ID, member ID).
    *   Arguments:
        *   `filters` (GroupMemberFilterInput, optional): Criteria to filter the group members.
    *   Returns: An array of `GroupMember` objects, representing the link between a member and a group.

2.  **`groupMember(id: ID!): GroupMember`**
    *   Description: Retrieves a specific group membership record by its unique ID. Note: This ID is for the membership record itself, not the member's or group's ID.
    *   Arguments:
        *   `id` (ID!): The unique identifier of the group membership record.
    *   Returns: A `GroupMember` object.

### Mutations

1.  **`addMemberToGroup(groupId: ID!, memberId: ID!, roleInGroup: String): GroupMember`**
    *   Description: Adds a member to a specific group (ministry or small group) with an optional role.
    *   Arguments:
        *   `groupId` (ID!): The ID of the group (ministry or small group) to add the member to.
        *   `memberId` (ID!): The ID of the member to add.
        *   `roleInGroup` (String, optional): The role of the member within the group (e.g., "Leader", "Participant").
    *   Returns: The created `GroupMember` object representing the new membership.

2.  **`updateGroupMember(id: ID!, input: UpdateGroupMemberInput!): GroupMember`**
    *   Description: Updates details of a member's participation in a group, such as their role or status within the group.
    *   Arguments:
        *   `id` (ID!): The ID of the `GroupMember` record (the link between member and group) to update.
        *   `input` (UpdateGroupMemberInput!): An object containing the fields to update (e.g., role, status).
    *   Returns: The updated `GroupMember` object.

3.  **`removeMemberFromGroup(groupId: ID!, memberId: ID!): Boolean`**
    *   Description: Removes a member from a specific group.
    *   Arguments:
        *   `groupId` (ID!): The ID of the group from which to remove the member.
        *   `memberId` (ID!): The ID of the member to remove.
    *   Returns: `true` if successful, `false` otherwise.

4.  **`assignGroupLeader(groupId: ID!, memberId: ID!): GroupMember`**
    *   Description: Assigns a member as a leader of a specific group. This likely updates the member's role within that group.
    *   Arguments:
        *   `groupId` (ID!): The ID of the group.
        *   `memberId` (ID!): The ID of the member to be assigned as leader.
    *   Returns: The updated `GroupMember` object reflecting the leadership change.

---

*Note: `CreateMemberInput`, `UpdateMemberInput`, `MemberStatus`, `GroupMemberFilterInput`, `UpdateGroupMemberInput`, `Member`, and `GroupMember` are GraphQL types defined elsewhere in the schema. Refer to the schema definitions for their specific fields.*
