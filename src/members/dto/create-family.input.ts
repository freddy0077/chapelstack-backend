import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateFamilyInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsUUID('4', { each: true })
  memberIds?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  customFields?: any;
}
