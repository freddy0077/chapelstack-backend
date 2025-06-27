import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateVolunteerInput } from './create-volunteer.input';

@InputType()
export class UpdateVolunteerInput extends PartialType(CreateVolunteerInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
