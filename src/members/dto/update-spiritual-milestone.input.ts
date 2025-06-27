import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateSpiritualMilestoneInput } from './create-spiritual-milestone.input';

@InputType()
export class UpdateSpiritualMilestoneInput extends PartialType(
  CreateSpiritualMilestoneInput,
) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
