import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { BankAccountStatus, Prisma } from '@prisma/client';
import { AccountEntity } from './account.entity';

registerEnumType(BankAccountStatus, { name: 'BankAccountStatus' });

@ObjectType()
export class BankAccountEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  glAccountId: string;

  @Field(() => String)
  glAccountCode: string;

  @Field(() => String)
  glAccountName: string;

  @Field(() => String)
  accountName: string;

  @Field(() => String)
  bankName: string;

  @Field(() => String)
  accountNumber: string;

  @Field(() => String)
  accountType: string;

  @Field(() => String)
  currency: string;

  @Field(() => Float)
  bankBalance: number | Prisma.Decimal;

  @Field(() => Float)
  bookBalance: number | Prisma.Decimal;

  @Field(() => Float)
  difference: number | Prisma.Decimal;

  @Field(() => Date, { nullable: true })
  lastReconciled?: Date | null;

  @Field(() => BankAccountStatus)
  status: BankAccountStatus;

  @Field(() => Boolean)
  isReconciled: boolean;

  @Field(() => String)
  organisationId: string;

  @Field(() => String)
  branchId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // GL Account relation
  @Field(() => AccountEntity, { nullable: true })
  glAccount?: AccountEntity;
}
