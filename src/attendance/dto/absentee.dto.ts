import { InputType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AbsenteeMessageType, AbsenteeMessageStatus } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(AbsenteeMessageType, {
  name: 'AbsenteeMessageType',
});

registerEnumType(AbsenteeMessageStatus, {
  name: 'AbsenteeMessageStatus',
});

@InputType()
export class AbsenteeFiltersInput {
  @Field({ nullable: true })
  regularAttendersOnly?: boolean;

  @Field({ nullable: true })
  minConsecutiveAbsences?: number;

  @Field(() => [String], { nullable: true })
  memberGroupIds?: string[];
}

@ObjectType()
export class AbsenteeMemberInfo {
  @Field()
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  phoneNumber?: string | null;

  @Field(() => String, { nullable: true })
  profileImageUrl?: string | null;
}

@ObjectType()
export class AbsenteeInfo {
  @Field(() => AbsenteeMemberInfo)
  member: AbsenteeMemberInfo;

  @Field({ nullable: true })
  lastAttendance?: Date;

  @Field()
  consecutiveAbsences: number;

  @Field()
  isRegularAttender: boolean;

  @Field()
  attendanceRate: number;
}

@InputType()
export class SendAbsenteeMessageInput {
  @Field()
  organisationId: string;

  @Field()
  branchId: string;

  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  attendanceSessionId?: string;

  @Field(() => [String])
  memberIds: string[];

  @Field(() => AbsenteeMessageType)
  messageType: AbsenteeMessageType;

  @Field(() => String, { nullable: true })
  subject?: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class AbsenteeMessageResult {
  @Field()
  id: string;

  @Field()
  recipientCount: number;

  @Field()
  deliveredCount: number;

  @Field()
  failedCount: number;

  @Field()
  sentAt: Date;
}

@ObjectType()
export class MultiWeekAbsentee {
  @Field(() => AbsenteeMemberInfo)
  member: AbsenteeMemberInfo;

  @Field()
  consecutiveAbsences: number;

  @Field({ nullable: true })
  lastAttendance?: Date;
}
