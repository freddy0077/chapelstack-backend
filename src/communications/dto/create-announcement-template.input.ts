import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateAnnouncementTemplateInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  category: string;

  @Field()
  @IsString()
  content: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
