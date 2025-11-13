import { ObjectType, Field, ID, Int } from '@nestjs/graphql';;
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class SettingsAuditLogEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => String)
  userEmail: string;

  @Field(() => String)
  settingType: string;

  @Field(() => String)
  action: string;

  @Field({ nullable: true })
  fieldChanged?: string;

  @Field({ nullable: true })
  oldValue?: string;

  @Field({ nullable: true })
  newValue?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class AuditLogListEntity {
  @Field(() => [SettingsAuditLogEntity])
  logs: SettingsAuditLogEntity[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;
}

@ObjectType()
export class AuditStatisticsEntity {
  @Field(() => Int)
  totalChanges: number;

  @Field(() => GraphQLJSON)
  bySettingType: any;

  @Field(() => GraphQLJSON)
  byAction: any;

  @Field(() => GraphQLJSON)
  byUser: any;

  @Field(() => GraphQLJSON)
  byDay: any;
}

@ObjectType()
export class ActiveUserEntity {
  @Field(() => ID)
  userId: string;

  @Field(() => String)
  userEmail: string;

  @Field(() => Int)
  changeCount: number;
}

@ObjectType()
export class ChangedSettingEntity {
  @Field(() => String)
  settingType: string;

  @Field(() => Int)
  changeCount: number;
}
