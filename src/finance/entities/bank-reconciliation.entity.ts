import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ReconciliationStatus, Prisma } from '@prisma/client';
import { GraphQLJSON } from 'graphql-type-json';

registerEnumType(ReconciliationStatus, { name: 'ReconciliationStatus' });

@ObjectType()
export class BankReconciliationEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  bankAccountId: string;

  @Field(() => Date)
  reconciliationDate: Date;

  @Field(() => Float)
  bankStatementBalance: number | Prisma.Decimal;

  @Field(() => Float)
  bookBalance: number | Prisma.Decimal;

  @Field(() => Float)
  adjustedBalance: number | Prisma.Decimal;

  @Field(() => Float)
  difference: number | Prisma.Decimal;

  @Field(() => GraphQLJSON)
  clearedTransactions: any;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => String)
  reconciledBy: string;

  @Field(() => Date)
  reconciledAt: Date;

  @Field(() => ReconciliationStatus)
  status: ReconciliationStatus;

  // Maker-Checker Fields
  @Field(() => String, { nullable: true })
  preparedBy?: string | null;

  @Field(() => String, { nullable: true })
  reviewedBy?: string | null;

  @Field(() => Date, { nullable: true })
  reviewedAt?: Date | null;

  @Field(() => String, { nullable: true })
  approvedBy?: string | null;

  @Field(() => Date, { nullable: true })
  approvedAt?: Date | null;

  // Supporting Documentation
  @Field(() => String, { nullable: true })
  bankStatementFileUrl?: string | null;

  @Field(() => String)
  organisationId: string;

  @Field(() => String)
  branchId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Int, { nullable: true })
  version?: number;
}
