import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

/**
 * Public DTO for Journal Entry
 * Controls what data is exposed to clients
 * Excludes sensitive internal fields
 */

@ObjectType()
export class JournalEntryLinePublicDTO {
  @Field(() => ID)
  id: string;

  @Field()
  accountId: string;

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

  @Field(() => Float)
  totalDebit: number;

  @Field(() => Float)
  totalCredit: number;

  @Field(() => [JournalEntryLinePublicDTO])
  lines: JournalEntryLinePublicDTO[];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  postedAt?: Date;

  @Field({ nullable: true })
  postedBy?: string;

  // ===== EXCLUDED FIELDS =====
  // - createdBy (internal tracking)
  // - updatedBy (internal tracking)
  // - updatedAt (not needed by client)
  // - version (internal concurrency control)
  // - organisationId (already in context)
  // - branchId (already in context)
  // - deletedAt (soft delete internal)
  // - deletedBy (soft delete internal)
}

/**
 * Map database entity to public DTO
 */
export function mapToJournalEntryPublicDTO(entity: any): JournalEntryPublicDTO {
  return {
    id: entity.id,
    journalEntryNumber: entity.journalEntryNumber,
    entryDate: entity.entryDate,
    entryType: entity.entryType,
    sourceModule: entity.sourceModule,
    sourceTransactionId: entity.sourceTransactionId,
    description: entity.description,
    reference: entity.reference,
    memo: entity.memo,
    fiscalYear: entity.fiscalYear,
    fiscalPeriod: entity.fiscalPeriod,
    status: entity.status,
    totalDebit: Number(entity.totalDebit || 0),
    totalCredit: Number(entity.totalCredit || 0),
    lines: entity.lines?.map((line: any) => ({
      id: line.id,
      accountId: line.accountId,
      accountCode: line.account?.accountCode,
      accountName: line.account?.accountName,
      description: line.description,
      debitAmount: Number(line.debitAmount),
      creditAmount: Number(line.creditAmount),
      fundId: line.fundId,
      ministryId: line.ministryId,
      memberId: line.memberId,
    })) || [],
    createdAt: entity.createdAt,
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
