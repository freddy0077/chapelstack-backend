import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateFamilyRelationshipInput } from './create-family-relationship.input';

@InputType()
export class UpdateFamilyRelationshipInput extends PartialType(
  CreateFamilyRelationshipInput,
) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
