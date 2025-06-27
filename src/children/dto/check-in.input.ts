import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CheckInInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  childId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  eventId?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  checkedInById: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  guardianIdAtCheckIn: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}
