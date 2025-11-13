import { InputType, Field, Int } from '@nestjs/graphql';
import { AutomationLogStatus } from '@prisma/client';

/**
 * Filters for querying automation logs
 */
@InputType()
export class AutomationLogsFiltersInput {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => String, { nullable: true })
  automationId?: string;

  @Field(() => AutomationLogStatus, { nullable: true })
  status?: AutomationLogStatus;
}
