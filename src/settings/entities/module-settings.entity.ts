import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ModuleSettingsEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => Boolean)
  membersEnabled: boolean;

  @Field(() => Boolean)
  eventsEnabled: boolean;

  @Field(() => Boolean)
  donationsEnabled: boolean;

  @Field(() => Boolean)
  financeEnabled: boolean;

  @Field(() => Boolean)
  broadcastsEnabled: boolean;

  @Field(() => Boolean)
  groupsEnabled: boolean;

  @Field(() => Boolean)
  attendanceEnabled: boolean;

  @Field(() => Boolean)
  reportsEnabled: boolean;

  @Field(() => Boolean)
  mobileAppEnabled: boolean;

  @Field(() => Boolean)
  smsEnabled: boolean;

  @Field(() => Boolean)
  emailEnabled: boolean;

  @Field(() => Boolean)
  certificatesEnabled: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class EnabledModulesEntity {
  @Field(() => [String])
  modules: string[];
}
