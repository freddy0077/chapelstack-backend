import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateBankAccountInput {
  @Field({ nullable: true })
  accountName?: string;

  @Field({ nullable: true })
  bankName?: string;

  @Field({ nullable: true })
  accountNumber?: string;

  @Field({ nullable: true })
  accountType?: string;

  @Field({ nullable: true })
  currency?: string;
}
