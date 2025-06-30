import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateVolunteerInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  role: string;

  @Field({ nullable: true, defaultValue: 'PENDING' })
  @IsString()
  @IsOptional()
  backgroundCheckStatus?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  trainingCompleted?: boolean;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}
