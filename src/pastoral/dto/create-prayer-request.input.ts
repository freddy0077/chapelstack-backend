import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import {
  PrayerCategory,
  PrayerPriority,
  PrayerStatus,
  PrivacyLevel,
} from '../entities/prayer-request.entity';

@InputType()
export class CreatePrayerRequestInput {
  @Field(() => ID)
  @IsNotEmpty()
  memberId: string;

  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  description: string;

  @Field(() => PrayerCategory)
  @IsEnum(PrayerCategory)
  category: PrayerCategory;

  @Field(() => PrayerPriority, { nullable: true, defaultValue: PrayerPriority.NORMAL })
  @IsOptional()
  @IsEnum(PrayerPriority)
  priority?: PrayerPriority;

  @Field(() => PrivacyLevel, { nullable: true, defaultValue: PrivacyLevel.PUBLIC })
  @IsOptional()
  @IsEnum(PrivacyLevel)
  privacyLevel?: PrivacyLevel;
}
