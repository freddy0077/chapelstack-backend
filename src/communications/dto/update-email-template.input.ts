import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { CreateEmailTemplateInput } from './create-email-template.input';

@InputType()
export class UpdateEmailTemplateInput extends PartialType(
  CreateEmailTemplateInput,
) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subject?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bodyHtml?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bodyText?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
