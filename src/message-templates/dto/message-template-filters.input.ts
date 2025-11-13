import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { TemplateCategory, MessageChannelType } from '@prisma/client';

@InputType()
export class MessageTemplateFiltersInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => TemplateCategory, { nullable: true })
  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory;

  @Field(() => MessageChannelType, { nullable: true })
  @IsEnum(MessageChannelType)
  @IsOptional()
  type?: MessageChannelType;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;
}
