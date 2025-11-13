import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { AssetType } from './asset-type.entity';

@ObjectType()
export class Asset {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  assetCode: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String)
  assetTypeId: string;

  @Field(() => AssetType, { nullable: true })
  assetType?: AssetType;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field(() => Float, { nullable: true })
  purchasePrice?: number;

  @Field(() => Float, { nullable: true })
  currentValue?: number;

  @Field(() => Float, { nullable: true })
  depreciationRate?: number;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  assignedToMemberId?: string;

  @Field({ nullable: true })
  assignedToDepartment?: string;

  @Field(() => String)
  status: string;

  @Field({ nullable: true })
  condition?: string;

  @Field({ nullable: true })
  warrantyExpiryDate?: Date;

  @Field({ nullable: true })
  supplier?: string;

  @Field({ nullable: true })
  serialNumber?: string;

  @Field({ nullable: true })
  modelNumber?: string;

  @Field(() => [String])
  photos: string[];

  @Field(() => [String])
  attachments: string[];

  @Field({ nullable: true })
  notes?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  customData?: any;

  @Field({ nullable: true })
  branchId?: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
