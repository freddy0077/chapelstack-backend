import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateEmailTemplateInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  subject: string;

  @Field()
  @IsString()
  bodyHtml: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bodyText?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
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
