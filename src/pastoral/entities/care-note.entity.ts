import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from '../../base/common/base.entity';

export enum CareNoteCategory {
  COUNSELING = 'COUNSELING',
  SPIRITUAL_GROWTH = 'SPIRITUAL_GROWTH',
  CONCERN = 'CONCERN',
  MILESTONE = 'MILESTONE',
  GENERAL = 'GENERAL',
  CRISIS = 'CRISIS',
  FOLLOW_UP = 'FOLLOW_UP',
  PRAYER = 'PRAYER',
}

export enum CareNotePrivacy {
  PRIVATE = 'PRIVATE', // Only creator can see
  PASTORAL_TEAM = 'PASTORAL_TEAM', // All pastoral staff can see
  LEADERSHIP = 'LEADERSHIP', // Leadership team can see
}

registerEnumType(CareNoteCategory, {
  name: 'CareNoteCategory',
  description: 'Category of care note',
});

registerEnumType(CareNotePrivacy, {
  name: 'CareNotePrivacy',
  description: 'Privacy level of care note',
});

@ObjectType('CareNote')
export class CareNoteEntity extends BaseEntity {
  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field(() => Date)
  noteDate: Date;

  @Field(() => CareNoteCategory)
  category: CareNoteCategory;

  @Field(() => String)
  content: string; // Should be encrypted in production

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  linkedVisitId?: string; // Link to pastoral visit

  @Field({ nullable: true })
  linkedPrayerRequestId?: string; // Link to prayer request

  @Field(() => CareNotePrivacy, { defaultValue: CareNotePrivacy.PRIVATE })
  privacyLevel: CareNotePrivacy;

  @Field(() => ID)
  createdBy: string;

  @Field({ nullable: true })
  createdByName?: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => ID)
  organisationId: string;

  @Field({ defaultValue: false })
  isArchived: boolean;

  @Field({ nullable: true })
  archivedAt?: Date;
}
