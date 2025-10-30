import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { AccountType, AccountSubType, BalanceType } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(AccountType, { name: 'AccountType' });
registerEnumType(AccountSubType, { name: 'AccountSubType' });
registerEnumType(BalanceType, { name: 'BalanceType' });

@ObjectType()
export class AccountEntity {
  @Field(() => ID)
  id: string;

  @Field()
  accountCode: string;

  @Field()
  accountName: string;

  @Field(() => AccountType)
  accountType: AccountType;

  @Field(() => AccountSubType, { nullable: true })
  accountSubType?: AccountSubType | null;

  @Field(() => BalanceType)
  normalBalance: BalanceType;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => String, { nullable: true })
  parentAccountId?: string | null;

  @Field(() => String, { nullable: true })
  fundId?: string | null;

  @Field(() => String, { nullable: true })
  ministryId?: string | null;

  @Field()
  isActive: boolean;

  @Field()
  isSystemAccount: boolean;

  @Field(() => Boolean, { nullable: true })
  isRestricted?: boolean | null;

  @Field()
  currency: string;

  // Bank Integration
  @Field({ nullable: true, defaultValue: false })
  isBankAccount?: boolean;

  @Field(() => String, { nullable: true })
  bankAccountId?: string | null;

  @Field()
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => String, { nullable: true })
  createdBy?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Calculated field
  @Field(() => Number, { nullable: true })
  balance?: number;
}
