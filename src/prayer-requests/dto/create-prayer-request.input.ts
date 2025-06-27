import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PrayerRequestStatusEnum } from '../prayer-request-status.enum';

@InputType()
export class CreatePrayerRequestInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => ID)
  @IsUUID()
  branchId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  requestText: string;

  @Field(() => ID)
  @IsUUID()
  organisationId: string;
}
