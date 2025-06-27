import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateVolunteerAssignmentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  volunteerId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  role?: string;
}
