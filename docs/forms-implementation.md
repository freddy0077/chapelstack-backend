# Forms Module Implementation Guide

## Overview

The Forms module provides a flexible system for creating, managing, and collecting form submissions within the church management system. This document covers the technical implementation details, architecture decisions, and known issues/solutions.

## Architecture

The Forms module follows the standard NestJS architecture with:

- **Entities**: GraphQL object types that represent database models
- **DTOs**: Input types for creating and updating entities
- **Services**: Business logic for CRUD operations
- **Resolvers**: GraphQL API endpoints
- **Prisma Models**: Database schema definitions

### Key Components

1. **Entities**:
   - `Form`: Represents a form with title, description, status, etc.
   - `FormField`: Represents a field within a form (text, select, etc.)
   - `FormSubmission`: Represents a submission of a form
   - `FormFieldValue`: Represents a value for a specific field in a submission

2. **Services**:
   - `FormsService`: Manages forms (CRUD)
   - `FormFieldsService`: Manages form fields (CRUD)
   - `FormSubmissionsService`: Manages form submissions and field values

3. **Resolvers**:
   - `FormsResolver`: GraphQL endpoints for forms
   - `FormFieldsResolver`: GraphQL endpoints for form fields
   - `FormSubmissionsResolver`: GraphQL endpoints for form submissions

## Database Schema

The Forms module uses the following Prisma models:

```prisma
model Form {
  id              String           @id @default(cuid())
  title           String
  description     String?
  slug            String           @unique
  status          FormStatus       @default(DRAFT)
  isPublic        Boolean          @default(false)
  branchId        String?
  branch          Branch?          @relation(fields: [branchId], references: [id])
  fields          FormField[]
  submissions     FormSubmission[]
  notifyEmails    String[]
  submissionCount Int              @default(0)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

model FormField {
  id           String           @id @default(cuid())
  formId       String
  form         Form             @relation(fields: [formId], references: [id], onDelete: Cascade)
  label        String
  placeholder  String?
  description  String?
  fieldType    FieldType
  isRequired   Boolean          @default(false)
  options      Json?
  order        Int              @default(0)
  fieldValues  FormFieldValue[]
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

model FormSubmission {
  id           String           @id @default(cuid())
  formId       String
  form         Form             @relation(fields: [formId], references: [id], onDelete: Cascade)
  branchId     String?
  branch       Branch?          @relation(fields: [branchId], references: [id])
  status       SubmissionStatus @default(COMPLETED)
  fieldValues  FormFieldValue[]
  submittedAt  DateTime         @default(now())
  submittedBy  String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

model FormFieldValue {
  id           String         @id @default(cuid())
  fieldId      String
  field        FormField      @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  submissionId String
  submission   FormSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  value        String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

enum FormStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum FieldType {
  TEXT
  TEXTAREA
  EMAIL
  NUMBER
  DATE
  SELECT
  RADIO
  CHECKBOX
  FILE
}

enum SubmissionStatus {
  COMPLETED
  INCOMPLETE
  REJECTED
}
```

## Circular Dependency Handling

The Forms module has circular dependencies between `FormSubmission` and `FormFieldValue` entities. These are handled using the following approach:

### In `form-submission.entity.ts`:

```typescript
// Instead of importing FormFieldValue directly
// import { FormFieldValue } from './form-field-value.entity';

// Use a type alias to avoid circular dependency
type FormFieldValue = any;

@ObjectType()
export class FormSubmission {
  // ...other fields

  @Field(() => [String], {
    description: 'FormFieldValue array',
    nullable: true,
  })
  fieldValues?: any[];
}
```

### In `form-field-value.entity.ts`:

```typescript
// Instead of importing FormSubmission directly
// import { FormSubmission } from './form-submission.entity';

@ObjectType()
export class FormFieldValue {
  // ...other fields

  @Field(() => String, {
    description: 'FormSubmission reference',
  })
  submission: any;
}
```

This approach avoids runtime circular reference errors while maintaining the GraphQL schema structure.

## Testing

### Mocking Prisma Errors

When testing services that use Prisma, we need to properly mock the Prisma error classes for `instanceof` checks:

```typescript
// Create a mock Prisma error class
class MockPrismaError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

// Patch the Prisma namespace to make instanceof checks work
(Prisma as any).PrismaClientKnownRequestError = MockPrismaError;

// Example: Mock a unique constraint error
const prismaError = new MockPrismaError('Unique constraint failed', 'P2002');
mockPrismaService.form.create.mockRejectedValue(prismaError);
```

### Mocking Prisma Transactions

For testing methods that use Prisma transactions:

```typescript
// Mock the $transaction method
mockPrismaService.$transaction.mockImplementation(async (callback) => {
  try {
    return await callback(mockPrismaService);
  } catch (error) {
    throw error;
  }
});
```

## Common Error Codes

- `P2002`: Unique constraint violation (e.g., duplicate slug)
- `P2003`: Foreign key constraint failure (e.g., invalid field ID)
- `P2025`: Record not found

## GraphQL Scalar Types

The Forms module uses the following scalar types:

- `GraphQLISODateTime`: For date/time fields
- `GraphQLJSON`: For JSON fields (like field options)

These are registered in the `app.module.ts`:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  // ...other config
  buildSchemaOptions: {
    // ...other options
    scalarsMap: [
      { type: Date, scalar: GraphQLISODateTime },
      { type: Object, scalar: GraphQLJSON },
    ],
  },
}),
```

## Known Issues and Solutions

### 1. Circular Dependencies

**Issue**: Circular dependencies between `FormSubmission` and `FormFieldValue` entities.

**Solution**: Use string types in GraphQL decorators and `any` types in TypeScript to avoid runtime errors.

### 2. Prisma Error Handling in Tests

**Issue**: Tests failing due to improper mocking of Prisma error classes for `instanceof` checks.

**Solution**: Create a `MockPrismaError` class and patch the Prisma namespace in tests.

### 3. TypeScript/ESLint Errors

**Issue**: TypeScript server may not recognize new Prisma models, causing "unsafe call" or "unsafe member access" errors.

**Solution**: Restart the TypeScript server via VS Code's "TypeScript: Restart TS server" command.

## Best Practices

1. **Error Handling**: Always use try/catch blocks and handle specific Prisma error codes
2. **Validation**: Validate input data before attempting database operations
3. **Transactions**: Use transactions for operations that modify multiple related records
4. **Access Control**: Implement proper guards and permissions for form operations

## Future Improvements

1. Refactor entity relationships to properly handle circular dependencies with type safety
2. Create more comprehensive mocks for Prisma client and errors in tests
3. Implement more advanced form features (conditional logic, multi-page forms)
4. Add analytics for form submissions and completion rates
