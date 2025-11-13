import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { AutomationType, TriggerType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateAutomationConfigInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => AutomationType)
  @IsEnum(AutomationType)
  @IsNotEmpty()
  type: AutomationType;

  @Field(() => TriggerType)
  @IsEnum(TriggerType)
  @IsNotEmpty()
  triggerType: TriggerType;

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

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  channels: any; // Array of MessageChannelType

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;
}
