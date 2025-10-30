import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UploadBankStatementInput {
  @Field()
  bankAccountId: string;

  @Field()
  statementDate: Date;

  @Field({ nullable: true })
  statementPeriod?: string;

  @Field()
  organisationId: string;

  @Field()
  branchId: string;
}
