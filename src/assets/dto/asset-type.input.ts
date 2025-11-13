import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateAssetTypeInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  defaultDepreciationRate?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  customFields?: any;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field()
  @IsString()
  organisationId: string;
}

@InputType()
export class UpdateAssetTypeInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  defaultDepreciationRate?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  customFields?: any;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;
}
