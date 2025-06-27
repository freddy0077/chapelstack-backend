import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Expense {
  @Field(() => String)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Date)
  date: Date;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  receiptNumber?: string;

  @Field(() => String, { nullable: true })
  invoiceNumber?: string;

  @Field(() => String)
  expenseCategoryId: string;

  @Field(() => String)
  fundId: string;

  @Field(() => String)
  paymentMethodId: string;

  @Field(() => String, { nullable: true })
  vendorId?: string;

  @Field(() => String, { nullable: true })
  vendorName?: string;

  @Field(() => String, { nullable: true })
  vendorContact?: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  organisationId?: string;

  @Field(() => String, { nullable: true })
  budgetId?: string;
}
