import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from '../../base/common/base.entity';

export enum MilestoneType {
  SALVATION = 'SALVATION',
  BAPTISM = 'BAPTISM',
  CONFIRMATION = 'CONFIRMATION',
  FIRST_COMMUNION = 'FIRST_COMMUNION',
  MARRIAGE = 'MARRIAGE',
  DEDICATION = 'DEDICATION',
  ORDINATION = 'ORDINATION',
  LEADERSHIP = 'LEADERSHIP',
  MINISTRY_START = 'MINISTRY_START',
  SPIRITUAL_BREAKTHROUGH = 'SPIRITUAL_BREAKTHROUGH',
  OTHER = 'OTHER',
}

registerEnumType(MilestoneType, {
  name: 'MilestoneType',
  description: 'Type of spiritual milestone',
});

@ObjectType('SpiritualMilestone')
export class SpiritualMilestoneEntity extends BaseEntity {
  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field(() => MilestoneType)
  type: MilestoneType;

  @Field(() => Date)
  milestoneDate: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  officiant?: string; // Pastor/minister who officiated

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [String], { nullable: true })
  attachments?: string[]; // URLs to photos, certificates, etc.

  @Field({ nullable: true })
  certificateUrl?: string;

  @Field(() => ID)
  createdBy: string;

  @Field({ nullable: true })
  createdByName?: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => ID)
  organisationId: string;

  @Field({ nullable: true })
  witnesses?: string; // Names of witnesses

  @Field({ defaultValue: false })
  isPublic: boolean; // Whether to display publicly
}
