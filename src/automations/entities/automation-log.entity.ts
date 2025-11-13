import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { AutomationLogStatus } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// Register enum for GraphQL
registerEnumType(AutomationLogStatus, {
  name: 'AutomationLogStatus',
  description: 'Status of automation execution',
});

/**
 * AutomationLog entity
 * Represents a single execution of an automation
 */
@ObjectType()
export class AutomationLog {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  automationId: string;

  @Field(() => String)
  automationName: string;

  @Field(() => AutomationLogStatus)
  status: AutomationLogStatus;

  @Field(() => Int)
  recipientCount: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => String, { nullable: true })
  errorMessage?: string | null;

  @Field(() => Date)
  executedAt: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date | null;

  @Field(() => GraphQLJSON, { nullable: true })
  details?: any;
}
