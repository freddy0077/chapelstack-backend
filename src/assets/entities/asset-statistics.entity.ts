import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AssetStatistics {
  @Field(() => Int)
  totalAssets: number;

  @Field(() => Int)
  activeAssets: number;

  @Field(() => Int)
  disposedAssets: number;

  @Field(() => Int)
  inMaintenanceAssets: number;

  @Field(() => Float)
  totalValue: number;

  @Field(() => Float)
  totalPurchaseValue: number;

  @Field(() => Float)
  totalDepreciation: number;
}

@ObjectType()
export class AssetsByType {
  @Field(() => String)
  assetTypeId: string;

  @Field(() => String)
  assetTypeName: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  totalValue: number;
}
