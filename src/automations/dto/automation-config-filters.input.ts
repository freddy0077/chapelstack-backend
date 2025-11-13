import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { AutomationType, AutomationStatus, TriggerType } from '@prisma/client';

@InputType()
export class AutomationConfigFiltersInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

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

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;
}
