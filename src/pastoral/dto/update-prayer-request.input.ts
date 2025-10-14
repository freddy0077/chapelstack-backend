import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PrayerRequestStatus } from '@prisma/client';

@InputType()
export class UpdatePrayerRequestInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  requestText?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(PrayerRequestStatus)
  status?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  assignedPastorId?: string;
}
