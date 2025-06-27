import { Field, InputType, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

@InputType()
export class SendEmailInput {
  @Field(() => [String])
  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];

  @Field()
  @IsString()
  subject: string;

  @Field({ nullable: true })
  @IsString()
  @ValidateIf((o) => !o.templateId)
  bodyHtml?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bodyText?: string;

  @Field({ nullable: true })
  @IsUUID()
  @ValidateIf((o) => !o.bodyHtml)
  templateId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  templateData?: Record<string, any>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
