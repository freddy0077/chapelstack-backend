import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';

@InputType('SettingsAuditLogFilterInput')
export class AuditLogFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  settingType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  action?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  limit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  offset?: number;
}
