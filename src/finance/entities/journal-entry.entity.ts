import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { JournalEntryType, JournalEntryStatus } from '@prisma/client';

registerEnumType(JournalEntryType, { name: 'JournalEntryType' });
registerEnumType(JournalEntryStatus, { name: 'JournalEntryStatus' });

@ObjectType()
export class JournalEntryEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  journalEntryNumber: string;

  @Field(() => Date)
  entryDate: Date;

  @Field(() => JournalEntryType)
  entryType: JournalEntryType;

  @Field(() => String)
  sourceModule: string;

  @Field(() => String, { nullable: true })
  sourceTransactionId?: string | null;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  reference?: string | null;

  @Field(() => Int)
  fiscalYear: number;

  @Field(() => Int)
  fiscalPeriod: number;

  @Field(() => JournalEntryStatus)
  status: JournalEntryStatus;

  @Field(() => Date, { nullable: true })
  postingDate?: Date | null;

  @Field(() => Boolean)
  isReversed: boolean;

  // Void Tracking
  @Field(() => String, { nullable: true })
  voidedBy?: string | null;

  @Field(() => Date, { nullable: true })
  voidedAt?: Date | null;

  @Field(() => String, { nullable: true })
  voidReason?: string | null;

  // Creator
  @Field(() => String, { nullable: true })
  createdBy?: string | null;

  @Field(() => String, { nullable: true })
  postedBy?: string | null;

  @Field(() => String)
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Int, { nullable: true })
  version?: number;

  // Calculated fields
  @Field(() => Float, { nullable: true })
  totalDebit?: number;

  @Field(() => Float, { nullable: true })
  totalCredit?: number;
}

@ObjectType()
export class JournalEntryListResponse {
  @Field(() => [JournalEntryEntity])
  items: JournalEntryEntity[];

  @Field(() => Int)
  totalCount: number;
}
