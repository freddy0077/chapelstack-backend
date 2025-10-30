import { ObjectType, Field, Float, ID } from '@nestjs/graphql';

/**
 * Public DTO for Account
 * Controls what data is exposed to clients
 * Excludes sensitive internal fields
 */

@ObjectType()
export class AccountPublicDTO {
  @Field(() => ID)
  id: string;

  @Field()
  accountCode: string;

  @Field()
  accountName: string;

  @Field()
  accountType: string;

  @Field({ nullable: true })
  accountSubType?: string;

  @Field()
  normalBalance: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  parentAccountId?: string;

  @Field({ nullable: true })
  fundId?: string;

  @Field({ nullable: true })
  ministryId?: string;

  @Field()
  isActive: boolean;

  @Field()
  isRestricted: boolean;

  @Field({ nullable: true })
  currency?: string;

  @Field(() => Float)
  balance: number;

  @Field()
  isBankAccount: boolean;

  @Field({ nullable: true })
  bankAccountId?: string;

  // ===== EXCLUDED FIELDS =====
  // - createdBy (internal tracking)
  // - updatedBy (internal tracking)
  // - createdAt (not needed by client)
  // - updatedAt (not needed by client)
  // - notes (internal notes only)
  // - isSystemAccount (internal flag)
  // - organisationId (already in context)
  // - branchId (already in context)
  // - deletedAt (soft delete internal)
  // - deletedBy (soft delete internal)
}

/**
 * Map database entity to public DTO
 */
export function mapToAccountPublicDTO(entity: any): AccountPublicDTO {
  return {
    id: entity.id,
    accountCode: entity.accountCode,
    accountName: entity.accountName,
    accountType: entity.accountType,
    accountSubType: entity.accountSubType,
    normalBalance: entity.normalBalance,
    description: entity.description,
    parentAccountId: entity.parentAccountId,
    fundId: entity.fundId,
    ministryId: entity.ministryId,
    isActive: entity.isActive,
    isRestricted: entity.isRestricted,
    currency: entity.currency,
    balance: Number(entity.balance || 0),
    isBankAccount: entity.isBankAccount || false,
    bankAccountId: entity.bankAccountId,
  };
}

/**
 * Map array of entities to public DTOs
 */
export function mapToAccountPublicDTOs(entities: any[]): AccountPublicDTO[] {
  return entities.map(mapToAccountPublicDTO);
}

/**
 * Account Summary DTO (for dropdowns and lists)
 * Even more restricted - only essential fields
 */
@ObjectType()
export class AccountSummaryDTO {
  @Field(() => ID)
  id: string;

  @Field()
  accountCode: string;

  @Field()
  accountName: string;

  @Field()
  accountType: string;

  @Field()
  isActive: boolean;

  @Field(() => Float)
  balance: number;
}

/**
 * Map to account summary
 */
export function mapToAccountSummaryDTO(entity: any): AccountSummaryDTO {
  return {
    id: entity.id,
    accountCode: entity.accountCode,
    accountName: entity.accountName,
    accountType: entity.accountType,
    isActive: entity.isActive,
    balance: Number(entity.balance || 0),
  };
}

/**
 * Map array to account summaries
 */
export function mapToAccountSummaryDTOs(entities: any[]): AccountSummaryDTO[] {
  return entities.map(mapToAccountSummaryDTO);
}
