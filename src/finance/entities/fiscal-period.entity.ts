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

  @Field()
  periodName: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => FiscalPeriodStatus)
  status: FiscalPeriodStatus;

  @Field()
  isAdjustmentPeriod: boolean;

  @Field(() => Date, { nullable: true })
  closedAt?: Date | null;

  @Field(() => String, { nullable: true })
  closedBy?: string | null;

  @Field()
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
