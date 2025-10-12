import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Asset } from './asset.entity';

@ObjectType()
export class AssetDisposal {
  @Field(() => ID)
  id: string;

  @Field()
  assetId: string;

  @Field(() => Asset, { nullable: true })
  asset?: Asset;

  @Field()
  disposalDate: Date;

  @Field()
  disposalMethod: string;

  @Field({ nullable: true })
  disposalReason?: string;

  @Field(() => Float, { nullable: true })
  salePrice?: number;

  @Field({ nullable: true })
  buyerRecipient?: string;

  @Field({ nullable: true })
  approvedByMemberId?: string;

  @Field({ nullable: true })
  disposalNotes?: string;

  @Field(() => Float, { nullable: true })
  bookValueAtDisposal?: number;

  @Field(() => Float, { nullable: true })
  gainLossOnDisposal?: number;

  @Field(() => [String])
  documents: string[];

  @Field({ nullable: true })
  branchId?: string;

  @Field()
  organisationId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
