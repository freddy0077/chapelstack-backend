import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsDate, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateAssetInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  assetTypeId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  purchaseDate?: Date;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentValue?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  depreciationRate?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assignedToMemberId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assignedToDepartment?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  condition?: string;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  warrantyExpiryDate?: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  supplier?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  modelNumber?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  customData?: any;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field()
  @IsString()
  organisationId: string;
}

@InputType()
export class UpdateAssetInput {
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
  assetTypeId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  purchaseDate?: Date;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentValue?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  depreciationRate?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assignedToMemberId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assignedToDepartment?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  condition?: string;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  warrantyExpiryDate?: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  supplier?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  modelNumber?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  customData?: any;
}

@InputType()
export class AssetFilterInput {
  @Field()
  @IsString()
  organisationId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assetTypeId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  condition?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assignedToMemberId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}
