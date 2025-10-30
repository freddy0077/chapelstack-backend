import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { JournalEntryType, JournalEntryStatus } from '@prisma/client';

registerEnumType(JournalEntryType, { name: 'JournalEntryType' });
registerEnumType(JournalEntryStatus, { name: 'JournalEntryStatus' });

@ObjectType()
export class JournalEntryEntity {
  @Field(() => ID)
  id: string;

  @Field()
  journalEntryNumber: string;

  @Field()
  entryDate: Date;

  @Field(() => JournalEntryType)
  entryType: JournalEntryType;

  @Field()
  sourceModule: string;

  @Field(() => String, { nullable: true })
  sourceTransactionId?: string | null;

  @Field()
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

  @Field()
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

  @Field()
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field()
  createdAt: Date;

  @Field()
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
