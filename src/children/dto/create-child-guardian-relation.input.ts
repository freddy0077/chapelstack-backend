import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateChildGuardianRelationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  childId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  guardianId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  relationship: string;
}
