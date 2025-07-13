import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import {
  VisibilityLevel,
  ReportingLevel,
} from '../dto/update-branch-settings.input';

@ObjectType()
export class BrandingSettings {
  @Field()
  primaryColor: string;

  @Field()
  secondaryColor: string;

  @Field()
  fontFamily: string;
}

@ObjectType()
export class NotificationSettings {
  @Field(() => Boolean)
  emailNotifications: boolean;

  @Field(() => Boolean)
  smsNotifications: boolean;

  @Field(() => Boolean)
  transferNotifications: boolean;

  @Field(() => Boolean)
  financialNotifications: boolean;
}

@ObjectType()
export class BranchSettings {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => Boolean, { defaultValue: true })
  allowMemberTransfers: boolean;

  @Field(() => Boolean, { defaultValue: true })
  allowResourceSharing: boolean;

  @Field(() => String)
  visibilityToOtherBranches: string;

  @Field(() => String)
  financialReportingLevel: string;

  @Field(() => String)
  attendanceReportingLevel: string;

  @Field(() => String)
  memberDataVisibility: string;

  @Field(() => String, { nullable: true })
  timezone: string;

  @Field(() => String, { nullable: true })
  currency: string;

  @Field(() => String, { nullable: true })
  language: string;

  @Field(() => BrandingSettings, { nullable: true })
  brandingSettings: Record<string, any>;

  @Field(() => NotificationSettings, { nullable: true })
  notificationSettings: Record<string, any>;

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date;
}
