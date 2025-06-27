import { registerEnumType } from '@nestjs/graphql';

// Define the enum to match Prisma's enum
export enum SubmissionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

// Register the enum for GraphQL
registerEnumType(SubmissionStatus, {
  name: 'SubmissionStatus',
  description: 'Status of a form submission',
});
