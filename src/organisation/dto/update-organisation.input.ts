import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateOrganisationInput } from './create-organisation.input';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateOrganisationInput extends PartialType(
  CreateOrganisationInput,
) {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  secondaryColor?: string;
}
