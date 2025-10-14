import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreatePrayerRequestInput {
  @Field(() => ID)
  @IsNotEmpty()
  memberId: string;

  @Field()
  @IsNotEmpty()
  requestText: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  assignedPastorId?: string;

  // Legacy fields for backward compatibility
  @Field({ nullable: true })
  @IsOptional()
  description?: string;
}
