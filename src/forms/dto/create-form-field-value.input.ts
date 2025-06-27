import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateFormFieldValueInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  fieldId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fileUrl?: string;
}
