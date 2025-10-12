# Group Membership Trail Demo Seeder

## Overview

This seeder demonstrates the **Group Membership Trail** feature by creating realistic test data showing:
- Active group memberships
- Past group memberships with leave dates and reasons
- Deactivated groups with all members showing proper trails

## What It Creates

### 👥 Members (3)
1. **John Doe** (john.doe@example.com)
2. **Jane Smith** (jane.smith@example.com)
3. **Mike Johnson** (mike.johnson@example.com)

### 🏛️ Ministries (2)
1. **Youth Ministry** - For young people
2. **Worship Ministry** - For worship and music

### 👥 Small Groups (4)
1. **Young Adults Fellowship** (ACTIVE) - Under Youth Ministry
2. **Worship Team** (ACTIVE) - Under Worship Ministry
3. **Morning Prayer Group** (ACTIVE) - Independent
4. **College Students Group** (DEACTIVATED) - Shows group deactivation scenario

### 📝 Group Memberships (9)

#### Active Memberships (3)
- John Doe → Young Adults Fellowship (LEADER)
- Jane Smith → Worship Team (MEMBER)
- Mike Johnson → Morning Prayer Group (CO_LEADER)

#### Past Memberships (6)
- John Doe left Worship Team (May 2024) - "Member requested to leave to focus on youth ministry"
- Jane Smith left Morning Prayer Group (Dec 2023) - "Relocated to another city"
- Mike Johnson left Young Adults Fellowship (Aug 2023) - "Aged out of youth group"
- All 3 members left College Students Group (Jun 2023) - "Group was deactivated"

### 📋 Audit Logs (3)
- Tracks all group membership removals
- Includes metadata with member names, group names, and reasons

## How to Run

### Prerequisites
1. Backend server must be running
2. Database must be accessible
3. At least one branch and organization must exist

### Run the Seeder

```bash
cd chapelstack-backend

# Run the seeder
pnpm run seed:group-trail-demo
```

### Expected Output

```
🌱 Starting Group Membership Trail Demo Seeder...

✅ Using Branch: Main Branch
✅ Using Organisation: Chapel Stack

👥 Creating test members...
  ✓ Created: John Doe
  ✓ Created: Jane Smith
  ✓ Created: Mike Johnson

🏛️  Creating ministries...
  ✓ Created: Youth Ministry
  ✓ Created: Worship Ministry

👥 Creating small groups...
  ✓ Created: Young Adults Fellowship
  ✓ Created: Worship Team
  ✓ Created: Morning Prayer Group

📝 Scenario 1: Creating ACTIVE memberships...
  ✓ John joined Young Adults Fellowship as LEADER
  ✓ Jane joined Worship Team as MEMBER
  ✓ Mike joined Morning Prayer Group as CO_LEADER

📝 Scenario 2: Creating PAST memberships (with trail)...
  ✓ John left Worship Team
    - Joined: Jun 1, 2023
    - Left: May 15, 2024
    - Duration: 11 months
    - Reason: Member requested to leave to focus on youth ministry
  ✓ Jane left Morning Prayer Group
    - Joined: Jan 10, 2023
    - Left: Dec 31, 2023
    - Duration: 12 months
    - Reason: Relocated to another city
  ✓ Mike left Young Adults Fellowship
    - Joined: Sep 1, 2022
    - Left: Aug 31, 2023
    - Duration: 12 months
    - Reason: Aged out of youth group

📝 Scenario 3: Creating DEACTIVATED group scenario...
  ✓ Created: College Students Group
  ✓ John was in College Students Group (group deactivated)
  ✓ Jane was in College Students Group (group deactivated)
  ✓ Mike was in College Students Group (group deactivated)

📋 Creating audit logs...
  ✓ Created 3 audit log entries

📊 Summary:
─────────────────────────────────────────────────────
✅ Members created: 3
   - John Doe (john.doe@example.com)
   - Jane Smith (jane.smith@example.com)
   - Mike Johnson (mike.johnson@example.com)

✅ Ministries created: 2
   - Youth Ministry
   - Worship Ministry

✅ Small Groups created: 4
   - Young Adults Fellowship (ACTIVE)
   - Worship Team (ACTIVE)
   - Morning Prayer Group (ACTIVE)
   - College Students Group (DEACTIVATED)

✅ Group Memberships created: 9
   - Active: 3
   - Past (with trail): 6

✅ Audit Logs created: 3
─────────────────────────────────────────────────────

🎯 What to check in the UI:

1️⃣  Open John Doe's details:
   - Active Groups: Young Adults Fellowship (Leader)
   - Past Groups: Worship Team, College Students Group

2️⃣  Open Jane Smith's details:
   - Active Groups: Worship Team (Member)
   - Past Groups: Morning Prayer Group, College Students Group

3️⃣  Open Mike Johnson's details:
   - Active Groups: Morning Prayer Group (Co-Leader)
   - Past Groups: Young Adults Fellowship, College Students Group

✨ Each past membership should show:
   ✓ Join date
   ✓ Leave date (in red)
   ✓ Leave reason
   ✓ Duration calculation
   ✓ "Past Member" badge

✅ Group Membership Trail Demo Seeder completed successfully!
```

## What to Test in the UI

### 1. Group Memberships Section

Open any member's details and go to the **Group Memberships** tab:

#### Active Small Groups
Should show current memberships with:
- ✅ Group name
- ✅ Role badge (Leader, Co-Leader, Member)
- ✅ Active badge (blue)
- ✅ Join date
- ✅ Green checkmark icon

#### Past Small Groups
Should show historical memberships with:
- ✅ Group name
- ✅ Role badge
- ✅ Past Member badge (gray)
- ✅ Join date
- ✅ Leave date (in red with clock icon)
- ✅ Leave reason
- ✅ Duration calculation
- ✅ Faded appearance

### 2. Recent Activities Timeline

Go to the **Activities** tab:

Should show timeline entries for:
- ✅ "Joined [Group Name]" (when member joined)
- ✅ "Left [Group Name]" (when member left)
- ✅ Leave reason in description
- ✅ Proper chronological order

### 3. Member History (Admin Only)

Go to the **Member History** tab:

Should show audit log entries:
- ✅ "Added [Name] to [Group] as [Role]"
- ✅ "Removed [Name] from [Group]"
- ✅ Full metadata with reasons
- ✅ User who made the change
- ✅ Timestamp

### 4. Summary Statistics

At the bottom of Group Memberships section:

Should show:
- ✅ Active Groups count (correct number)
- ✅ Past Groups count (correct number)
- ✅ Color-coded cards (green for active, gray for past)

## Test Scenarios

### Scenario 1: Member with Multiple Groups
**Test**: Open John Doe's details
**Expected**:
- Active: 1 group (Young Adults Fellowship as Leader)
- Past: 2 groups (Worship Team, College Students Group)
- Each past group shows complete trail

### Scenario 2: Group Deactivation
**Test**: Check College Students Group members
**Expected**:
- All 3 members show it in Past Groups
- Leave reason: "Group 'College Students Group' was deactivated"
- Same leave date for all members

### Scenario 3: Different Leave Reasons
**Test**: Compare leave reasons across members
**Expected**:
- John: "Member requested to leave to focus on youth ministry"
- Jane: "Relocated to another city"
- Mike: "Aged out of youth group"
- Deactivated group: "Group '[Name]' was deactivated"

### Scenario 4: Duration Calculation
**Test**: Check duration displays
**Expected**:
- Calculates months between join and leave dates
- Shows "0 months" for same-month joins/leaves
- Shows correct month count for longer memberships

## Cleanup

To remove the demo data:

```sql
-- Remove demo group memberships
DELETE FROM "GroupMember" WHERE id LIKE 'gm-%';

-- Remove demo small groups
DELETE FROM "SmallGroup" WHERE id LIKE '%-demo';

-- Remove demo ministries
DELETE FROM "Ministry" WHERE id LIKE '%-demo';

-- Remove demo members
DELETE FROM "Member" WHERE email IN (
  'john.doe@example.com',
  'jane.smith@example.com',
  'mike.johnson@example.com'
);

-- Remove demo audit logs
DELETE FROM "AuditLog" WHERE "entityId" LIKE 'gm-%';
```

Or run the seeder again - it uses `upsert` so it will update existing records.

## Troubleshooting

### Error: "No branch found"
**Solution**: Run the main seeder first to create organization and branch:
```bash
pnpm run seed
```

### Error: "Column 'leaveDate' does not exist"
**Solution**: Sync the database schema:
```bash
npx prisma db push
npx prisma generate
```

### Members don't show past groups
**Solution**: 
1. Restart the backend server
2. Clear frontend cache
3. Reload the member details page

### Audit logs not showing
**Solution**: Check if you have admin access to view Member History tab

## Related Documentation

- [Group Membership Trail Fix](../../GROUP_DEACTIVATION_TRAIL_FIX.md)
- [Troubleshooting Guide](../../GROUP_MEMBERSHIP_TRAIL_TROUBLESHOOTING.md)
- [Test Guide](../../TEST_GROUP_MEMBERSHIP_TRAIL.md)
- [Implementation Summary](../../GROUP_MEMBERSHIP_HISTORY_IMPLEMENTATION.md)

## Notes

- The seeder is **idempotent** - you can run it multiple times safely
- Uses `upsert` to avoid duplicate entries
- Creates realistic dates spanning multiple years
- Includes various leave reasons for different scenarios
- Demonstrates both manual removals and group deactivations

---

**Created**: 2025-10-11  
**Purpose**: Demonstrate Group Membership Trail feature  
**Status**: Ready to use
