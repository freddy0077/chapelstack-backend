import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreatePrayerRequestInput } from './create-prayer-request.input';
import { PrayerRequestStatusEnum } from '../prayer-request-status.enum';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';

@InputType()
export class UpdatePrayerRequestInput extends PartialType(
  CreatePrayerRequestInput,
) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requestText?: string;

  @Field(() => PrayerRequestStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(PrayerRequestStatusEnum)
  status?: PrayerRequestStatusEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedPastorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organisationId?: string;
}
