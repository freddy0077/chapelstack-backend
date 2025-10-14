import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { CreatePastoralVisitInput } from './create-pastoral-visit.input';

@InputType()
export class UpdatePastoralVisitInput extends PartialType(
  CreatePastoralVisitInput,
) {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;
}
