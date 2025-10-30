import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { OfferingBatchStatus, OfferingTypeEnum, Prisma } from '@prisma/client';
import { GraphQLJSON } from 'graphql-type-json';

registerEnumType(OfferingBatchStatus, { name: 'OfferingBatchStatus' });
registerEnumType(OfferingTypeEnum, { name: 'OfferingType' });

@ObjectType()
export class OfferingBatchEntity {
  @Field(() => ID)
  id: string;

  @Field()
  batchNumber: string;

  @Field()
  batchDate: Date;

  @Field()
  serviceName: string;

  @Field(() => String, { nullable: true })
  serviceId?: string | null;

  @Field(() => OfferingTypeEnum, { nullable: true, defaultValue: OfferingTypeEnum.GENERAL })
  offeringType?: OfferingTypeEnum;

  @Field(() => Float)
  cashAmount: number | Prisma.Decimal;

  @Field(() => Float)
  mobileMoneyAmount: number | Prisma.Decimal;

  @Field(() => Float)
  chequeAmount: number | Prisma.Decimal;

  @Field(() => Float)
  foreignCurrencyAmount: number | Prisma.Decimal;

  @Field(() => Float)
  totalAmount: number | Prisma.Decimal;

  @Field(() => GraphQLJSON, { nullable: true })
  cashDenominations?: any | null;

  @Field(() => GraphQLJSON, { nullable: true })
  counters?: any | null;

  @Field(() => [String])
  countedBy: string[];

  @Field(() => String, { nullable: true })
  verifierId?: string | null;

  @Field(() => String, { nullable: true })
  verifiedBy?: string | null;

  @Field(() => Date, { nullable: true })
  verifiedAt?: Date | null;

  @Field(() => String, { nullable: true })
  verificationNotes?: string | null;

  @Field(() => String, { nullable: true })
  approvedBy?: string | null;

  @Field(() => Date, { nullable: true })
  approvedAt?: Date | null;

  @Field(() => Float, { nullable: true })
  discrepancyAmount?: number | Prisma.Decimal | null;

  @Field(() => String, { nullable: true })
  discrepancyNotes?: string | null;

  @Field(() => Date, { nullable: true })
  depositDate?: Date | null;

  @Field(() => String, { nullable: true })
  depositSlipNumber?: string | null;

  @Field(() => OfferingBatchStatus)
  status: OfferingBatchStatus;

  @Field()
  isPostedToGL: boolean;

  @Field(() => String, { nullable: true })
  journalEntryId?: string | null;

  @Field()
  organisationId: string;

  @Field()
  branchId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  version?: number;
}

@ObjectType()
export class OfferingBatchListResponse {
  @Field(() => [OfferingBatchEntity])
  items: OfferingBatchEntity[];

  @Field(() => Float)
  totalCount: number;
}
