import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from '../../base/common/base.entity';

export enum VisitType {
  HOME_VISIT = 'HOME_VISIT',
  HOSPITAL = 'HOSPITAL',
  COUNSELING = 'COUNSELING',
  PHONE_CALL = 'PHONE_CALL',
  VIDEO_CALL = 'VIDEO_CALL',
  OTHER = 'OTHER',
}

export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

registerEnumType(VisitType, {
  name: 'VisitType',
  description: 'Type of pastoral visit',
});

registerEnumType(VisitStatus, {
  name: 'VisitStatus',
  description: 'Status of pastoral visit',
});

@ObjectType('PastoralVisit')
export class PastoralVisitEntity extends BaseEntity {
  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field(() => VisitType)
  visitType: VisitType;

  @Field(() => Date)
  visitDate: Date;

  @Field({ nullable: true })
  duration?: number; // Duration in minutes

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string; // Should be encrypted in production

  @Field({ defaultValue: false })
  followUpRequired: boolean;

  @Field({ nullable: true })
  nextVisitDate?: Date;

  @Field(() => VisitStatus, { defaultValue: VisitStatus.SCHEDULED })
  status: VisitStatus;

  @Field(() => ID)
  createdBy: string;

  @Field({ nullable: true })
  createdByName?: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => ID)
  organisationId: string;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  cancelledReason?: string;
}
