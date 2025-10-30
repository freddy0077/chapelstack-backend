import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class BankStatementEntity {
  @Field(() => ID)
  id: string;

  @Field()
  bankAccountId: string;

  @Field()
  fileUrl: string;

  @Field()
  fileName: string;

  @Field(() => Int)
  fileSize: number;

  @Field()
  fileType: string;

  @Field()
  statementDate: Date;

  @Field({ nullable: true })
  statementPeriod?: string;

  @Field()
  uploadedBy: string;

  @Field()
  uploadedAt: Date;

  @Field()
  organisationId: string;

  @Field()
  branchId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
