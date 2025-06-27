import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class AssignRfidCardInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  rfidCardId: string;
}
