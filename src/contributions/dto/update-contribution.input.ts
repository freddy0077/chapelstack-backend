import { CreateContributionInput } from './create-contribution.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateContributionInput extends PartialType(
  CreateContributionInput,
) {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
