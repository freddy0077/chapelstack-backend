import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { AutomationType, TriggerType, AutomationStatus } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateAutomationConfigInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => AutomationType, { nullable: true })
  @IsEnum(AutomationType)
  @IsOptional()
  type?: AutomationType;

  @Field(() => AutomationStatus, { nullable: true })
  @IsEnum(AutomationStatus)
  @IsOptional()
  status?: AutomationStatus;

  @Field(() => TriggerType, { nullable: true })
  @IsEnum(TriggerType)
  @IsOptional()
  triggerType?: TriggerType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  schedule?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  triggerConfig?: any;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  templateId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  channels?: any;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
