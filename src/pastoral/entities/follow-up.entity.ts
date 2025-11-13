import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from '../../base/common/base.entity';

export enum FollowUpType {
  VISIT = 'VISIT',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  TEXT = 'TEXT',
  COUNSELING = 'COUNSELING',
  CHECK_IN = 'CHECK_IN',
  PRAYER = 'PRAYER',
  OTHER = 'OTHER',
}

export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

registerEnumType(FollowUpType, {
  name: 'FollowUpType',
  description: 'Type of follow-up action',
});

registerEnumType(FollowUpStatus, {
  name: 'FollowUpStatus',
  description: 'Status of follow-up',
});

@ObjectType('FollowUp')
export class FollowUpEntity extends BaseEntity {
  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field(() => FollowUpType)
  type: FollowUpType;

  @Field(() => Date)
  dueDate: Date;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => FollowUpStatus, { defaultValue: FollowUpStatus.PENDING })
  status: FollowUpStatus;

  @Field({ nullable: true })
  completedDate?: Date;

  @Field({ nullable: true })
  completedNotes?: string;

  @Field(() => ID)
  assignedTo: string;

  @Field({ nullable: true })
  assignedToName?: string;

  @Field(() => ID)
  createdBy: string;

  @Field({ nullable: true })
  createdByName?: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => ID)
  organisationId: string;

  @Field({ nullable: true })
  linkedVisitId?: string; // Link to pastoral visit if applicable

  @Field({ nullable: true })
  linkedPrayerRequestId?: string; // Link to prayer request if applicable

  @Field({ defaultValue: false })
  reminderSent: boolean;

  @Field({ nullable: true })
  reminderSentAt?: Date;
}
