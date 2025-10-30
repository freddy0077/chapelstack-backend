import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { BankAccountStatus, Prisma } from '@prisma/client';
import { AccountEntity } from './account.entity';

registerEnumType(BankAccountStatus, { name: 'BankAccountStatus' });

@ObjectType()
export class BankAccountEntity {
  @Field(() => ID)
  id: string;

  @Field()
  glAccountId: string;

  @Field()
  glAccountCode: string;

  @Field()
  glAccountName: string;

  @Field()
  accountName: string;

  @Field()
  bankName: string;

  @Field()
  accountNumber: string;

  @Field()
  accountType: string;

  @Field()
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

  @Field()
  isReconciled: boolean;

  @Field()
  organisationId: string;

  @Field()
  branchId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // GL Account relation
  @Field(() => AccountEntity, { nullable: true })
  glAccount?: AccountEntity;
}
