import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { AccountType, AccountSubType, BalanceType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

// Register enums for GraphQL
registerEnumType(AccountType, { name: 'AccountType' });
registerEnumType(AccountSubType, { name: 'AccountSubType' });
registerEnumType(BalanceType, { name: 'BalanceType' });

@InputType()
export class CreateAccountInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  accountCode: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @Field(() => AccountType)
  @IsEnum(AccountType)
  @IsNotEmpty()
  accountType: AccountType;

  @Field(() => AccountSubType, { nullable: true })
  @IsEnum(AccountSubType)
  @IsOptional()
  accountSubType?: AccountSubType;

  @Field(() => BalanceType)
  @IsEnum(BalanceType)
  @IsNotEmpty()
  normalBalance: BalanceType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parentAccountId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ministryId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isRestricted?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  createdBy: string;
}

@InputType()
export class UpdateAccountInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  accountName?: string;

  @Field(() => AccountSubType, { nullable: true })
  @IsEnum(AccountSubType)
  @IsOptional()
  accountSubType?: AccountSubType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parentAccountId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ministryId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isRestricted?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}

@InputType()
export class GetChartOfAccountsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @Field(() => AccountType, { nullable: true })
  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;
}
