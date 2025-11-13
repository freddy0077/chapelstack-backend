import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

/**
 * Public DTO for Journal Entry
 * Controls what data is exposed to clients
 * Excludes sensitive internal fields
 */

@ObjectType()
export class AccountDTO {
  @Field(() => ID)
  id: string;

  @Field()
  accountCode: string;

  @Field()
  accountName: string;

  @Field()
  accountType: string;
}

@ObjectType()
export class JournalEntryLinePublicDTO {
  @Field(() => ID)
  id: string;

  @Field()
  lineNumber: number;

  @Field()
  accountId: string;

  @Field(() => AccountDTO, { nullable: true })
  account?: AccountDTO;

  @Field({ nullable: true })
  accountCode?: string;

  @Field({ nullable: true })
  accountName?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  debitAmount: number;

  @Field(() => Float)
  creditAmount: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  fundId?: string;

  @Field({ nullable: true })
  ministryId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

@ObjectType()
export class JournalEntryPublicDTO {
  @Field(() => ID)
  id: string;

  @Field()
  journalEntryNumber: string;

  @Field()
  entryDate: Date;

  @Field({ nullable: true })
  postingDate?: Date;

  @Field()
  entryType: string;

  @Field({ nullable: true })
  sourceModule?: string;

  @Field({ nullable: true })
  sourceTransactionId?: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  reference?: string;

  @Field({ nullable: true })
  memo?: string;

  @Field()
  fiscalYear: number;

  @Field()
  fiscalPeriod: number;

  @Field()
  status: string;

  @Field()
  organisationId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field(() => Float)
  totalDebit: number;

  @Field(() => Float)
  totalCredit: number;

  @Field(() => [JournalEntryLinePublicDTO])
  lines: JournalEntryLinePublicDTO[];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  postedAt?: Date;

  @Field({ nullable: true })
  postedBy?: string;
}

/**
 * Map database entity to public DTO
 */
export function mapToJournalEntryPublicDTO(entity: any): JournalEntryPublicDTO {
  // Calculate totals from lines
  let totalDebit = 0;
  let totalCredit = 0;
  
  if (entity.lines && entity.lines.length > 0) {
    entity.lines.forEach((line: any) => {
      totalDebit += Number(line.debitAmount || 0);
      totalCredit += Number(line.creditAmount || 0);
    });
  }

  return {
    id: entity.id,
    journalEntryNumber: entity.journalEntryNumber,
    entryDate: entity.entryDate,
    postingDate: entity.postingDate,
    entryType: entity.entryType,
    sourceModule: entity.sourceModule,
    sourceTransactionId: entity.sourceTransactionId,
    description: entity.description,
    reference: entity.reference,
    memo: entity.memo,
    fiscalYear: entity.fiscalYear,
    fiscalPeriod: entity.fiscalPeriod,
    status: entity.status,
    organisationId: entity.organisationId,
    branchId: entity.branchId,
    totalDebit,
    totalCredit,
    lines: entity.lines?.map((line: any) => ({
      id: line.id,
      lineNumber: line.lineNumber,
      accountId: line.accountId,
      account: line.account ? {
        id: line.account.id,
        accountCode: line.account.accountCode,
        accountName: line.account.accountName,
        accountType: line.account.accountType,
      } : undefined,
      accountCode: line.account?.accountCode,
      accountName: line.account?.accountName,
      description: line.description,
      debitAmount: Number(line.debitAmount),
      creditAmount: Number(line.creditAmount),
      currency: line.currency,
      fundId: line.fundId,
      ministryId: line.ministryId,
      memberId: line.memberId,
    })) || [],
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    createdBy: entity.createdBy,
    postedAt: entity.postedAt,
    postedBy: entity.postedBy,
  };
}

/**
 * Map array of entities to public DTOs
 */
export function mapToJournalEntryPublicDTOs(entities: any[]): JournalEntryPublicDTO[] {
  return entities.map(mapToJournalEntryPublicDTO);
}
