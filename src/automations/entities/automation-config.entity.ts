import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { AutomationType, AutomationStatus, TriggerType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { MessageTemplate } from '../../message-templates/entities/message-template.entity';

// Register enums for GraphQL
registerEnumType(AutomationType, {
  name: 'AutomationType',
  description: 'Types of automation triggers',
});

registerEnumType(AutomationStatus, {
  name: 'AutomationStatus',
  description: 'Status of automation configuration',
});

registerEnumType(TriggerType, {
  name: 'TriggerType',
  description: 'Type of trigger for automation',
});

@ObjectType()
export class AutomationConfig {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => AutomationType)
  type: AutomationType;

  @Field(() => AutomationStatus)
  status: AutomationStatus;

  @Field(() => Boolean)
  isEnabled: boolean;

  @Field(() => TriggerType)
  triggerType: TriggerType;

  @Field(() => String, { nullable: true })
  schedule?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  triggerConfig?: any;

  @Field(() => String, { nullable: true })
  templateId?: string | null;

  @Field(() => GraphQLJSON)
  channels: any; // Array of MessageChannelType

  @Field(() => Date, { nullable: true })
  lastRun?: Date | null;

  @Field(() => Date, { nullable: true })
  nextRun?: Date | null;

  @Field(() => Int)
  totalRuns: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => String)
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => String)
  createdBy: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => MessageTemplate, { nullable: true })
  template?: MessageTemplate | null;
}
