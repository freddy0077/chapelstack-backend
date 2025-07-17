import { Field, InputType, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { BirthdayRangeEnum } from './member-filter.input';

@InputType()
export class SendEmailInput {
  @Field(() => [String])
  @IsArray()
  @IsUUID('all', { each: true })
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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  groupIds?: string[];

  @Field(() => BirthdayRangeEnum, { nullable: true })
  @IsOptional()
  birthdayRange?: BirthdayRangeEnum;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  scheduledAt?: Date;

  @Field(() => [String], {
    nullable: true,
    description:
      'Advanced recipient filters such as "all-members", "volunteers", etc.',
  })
  @IsOptional()
  filters?: string[];
}
