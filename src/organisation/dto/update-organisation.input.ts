import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateOrganisationInput } from './create-organisation.input';

@InputType()
export class UpdateOrganisationInput extends PartialType(CreateOrganisationInput) {
  @Field(() => ID)
  id: string;
}
