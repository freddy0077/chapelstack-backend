import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Asset } from './asset.entity';
import { Member } from '../../members/entities/member.entity';

@ObjectType()
export class AssetDisposal {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  assetId: string;

  @Field(() => Asset, { nullable: true })
  asset?: Asset;

  @Field(() => Date)
  disposalDate: Date;

  @Field(() => String)
  disposalMethod: string;

  @Field({ nullable: true })
  disposalReason?: string;

  @Field(() => Float, { nullable: true })
  salePrice?: number;

  @Field({ nullable: true })
  buyerRecipient?: string;

  @Field({ nullable: true })
  approvedByMemberId?: string;

  @Field(() => Member, { nullable: true })
  approvedByMember?: Member;

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

  @Field(() => String)
  organisationId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
