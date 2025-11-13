import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class AssetType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  defaultDepreciationRate?: number;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  customFields?: any;

  @Field({ nullable: true })
  branchId?: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => Int, { nullable: true })
  assetCount?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
