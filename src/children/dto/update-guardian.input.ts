import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateGuardianInput } from './create-guardian.input';

@InputType()
export class UpdateGuardianInput extends PartialType(CreateGuardianInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
