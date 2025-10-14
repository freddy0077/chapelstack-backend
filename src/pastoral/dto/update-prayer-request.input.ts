import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PrayerStatus } from '../entities/prayer-request.entity';

@InputType()
export class UpdatePrayerRequestInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => PrayerStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PrayerStatus)
  status?: PrayerStatus;

  @Field({ nullable: true })
  @IsOptional()
  answeredDescription?: string;
}
