import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class BankStatementEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  bankAccountId: string;

  @Field(() => String)
  fileUrl: string;

  @Field(() => String)
  fileName: string;

  @Field(() => Int)
  fileSize: number;

  @Field(() => String)
  fileType: string;

  @Field(() => Date)
  statementDate: Date;

  @Field({ nullable: true })
  statementPeriod?: string;

  @Field(() => String)
  uploadedBy: string;

  @Field(() => Date)
  uploadedAt: Date;

  @Field(() => String)
  organisationId: string;

  @Field(() => String)
  branchId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
