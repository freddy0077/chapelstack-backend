import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

@InputType()
export class UpdateModuleSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  membersEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  eventsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  donationsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  financeEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  broadcastsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  groupsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  attendanceEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  reportsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  mobileAppEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  certificatesEnabled?: boolean;
}

@InputType()
export class ToggleModuleInput {
  @Field()
  @IsString()
  moduleName: string;

  @Field()
  @IsBoolean()
  enabled: boolean;
}
