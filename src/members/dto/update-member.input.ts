import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateMemberInput } from './create-member.input';

@InputType()
export class UpdateMemberInput extends PartialType(CreateMemberInput) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
