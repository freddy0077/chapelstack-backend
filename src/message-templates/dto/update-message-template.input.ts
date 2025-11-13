import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { TemplateCategory, MessageChannelType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateMessageTemplateInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => TemplateCategory, { nullable: true })
  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory;

  @Field(() => MessageChannelType, { nullable: true })
  @IsEnum(MessageChannelType)
  @IsOptional()
  type?: MessageChannelType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subject?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bodyText?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bodyHtml?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  variables?: any;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
