import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { TemplateCategory, MessageChannelType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateMessageTemplateInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => TemplateCategory)
  @IsEnum(TemplateCategory)
  @IsNotEmpty()
  category: TemplateCategory;

  @Field(() => MessageChannelType)
  @IsEnum(MessageChannelType)
  @IsNotEmpty()
  type: MessageChannelType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subject?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  bodyText: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bodyHtml?: string;

  @Field(() => GraphQLJSON)
  variables: any; // Array of template variables

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;
}
