import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { FollowUpType } from '../entities/follow-up.entity';

@InputType()
export class CreateFollowUpInput {
  @Field(() => ID)
  @IsNotEmpty()
  memberId: string;

  @Field(() => FollowUpType)
  @IsEnum(FollowUpType)
  type: FollowUpType;

  @Field()
  @IsNotEmpty()
  dueDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  assignedTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  linkedVisitId?: string;

  @Field({ nullable: true })
  @IsOptional()
  linkedPrayerRequestId?: string;
}
