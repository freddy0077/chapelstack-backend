import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

@InputType()
export class DisableOrganizationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Suspension reason must be at least 10 characters long',
  })
  @MaxLength(500, {
    message: 'Suspension reason must not exceed 500 characters',
  })
  reason: string;
}
