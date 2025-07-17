# Messaging & Communication Module – Chapel Stack ChMS

## Overview

The Messaging & Communication module enables multi-channel messaging (Email, SMS, In-App, Push Notifications) for church admins and staff. It supports targeted communication, campaign scheduling, automated reminders, two-way conversations, media attachments, and analytics.

---

## Feature Breakdown

### 1. Message Composition & Sending
- Compose messages for Email, SMS, In-App, or Push.
- Rich text editor for email, templated text for SMS.
- Attach media: images, PDFs, audio clips.
- Channel selection (multi-channel or single).
- Preview before sending.

### 2. Targeting & Segmentation
- Select recipients by:
  - Roles (e.g., pastors, ushers, elders, members)
  - Groups (youth, choir, women’s ministry, men’s fellowship, small groups)
  - Activity (active, inactive, first-time visitors)
  - Attendance history (e.g., missed services, event participation)
- Save recipient lists as segments.

### 3. Scheduling & Automation
- Schedule one-time or recurring messages.
- Automate messages for:
  - Birthdays, anniversaries, missed services, volunteer reminders.
  - Event/campaign triggers (revivals, conferences, fundraising).
- Calendar view for scheduled/automated messages.

### 4. Two-Way Conversations
- Inbox for admins/staff and members.
- Threaded message view.
- Reply, forward, mark as read/unread.
- Notification system for new replies.

### 5. Analytics Dashboard
- Open rates, delivery status, bounce reports per channel.
- Click-through rates for emails/SMS with links.
- Engagement stats by group/segment.
- Export analytics to CSV.

---

## Technical Specifications

### Backend
- **Framework:** Node.js (NestJS), TypeScript
- **Database:** PostgreSQL (messages, recipients, logs, analytics)
- **Channels:**
  - Email: SMTP/SendGrid/Mailgun integration
  - SMS: Twilio or similar
  - Push: Firebase Cloud Messaging (FCM)
  - In-App: WebSocket or polling
- **File Storage:** S3-compatible for attachments
- **GraphQL API:** CRUD for messages, conversations, analytics
- **Scheduler:** BullMQ/Agenda for scheduled/automated jobs
- **Role-based access:** Integrated with existing RBAC/auth system

### Frontend
- **Framework:** React (Next.js)
- **UI Library:** Chapel Stack UI (Tailwind, Radix UI)
- **Components:**
  - Message composer (rich text, attachments)
  - Recipient selector (roles, groups, filters)
  - Scheduler/calendar
  - Inbox & conversation view
  - Analytics dashboard (charts, tables)
- **Notifications:** Toasts, badges, in-app alerts

---

## UI/UX Flow

### 1. Dashboard
- Quick stats: sent, scheduled, delivered, failed, open/click rates.
- Shortcuts: Compose, Schedule, View Analytics.

### 2. Compose Message
- Select channel(s)
- Write message (with templates)
- Attach files
- Select recipients (roles, groups, filters)
- Preview & send or schedule

### 3. Recipient Selection
- Multi-select with search/filter
- Save as segment for reuse

### 4. Scheduling
- Choose send time (immediate or future)
- Set recurrence (daily, weekly, event-based)
- View/edit scheduled messages in calendar

### 5. Inbox & Conversations
- List of conversations (searchable, filterable)
- Threaded message view
- Reply, forward, mark as read/unread

### 6. Analytics
- Channel-specific stats
- Filter by date, group, campaign
- Export options

---

## Implementation Notes

- All message actions (send, schedule, reply, analytics) are permission-controlled via RBAC.
- Media attachments are virus-scanned and size-limited.
- Automated messages use templates with dynamic placeholders (e.g., {firstName}, {eventName}).
- All user-facing errors and delivery failures are logged and surfaced in UI.

## Environment Configuration

The Messaging & Communication Module requires the following environment variables:

```
# Email Configuration
EMAIL_SENDER=noreply@church.org
SENDGRID_API_KEY=your_sendgrid_api_key

# SMS Configuration
SMS_SENDER_NUMBER=CHURCH
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Push Configuration
FCM_API_KEY=your_fcm_api_key

# File Storage
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_BUCKET_NAME=your_aws_bucket_name
```

## Testing

The Messaging & Communication Module includes comprehensive unit tests for all services and resolvers. Run the tests with:

```bash
# Run all tests
npm test

# Run messaging module tests specifically
npm test -- messaging
```

## Future Enhancements

- **Push Notifications**: Mobile app push notification integration
- **Communication Analytics**: Track open rates, click rates, and engagement
- **Advanced Scheduling**: Time-zone aware message scheduling
- **A/B Testing**: Test different message variants for effectiveness
- **Automated Workflows**: Trigger communications based on events or user actions
- **Social Media Integration**: Post to church social media accounts
- **Two-way SMS**: Support for receiving and responding to incoming SMS messages
- **Rich Media SMS**: Support for MMS with images and other media
- **Real-time Chat**: Live chat support for church members
