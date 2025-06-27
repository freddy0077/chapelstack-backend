import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

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
