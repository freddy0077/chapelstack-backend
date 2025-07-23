# Workflow Automation System

## Overview

The Workflow Automation System is a comprehensive solution for automating church management tasks within the Chapel Stack platform. It enables automated follow-ups, event reminders, membership renewal workflows, and donation acknowledgment automation through a flexible, event-driven architecture.

## Table of Contents

- [Architecture](#architecture)
- [Core Components](#core-components)
- [Database Schema](#database-schema)
- [Implementation Details](#implementation-details)
- [Workflow Triggers](#workflow-triggers)
- [Predefined Workflows](#predefined-workflows)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Architecture

The workflow automation system follows a modular, service-oriented architecture with the following key principles:

### Design Principles

1. **Event-Driven**: Workflows are triggered by events within the system (member creation, donations, etc.)
2. **Modular**: Separate services handle different aspects (templates, execution, triggers)
3. **Scalable**: Uses Bull queue for background job processing
4. **Multi-tenant**: Organization and branch-scoped isolation
5. **Extensible**: Easy to add new workflow types and actions

### System Flow

```
Event Occurs → Trigger Service → Template Service → Execution Service → Job Queue → Processor → Actions
```

## Core Components

### 1. WorkflowsService (`workflows.service.ts`)

The main orchestrator that coordinates all workflow operations.

**Key Responsibilities:**
- Manages workflow templates (CRUD operations)
- Handles workflow executions
- Provides trigger handlers for external services
- Creates predefined workflow templates

**Why this approach:**
- Single entry point for all workflow operations
- Centralized business logic
- Consistent API for external services

### 2. WorkflowTemplateService (`workflow-template.service.ts`)

Manages workflow template definitions and configurations.

**Key Features:**
- Template CRUD operations
- JSON configuration parsing
- Template validation
- Sorting and filtering

**Why separate service:**
- Templates are complex entities requiring specialized handling
- Separation of concerns between template management and execution
- Easier testing and maintenance

### 3. WorkflowExecutionService (`workflow-execution.service.ts`)

Handles the runtime execution of workflows.

**Key Features:**
- Execution lifecycle management
- Job queue integration
- Status tracking
- Error handling and retry logic

**Why separate service:**
- Runtime execution has different concerns than template management
- Enables independent scaling of execution logic
- Better error isolation

### 4. WorkflowTriggerService (`workflow-trigger.service.ts`)

Manages event-driven workflow triggers.

**Key Features:**
- Event handler registration
- Trigger condition evaluation
- Integration with core modules
- Scheduled trigger support

**Why separate service:**
- Triggers are complex with various event types
- Enables easy addition of new trigger types
- Isolates trigger logic from execution logic

### 5. WorkflowProcessor (`workflow.processor.ts`)

Background job processor for executing workflow actions.

**Key Features:**
- Action execution (email, SMS, notifications)
- Content personalization
- Recipient resolution
- Error handling and logging

**Why Bull queue processor:**
- Reliable background processing
- Retry mechanisms
- Job scheduling and delays
- Scalable processing

## Database Schema

### Core Tables

#### WorkflowTemplate
```prisma
model WorkflowTemplate {
  id             String                @id @default(uuid())
  name           String
  description    String?
  type           WorkflowType
  status         WorkflowStatus        @default(ACTIVE)
  triggerType    WorkflowTriggerType
  triggerConfig  Json?
  organisationId String
  branchId       String?
  createdBy      String
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt
  
  // Relations
  actions        WorkflowAction[]
  executions     WorkflowExecution[]
  triggers       WorkflowTrigger[]
}
```

#### WorkflowExecution
```prisma
model WorkflowExecution {
  id               String                    @id @default(uuid())
  workflowId       String
  status           WorkflowExecutionStatus   @default(PENDING)
  triggeredBy      String
  triggerData      Json?
  targetMemberId   String?
  targetEventId    String?
  targetData       Json?
  startedAt        DateTime?
  completedAt      DateTime?
  errorMessage     String?
  organisationId   String
  branchId         String?
  createdAt        DateTime                  @default(now())
  updatedAt        DateTime                  @updatedAt
}
```

#### WorkflowAction
```prisma
model WorkflowAction {
  id           String          @id @default(uuid())
  workflowId   String
  type         WorkflowActionType
  name         String
  config       Json
  order        Int
  delay        Int?            @default(0)
  conditions   Json?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}
```

### Why This Schema Design

1. **Separation of Concerns**: Templates, executions, and actions are separate entities
2. **Flexibility**: JSON fields allow for flexible configuration without schema changes
3. **Auditability**: Full execution history and status tracking
4. **Multi-tenancy**: Organization and branch scoping built-in
5. **Scalability**: Normalized design supports large-scale operations

## Implementation Details

### Workflow Triggers Integration

The system integrates with core modules through dependency injection:

#### Members Service Integration
```typescript
// In MembersService
constructor(
  private readonly workflowsService: WorkflowsService,
) {}

async create(createMemberInput: CreateMemberInput) {
  const member = await this.prisma.member.create({...});
  
  // Trigger workflow automation
  await this.workflowsService.handleMemberCreated(
    member.id,
    member.organisationId,
    member.branchId,
  );
  
  return member;
}
```

**Why this approach:**
- **Loose Coupling**: Services remain independent
- **Event-Driven**: Natural integration with business operations
- **Error Isolation**: Workflow failures don't affect core operations
- **Testability**: Easy to mock and test workflow integration

#### Transaction Service Integration (Donations)
```typescript
// In TransactionService
async create(data: CreateTransactionInput) {
  const transaction = await this.prisma.transaction.create({...});
  
  // Trigger workflow for CONTRIBUTION transactions
  if (type === TransactionType.CONTRIBUTION) {
    await this.workflowsService.handleDonationReceived(
      transaction.id,
      organisationId,
      branchId,
    );
  }
  
  return transaction;
}
```

**Why Transaction-based donations:**
- **Unified Model**: All financial transactions use the same model
- **Consistency**: Follows established patterns in the system
- **Flexibility**: Can extend to other transaction types
- **Audit Trail**: Better tracking and reporting capabilities

### Content Personalization

The system supports dynamic content personalization using placeholders:

```typescript
const personalizedContent = this.personalizeContent(
  template,
  {
    member: memberData,
    event: eventData,
    organisation: orgData,
    workflow: workflowData,
  }
);
```

**Supported Placeholders:**
- `{{member.firstName}}` - Member's first name
- `{{member.lastName}}` - Member's last name
- `{{event.title}}` - Event title
- `{{organisation.name}}` - Organization name
- `{{workflow.name}}` - Workflow name

**Why this approach:**
- **User-Friendly**: Non-technical users can create personalized content
- **Flexible**: Easy to add new placeholder types
- **Safe**: Prevents code injection through template parsing
- **Maintainable**: Centralized personalization logic

### Job Queue Processing

Uses Bull queue for reliable background processing:

```typescript
@Process('execute-workflow')
async executeWorkflow(job: Job) {
  const { executionId, workflowId, actions } = job.data;
  
  for (const action of actions) {
    await this.executeAction(action, execution);
    
    if (action.delay > 0) {
      await this.delay(action.delay);
    }
  }
}
```

**Why Bull Queue:**
- **Reliability**: Jobs are persisted and can be retried
- **Scalability**: Can run multiple workers
- **Scheduling**: Support for delayed execution
- **Monitoring**: Built-in job monitoring and management
- **Error Handling**: Automatic retry with exponential backoff

## Workflow Triggers

### Available Trigger Types

1. **MEMBER_CREATED** - New member registration
2. **MEMBER_UPDATED** - Member information changes
3. **EVENT_CREATED** - New event creation
4. **DONATION_RECEIVED** - Contribution transactions
5. **ATTENDANCE_RECORDED** - Member attendance tracking
6. **MEMBERSHIP_EXPIRING** - Scheduled membership renewals

### Trigger Integration Points

```typescript
// Member triggers
await this.workflowsService.handleMemberCreated(memberId, orgId, branchId);
await this.workflowsService.handleMemberUpdated(memberId, orgId, branchId);

// Event triggers
await this.workflowsService.handleEventCreated(eventId, orgId, branchId);

// Donation triggers (Transaction-based)
await this.workflowsService.handleDonationReceived(transactionId, orgId, branchId);

// Attendance triggers
await this.workflowsService.handleAttendanceRecorded(attendanceId, orgId, branchId);
```

**Why these specific triggers:**
- **Business Critical**: Cover the most important church management events
- **High Impact**: Maximum automation benefit for common tasks
- **User Requested**: Based on actual church management needs
- **Extensible**: Easy to add new trigger types

## Predefined Workflows

The system comes with ready-to-use workflow templates:

### 1. New Member Welcome Workflow
```typescript
{
  name: 'New Member Welcome',
  description: 'Welcome sequence for new members',
  type: 'AUTOMATED',
  triggerType: 'MEMBER_CREATED',
  actions: [
    {
      type: 'EMAIL',
      name: 'Welcome Email',
      config: {
        subject: 'Welcome to {{organisation.name}}!',
        template: 'Welcome {{member.firstName}}! We\'re excited to have you...',
        recipients: { type: 'member', memberId: '{{targetMemberId}}' }
      }
    }
  ]
}
```

### 2. Event Reminder Workflow
```typescript
{
  name: 'Event Reminder',
  description: 'Automated event reminders',
  type: 'AUTOMATED',
  triggerType: 'EVENT_CREATED',
  actions: [
    {
      type: 'NOTIFICATION',
      name: 'Event Reminder',
      delay: 86400000, // 24 hours before
      config: {
        title: 'Event Reminder: {{event.title}}',
        message: 'Don\'t forget about {{event.title}} tomorrow!',
        recipients: { type: 'all_members' }
      }
    }
  ]
}
```

### 3. Donation Acknowledgment Workflow
```typescript
{
  name: 'Donation Thank You',
  description: 'Thank you message for donations',
  type: 'AUTOMATED',
  triggerType: 'DONATION_RECEIVED',
  actions: [
    {
      type: 'EMAIL',
      name: 'Thank You Email',
      config: {
        subject: 'Thank you for your generous donation',
        template: 'Dear {{member.firstName}}, thank you for your donation...',
        recipients: { type: 'member', memberId: '{{targetMemberId}}' }
      }
    }
  ]
}
```

**Why predefined workflows:**
- **Quick Start**: Churches can start using automation immediately
- **Best Practices**: Based on common church management patterns
- **Customizable**: Can be modified to fit specific needs
- **Learning Tool**: Examples for creating custom workflows

## Usage Examples

### Creating a Custom Workflow

```typescript
const workflow = await workflowsService.createWorkflowTemplate({
  name: 'Birthday Wishes',
  description: 'Send birthday wishes to members',
  type: 'AUTOMATED',
  triggerType: 'SCHEDULED',
  triggerConfig: {
    schedule: '0 9 * * *', // Daily at 9 AM
    condition: 'member.birthday === today'
  },
  actions: [
    {
      type: 'EMAIL',
      name: 'Birthday Email',
      config: {
        subject: 'Happy Birthday {{member.firstName}}!',
        template: 'Wishing you a blessed birthday...',
        recipients: { type: 'birthday_members' }
      }
    }
  ],
  organisationId: 'org-123',
  branchId: 'branch-456'
});
```

### Triggering a Workflow Manually

```typescript
await workflowsService.triggerWorkflow({
  workflowId: 'workflow-123',
  triggeredBy: 'user-456',
  targetMemberId: 'member-789',
  triggerData: {
    reason: 'Manual trigger',
    context: 'Admin dashboard'
  }
});
```

### Monitoring Workflow Executions

```typescript
const executions = await workflowsService.getWorkflowExecutions(
  'workflow-123',
  'org-123',
  'branch-456',
  50
);

executions.forEach(execution => {
  console.log(`Status: ${execution.status}`);
  console.log(`Started: ${execution.startedAt}`);
  console.log(`Completed: ${execution.completedAt}`);
});
```

## Configuration

### Environment Variables

```env
# Redis configuration for Bull queue
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email service configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# SMS service configuration
SMS_PROVIDER=twilio
SMS_API_KEY=your-api-key
SMS_API_SECRET=your-api-secret
```

### Module Configuration

```typescript
@Module({
  imports: [
    PrismaModule,
    CommunicationsModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'workflow-execution',
    }),
  ],
  providers: [
    WorkflowsService,
    WorkflowTemplateService,
    WorkflowExecutionService,
    WorkflowTriggerService,
    WorkflowProcessor,
    WorkflowsResolver,
  ],
  exports: [
    WorkflowsService,
    WorkflowTemplateService,
    WorkflowExecutionService,
    WorkflowTriggerService,
  ],
})
export class WorkflowsModule {}
```

## API Reference

### GraphQL Queries

```graphql
# Get all workflow templates
query GetWorkflowTemplates($organisationId: String!, $branchId: String) {
  workflowTemplates(organisationId: $organisationId, branchId: $branchId) {
    id
    name
    description
    type
    status
    triggerType
    actions {
      id
      type
      name
      config
      order
    }
  }
}

# Get workflow executions
query GetWorkflowExecutions($workflowId: String, $limit: Int) {
  workflowExecutions(workflowId: $workflowId, limit: $limit) {
    id
    status
    triggeredBy
    startedAt
    completedAt
    errorMessage
  }
}
```

### GraphQL Mutations

```graphql
# Create workflow template
mutation CreateWorkflowTemplate($input: CreateWorkflowTemplateInput!) {
  createWorkflowTemplate(input: $input) {
    id
    name
    description
    status
  }
}

# Trigger workflow
mutation TriggerWorkflow($input: TriggerWorkflowInput!) {
  triggerWorkflow(input: $input) {
    id
    status
    triggeredBy
  }
}
```

## Best Practices

### 1. Workflow Design

- **Keep workflows simple**: Focus on single, clear objectives
- **Use descriptive names**: Make workflows easy to identify
- **Add delays appropriately**: Don't overwhelm users with immediate messages
- **Test thoroughly**: Always test workflows before activating

### 2. Error Handling

- **Graceful degradation**: Workflow failures shouldn't break core functionality
- **Comprehensive logging**: Log all workflow activities for debugging
- **Retry mechanisms**: Use Bull queue retry features for transient failures
- **Monitoring**: Set up alerts for workflow failures

### 3. Performance

- **Batch operations**: Process multiple recipients efficiently
- **Queue management**: Monitor queue size and processing times
- **Database optimization**: Use proper indexes for workflow queries
- **Caching**: Cache frequently accessed workflow templates

### 4. Security

- **Input validation**: Validate all workflow configurations
- **Access control**: Ensure proper organization/branch isolation
- **Content sanitization**: Prevent injection attacks in templates
- **Audit logging**: Track all workflow modifications

### 5. Maintenance

- **Regular cleanup**: Archive old workflow executions
- **Performance monitoring**: Track workflow execution times
- **Template versioning**: Consider versioning for workflow templates
- **Documentation**: Keep workflow documentation up to date

## Troubleshooting

### Common Issues

1. **Workflow not triggering**
   - Check trigger service integration
   - Verify workflow is active
   - Check organization/branch scoping

2. **Actions not executing**
   - Verify Bull queue is running
   - Check action configuration
   - Review processor logs

3. **Personalization not working**
   - Verify placeholder syntax
   - Check data availability
   - Review personalization logic

4. **Performance issues**
   - Monitor queue size
   - Check database query performance
   - Review action execution times

### Debugging

Enable debug logging:
```typescript
// In workflow processor
this.logger.debug(`Executing workflow ${workflowId} for ${executionId}`);
```

Monitor queue status:
```typescript
// Check queue health
const waiting = await this.workflowQueue.getWaiting();
const active = await this.workflowQueue.getActive();
const completed = await this.workflowQueue.getCompleted();
```

## Future Enhancements

### Planned Features

1. **Visual Workflow Builder**: Drag-and-drop workflow creation
2. **Advanced Conditions**: Complex conditional logic
3. **Workflow Analytics**: Performance metrics and insights
4. **Template Marketplace**: Shared workflow templates
5. **Integration APIs**: Third-party service integrations

### Extensibility Points

1. **Custom Action Types**: Add new action types beyond email/SMS/notifications
2. **Custom Triggers**: Create domain-specific trigger types
3. **Custom Conditions**: Add complex business logic conditions
4. **Custom Recipients**: Advanced recipient resolution logic

## Conclusion

The Workflow Automation System provides a robust, scalable foundation for automating church management tasks. Its modular architecture, comprehensive feature set, and integration capabilities make it suitable for churches of all sizes while maintaining flexibility for future enhancements.

The system successfully addresses the core requirements of automated follow-ups, event reminders, membership renewal workflows, and donation acknowledgment automation while providing a platform for future workflow automation needs.
