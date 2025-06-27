# Communication Tools Module (`communications.md`)

## 1. Overview

The Communication Tools module provides functionalities for the church to engage with its members and staff through various channels like email, SMS, and internal notifications. It aims to streamline communication, ensuring timely and relevant information reaches the intended audience.

Communications can be targeted at specific branches, groups, or individuals.

## 2. Core Responsibilities

-   **Email Broadcasting**: Sending mass emails to selected groups of members or staff (e.g., newsletters, announcements).
-   **SMS Messaging**: Sending text messages for urgent alerts or reminders.
-   **Targeted Communication**: Segmenting audiences based on branch, member status, group affiliation, or other criteria.
-   **Template Management**: Creating and using templates for emails and SMS messages.
-   **Notification System**: In-app notifications for important updates or actions required.
-   **Communication Preferences**: Allowing members to manage their communication preferences and subscriptions.
-   **Tracking & Analytics**: Monitoring email open rates, click-through rates, and SMS delivery status (if supported by providers).
-   **Opt-out Management**: Handling unsubscribe requests in compliance with regulations (e.g., CAN-SPAM, GDPR).

## 3. Key Entities & Data Models

*(Detail the Prisma/TypeORM entities or database schema here. Include entities like `Communication`, `EmailTemplate`, `SmsMessage`, `Notification`, `AudienceSegment`, etc.)*

```typescript
// Example Placeholder Schema
model EmailMessage {
  id          String    @id @default(cuid())
  subject     String
  bodyHtml    String
  bodyText    String?
  senderEmail String
  // recipients User[] or Member[] - complex relation, often handled by a junction table or list of emails
  sentAt      DateTime? @default(now())
  status      MessageStatus // Enum: DRAFT, SCHEDULED, SENDING, SENT, FAILED
  branchId    String?   // For branch-specific comms, or null for system-wide
  // branch   Branch?   @relation(fields: [branchId], references: [id])
  templateId  String?
  // template EmailTemplate? @relation(fields: [templateId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum MessageStatus {
  DRAFT
  PENDING_APPROVAL
  SCHEDULED
  SENDING
  SENT
  DELIVERED // For SMS
  FAILED
  CANCELLED
}

model SmsMessage {
  id          String    @id @default(cuid())
  body        String
  senderNumber String
  // recipients Member[] - complex relation or list of phone numbers
  sentAt      DateTime? @default(now())
  status      MessageStatus
  branchId    String?
  // branch   Branch?   @relation(fields: [branchId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Notification {
  id          String    @id @default(cuid())
  userId      String    // Recipient user
  // user     User      @relation(fields: [userId], references: [id])
  title       String
  message     String
  isRead      Boolean   @default(false)
  readAt      DateTime?
  link        String?   // Link to relevant page in the app
  type        NotificationType // Enum: INFO, WARNING, SUCCESS, ERROR, EVENT_REMINDER
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 4. Core Functionalities & Use Cases

-   Church admin sends a weekly newsletter email to all subscribed members of a specific branch.
-   Pastor sends an SMS alert about a last-minute change to an event schedule.
-   A member receives an in-app notification about an upcoming group meeting.
-   Staff creates an email template for birthday greetings.
-   A member unsubscribes from promotional emails but remains subscribed to important service announcements.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here.)*

### GraphQL (Example)

**Queries:**
-   `listNotifications(userId: ID!, filter: NotificationFilterInput): [Notification!]`
-   `emailTemplates(branchId: ID): [EmailTemplate!]`

**Mutations:**
-   `sendEmail(input: SendEmailInput!): Boolean` // Input includes recipients, subject, body or templateId
-   `sendSms(input: SendSmsInput!): Boolean`   // Input includes recipients, message
-   `createEmailTemplate(input: CreateEmailTemplateInput!): EmailTemplate`
-   `updateEmailTemplate(id: ID!, input: UpdateEmailTemplateInput!): EmailTemplate`
-   `markNotificationAsRead(notificationId: ID!): Notification`
-   `markAllNotificationsAsRead(userId: ID!): Boolean`

## 6. Integration with Other Modules

-   **Member Management**: To get recipient lists and manage communication preferences.
-   **Branch Management**: To target communications by branch.
-   **Event & Calendar Management**: To send event reminders or updates.
-   **Ministry & Small Group Management**: To facilitate communication within groups.
-   **Authentication & User Management**: For in-app notifications to specific users.

## 7. Security Considerations

-   **Anti-Spam Compliance**: Adherence to CAN-SPAM, GDPR, and other relevant regulations.
-   **Data Privacy**: Protecting member contact information.
-   **Rate Limiting**: To prevent abuse of communication services.
-   **Secure API Keys**: For third-party email/SMS providers (e.g., SendGrid, Twilio).
-   Preventing phishing or unauthorized use of communication channels.

## 8. Future Considerations

-   Push notifications for mobile apps.
-   More advanced A/B testing for email campaigns.
-   Automated communication workflows (e.g., welcome series for new members).
-   Integration with social media platforms.
-   Real-time chat features.
