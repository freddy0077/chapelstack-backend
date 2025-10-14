import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from '../../base/common/base.entity';

export enum PrayerCategory {
  HEALTH = 'HEALTH',
  FAMILY = 'FAMILY',
  WORK = 'WORK',
  SPIRITUAL = 'SPIRITUAL',
  FINANCIAL = 'FINANCIAL',
  RELATIONSHIP = 'RELATIONSHIP',
  GUIDANCE = 'GUIDANCE',
  THANKSGIVING = 'THANKSGIVING',
  OTHER = 'OTHER',
}

export enum PrayerPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
}

export enum PrayerStatus {
  ACTIVE = 'ACTIVE',
  ANSWERED = 'ANSWERED',
  ONGOING = 'ONGOING',
  ARCHIVED = 'ARCHIVED',
}

export enum PrivacyLevel {
  PUBLIC = 'PUBLIC',
  LEADERSHIP = 'LEADERSHIP',
  PRIVATE = 'PRIVATE',
}

registerEnumType(PrayerCategory, {
  name: 'PrayerCategory',
  description: 'Category of prayer request',
});

registerEnumType(PrayerPriority, {
  name: 'PrayerPriority',
  description: 'Priority level of prayer request',
});

registerEnumType(PrayerStatus, {
  name: 'PrayerStatus',
  description: 'Status of prayer request',
});

registerEnumType(PrivacyLevel, {
  name: 'PrivacyLevel',
  description: 'Privacy level of prayer request',
});

@ObjectType('PrayerRequest')
export class PrayerRequestEntity extends BaseEntity {
  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => PrayerCategory)
  category: PrayerCategory;

  @Field(() => PrayerPriority, { defaultValue: PrayerPriority.NORMAL })
  priority: PrayerPriority;

  @Field(() => PrayerStatus, { defaultValue: PrayerStatus.ACTIVE })
  status: PrayerStatus;

  @Field(() => PrivacyLevel, { defaultValue: PrivacyLevel.PUBLIC })
  privacyLevel: PrivacyLevel;

  @Field({ nullable: true })
  answeredDate?: Date;

  @Field({ nullable: true })
  answeredDescription?: string;

  @Field(() => [String], { nullable: true })
  notes?: string[]; // Prayer updates/notes

  @Field(() => ID)
  createdBy: string;

  @Field({ nullable: true })
  createdByName?: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => ID)
  organisationId: string;

  @Field({ defaultValue: 0 })
  prayerCount: number; // Number of people who prayed

  @Field(() => [ID], { nullable: true })
  prayedBy?: string[]; // User IDs who prayed for this request
}
