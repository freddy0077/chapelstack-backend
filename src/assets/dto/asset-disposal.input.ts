import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsDateString, IsArray, Min } from 'class-validator';

@InputType()
export class CreateAssetDisposalInput {
  @Field()
  @IsString()
  assetId: string;

  @Field()
  @IsDateString()
  disposalDate: Date;

  @Field()
  @IsString()
  disposalMethod: string; // SOLD, DONATED, SCRAPPED, LOST, STOLEN, DAMAGED

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  disposalReason?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  buyerRecipient?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  approvedByMemberId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  disposalNotes?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  bookValueAtDisposal?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  documents?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field()
  @IsString()
  organisationId: string;
}

@InputType()
export class AssetDisposalFilterInput {
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
  disposalMethod?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
