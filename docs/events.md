# Event & Calendar Management Module (`events.md`)

## 1. Overview

The Event & Calendar Management module is responsible for scheduling, organizing, and publicizing all church events, services, meetings, and activities. It provides tools for creating single and recurring events, managing calendars, booking resources, and coordinating volunteers for events.

This module is vital for keeping the church community informed and engaged, and for managing the logistical aspects of church activities across different branches.

## 2. Core Responsibilities

-   **Event Creation & Management**: Allowing authorized users to create, update, and delete events with details such as title, description, date, time, location, and category.
-   **Recurring Events**: Supporting the creation of events that repeat on various schedules (daily, weekly, monthly, yearly, custom patterns).
-   **Calendar Views**: Providing data for various calendar displays (month, week, day, list views) for different branches or consolidated views.
-   **Event Categories & Tags**: Allowing events to be categorized (e.g., Worship Service, Small Group, Youth Event, Outreach) and tagged for better organization and filtering.
-   **Resource Booking**: Managing the reservation of church resources (e.g., rooms, halls, equipment) for events.
-   **Volunteer Coordination**: Integrating with Volunteer Management to schedule volunteers for specific event roles and shifts.
-   **Event Registration & Ticketing (Optional)**: If applicable, managing registrations, sign-ups, or even ticketing for certain events.
-   **Public & Private Events**: Differentiating between events visible to the public and those intended for internal groups or specific members.
-   **Multi-Branch Event Handling**: Supporting events specific to a single branch, as well as events that might be shared or relevant across multiple branches (e.g., diocesan events).

## 3. Key Entities & Data Models

*(This section should detail the Prisma/TypeORM entities or database schema. Example below)*

### `Event` Entity

```typescript
// Example Prisma Schema
model Event {
  id                String    @id @default(cuid())
  title             String
  description       String?
  startTime         DateTime
  endTime           DateTime
  allDay            Boolean   @default(false)
  locationName      String?   // e.g., "Main Sanctuary", "Room 101"
  address           String?
  isOnlineEvent     Boolean   @default(false)
  onlineMeetingUrl  String?
  status            EventStatus @default(SCHEDULED) // Enum: SCHEDULED, CANCELLED, COMPLETED, POSTPONED
  visibility        EventVisibility @default(PUBLIC) // Enum: PUBLIC, PRIVATE, MEMBERS_ONLY
  branchId          String
  branch            Branch    @relation(fields: [branchId], references: [id])
  eventCategoryId   String?
  eventCategory     EventCategory? @relation(fields: [eventCategoryId], references: [id])
  imageUrl          String?
  contactPersonName String?
  contactEmail      String?
  contactPhone      String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations for recurrence
  recurrenceRule    String?   // iCalendar RRULE string
  parentId          String?   // For recurring event instances, points to the master event
  parentEvent       Event?    @relation("RecurringEventInstances", fields: [parentId], references: [id])
  instances         Event[]   @relation("RecurringEventInstances")
  // Other relations: registrations, resource bookings, volunteer assignments
}

enum EventStatus {
  SCHEDULED
  CONFIRMED
  CANCELLED
  COMPLETED
  POSTPONED
  TENTATIVE
}

enum EventVisibility {
  PUBLIC          // Visible to everyone, including on public website
  MEMBERS_ONLY    // Visible only to logged-in members
  STAFF_ONLY      // Visible only to staff/admins
  PRIVATE         // Visible only to specific invited individuals or groups
}
```

### `EventCategory` Entity

```typescript
// Example Prisma Schema
model EventCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String?  // Hex color code for calendar display
  branchId    String   // Categories can be branch-specific or global (e.g. null branchId for global)
  branch      Branch?  @relation(fields: [branchId], references: [id])
  events      Event[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### `EventRegistration` Entity (Example, if registrations are managed)

```typescript
// Example Prisma Schema
model EventRegistration {
  id            String    @id @default(cuid())
  eventId       String
  event         Event     @relation(fields: [eventId], references: [id])
  memberId      String?   // If registered by a known member
  member        Member?   @relation(fields: [memberId], references: [id])
  guestName     String?   // If registered by a guest
  guestEmail    String?
  registrationDate DateTime @default(now())
  status        RegistrationStatus @default(CONFIRMED) // Enum: CONFIRMED, CANCELLED, WAITLISTED
  notes         String?
  branchId      String
  branch        Branch    @relation(fields: [branchId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## 4. Core Functionalities & Use Cases

-   **Church staff creates a new weekly Sunday service** as a recurring event.
-   **A ministry leader schedules a one-time special event** for their group.
-   **Members view the church calendar** filtered by their branch and event categories.
-   **Admin cancels an event** due to unforeseen circumstances, potentially notifying registrants.
-   **Staff books the main hall resource** for an upcoming conference.
-   **Users register for an upcoming workshop**.
-   **Generating an iCalendar feed** for events in a specific branch or category.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints. Examples below)*

### GraphQL

**Queries:**

```graphql
# Get a specific event by ID
event(id: ID!): Event

# List events (with pagination, filtering by branch, date range, category, etc.)
events(filter: EventFilterInput, pagination: PaginationInput): PaginatedEvents

# Get event categories for a branch (or global)
eventCategories(branchId: ID): [EventCategory!]

# Get registrations for an event (admin/organizer only)
eventRegistrations(eventId: ID!, pagination: PaginationInput): PaginatedEventRegistrations
```

**Mutations:**

```graphql
# Create a new event
createEvent(input: CreateEventInput!): Event

# Update an existing event
updateEvent(id: ID!, input: UpdateEventInput!): Event # Handle updates to recurring series carefully

# Delete an event (or a recurring series/instance)
deleteEvent(id: ID!, scope: DeletionScope): Boolean # Scope: SINGLE_INSTANCE, ALL_FUTURE, ENTIRE_SERIES

# Create an event category
createEventCategory(input: CreateEventCategoryInput!): EventCategory

# Update an event category
updateEventCategory(id: ID!, input: UpdateEventCategoryInput!): EventCategory

# Register for an event
registerForEvent(eventId: ID!, input: EventRegistrationInput): EventRegistration

# Cancel an event registration
cancelEventRegistration(registrationId: ID!): EventRegistration
```

### REST API (if applicable)

-   `POST /branches/{branchId}/events`
-   `GET /branches/{branchId}/events`
-   `GET /events/{id}`
-   `PUT /events/{id}`
-   `DELETE /events/{id}`
-   `GET /branches/{branchId}/event-categories`
-   `POST /events/{eventId}/registrations`

## 6. Integration with Other Modules

-   **Branch Management**: Events are scoped by `branchId`.
-   **Member Management**: For event registrations and targeted invitations.
-   **Volunteer Management**: To assign and schedule volunteers for events.
-   **Resource Management (Facilities)**: To book rooms and equipment.
-   **Communication Tools**: To send event reminders, updates, or invitations.
-   **Website Integration**: To display public events on the church website.

## 7. Security Considerations

-   **Access Control**: Ensure only authorized users (e.g., staff, ministry leaders) can create or modify events for their respective branches or areas of responsibility.
-   **Data Privacy**: If collecting registration data, handle it according to privacy policies.
-   **Visibility Controls**: Properly enforce public, private, and members-only event visibility.

## 8. Future Considerations

-   Advanced calendar synchronization (Google Calendar, Outlook Calendar).
-   Ticketing and payment integration for paid events.
-   Automated waiting lists for full events.
-   More sophisticated resource conflict detection.
-   Integration with mapping services for event locations.
