# Communications Module

## Overview

The Communications Module provides a comprehensive set of tools for managing various types of communications within the church management system. It enables sending emails, SMS messages, managing notifications, and creating reusable templates for consistent messaging.

## Features

- **Email Management**
  - Send personalized emails to individuals or groups
  - Create, update, and manage email templates
  - Support for HTML and plain text email formats
  - Template variable substitution

- **SMS Messaging**
  - Send text messages to individuals or groups
  - Track message delivery status
  - Branch-specific messaging

- **Notification System**
  - In-app notifications for users
  - Different notification types (info, warning, success, error, event reminders)
  - Mark as read/unread functionality
  - Bulk notification management

- **Template Management**
  - Reusable email templates
  - Branch-specific and global templates
  - Variable substitution for personalization

## Implementation Details

### Architecture

The Communications Module follows the NestJS architecture pattern with:
- **DTOs**: Define data transfer objects for inputs and outputs
- **Services**: Implement business logic for each communication type
- **Resolvers**: Expose GraphQL endpoints for client applications
- **Prisma Models**: Define database schema for communications entities

### Key Components

1. **Email Service**: Handles email composition, template processing, and sending
2. **SMS Service**: Manages SMS message creation and delivery
3. **Notification Service**: Manages in-app notifications for users
4. **Template Service**: Handles creation and management of reusable email templates

### Database Models

- `EmailTemplate`: Reusable email templates with variable placeholders
- `EmailMessage`: Records of sent/scheduled emails
- `SmsMessage`: Records of sent/scheduled SMS messages
- `Notification`: In-app notifications for users

## Usage Examples

### Sending an Email

```typescript
// Using the EmailService
const emailService = new EmailService(prismaService, configService);
const result = await emailService.sendEmail({
  recipients: ['user@example.com'],
  subject: 'Welcome to our church!',
  bodyHtml: '<h1>Welcome!</h1><p>We're glad to have you join us.</p>',
});

// Using GraphQL mutation
mutation {
  sendEmail(input: {
    recipients: ["user@example.com"]
    subject: "Welcome to our church!"
    bodyHtml: "<h1>Welcome!</h1><p>We're glad to have you join us.</p>"
  })
}
```

### Using Email Templates

```typescript
// Create a template
const template = await emailService.createEmailTemplate({
  name: "Welcome Email",
  subject: "Welcome, {{name}}!",
  bodyHtml: "<h1>Hello {{name}}!</h1><p>Welcome to {{churchName}}.</p>",
});

// Send email using template
await emailService.sendEmail({
  recipients: ['user@example.com'],
  templateId: template.id,
  templateData: {
    name: "John",
    churchName: "Grace Community Church"
  }
});
```

### Sending SMS Messages

```typescript
// Using the SmsService
const smsService = new SmsService(prismaService, configService);
await smsService.sendSms({
  recipients: ['+15551234567'],
  message: 'Reminder: Church service tomorrow at 10am',
});

// Using GraphQL mutation
mutation {
  sendSms(input: {
    recipients: ["+15551234567"]
    message: "Reminder: Church service tomorrow at 10am"
  })
}
```

### Creating Notifications

```typescript
// Using the NotificationService
const notificationService = new NotificationService(prismaService);
await notificationService.createNotification({
  userId: "user-id",
  title: "New Announcement",
  message: "There's a new announcement from the pastor",
  type: NotificationType.INFO
});

// Using GraphQL mutation
mutation {
  createNotification(input: {
    userId: "user-id"
    title: "New Announcement"
    message: "There's a new announcement from the pastor"
    type: INFO
  }) {
    id
    title
  }
}
```

## Environment Configuration

The Communications Module requires the following environment variables:

```
# Email Configuration
EMAIL_SENDER=noreply@church.org
SENDGRID_API_KEY=your_sendgrid_api_key

# SMS Configuration
SMS_SENDER_NUMBER=CHURCH
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

## Testing

The Communications Module includes comprehensive unit tests for all services and resolvers. Run the tests with:

```bash
# Run all tests
npm test

# Run communications module tests specifically
npm test -- communications
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
