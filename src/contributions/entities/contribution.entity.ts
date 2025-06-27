import { ObjectType, Field, Float } from '@nestjs/graphql';
import { ContributionType } from 'src/contribution-types/contribution-type.entity';
import { Fund } from 'src/funds/entities/fund.entity';
import { Member } from 'src/members/entities/member.entity';
import { PaymentMethod } from 'src/payment-methods/payment-method.entity';

@ObjectType()
export class Contribution {
  @Field(() => String)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Date)
  date: Date;

  @Field(() => String)
  contributionTypeId: string;

  @Field(() => ContributionType, { nullable: true })
  contributionType?: ContributionType;

  @Field(() => String)
  paymentMethodId: string;

  @Field(() => PaymentMethod, { nullable: true })
  paymentMethod?: PaymentMethod;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  memberId?: string;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => Boolean, { nullable: true })
  anonymous?: boolean;

  @Field(() => String)
  fundId: string;

  @Field(() => Fund, { nullable: true })
  fund?: Fund;

  @Field(() => String, { nullable: true })
  pledgeId?: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  organisationId?: string;
}
