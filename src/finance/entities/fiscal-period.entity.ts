import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { FiscalPeriodStatus } from '@prisma/client';

registerEnumType(FiscalPeriodStatus, { name: 'FiscalPeriodStatus' });

@ObjectType()
export class FiscalPeriodEntity {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  fiscalYear: number;

  @Field(() => Int)
  periodNumber: number;

  @Field(() => String)
  periodName: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => FiscalPeriodStatus)
  status: FiscalPeriodStatus;

  @Field(() => Boolean)
  isAdjustmentPeriod: boolean;

  @Field(() => Date, { nullable: true })
  closedAt?: Date | null;

  @Field(() => String, { nullable: true })
  closedBy?: string | null;

  @Field(() => String)
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
