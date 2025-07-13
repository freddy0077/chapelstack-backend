import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

registerEnumType(TransferStatus, {
  name: 'TransferStatus',
  description: 'Status of a member transfer request',
});

export enum TransferDataType {
  PERSONAL = 'personal',
  SACRAMENTS = 'sacraments',
  MINISTRIES = 'ministries',
  DONATION_HISTORY = 'donation_history',
}

registerEnumType(TransferDataType, {
  name: 'TransferDataType',
  description: 'Types of data to transfer with the member',
});

@ObjectType()
export class TransferRequest {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => String)
  memberName: string;

  @Field(() => ID)
  sourceBranchId: string;

  @Field(() => String)
  sourceBranchName: string;

  @Field(() => ID)
  destinationBranchId: string;

  @Field(() => String)
  destinationBranchName: string;

  @Field(() => GraphQLISODateTime)
  requestDate: Date;

  @Field(() => TransferStatus)
  status: TransferStatus;

  @Field(() => String)
  reason: string;

  @Field(() => [TransferDataType])
  transferData: TransferDataType[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  approvedDate?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  rejectedDate?: Date;

  @Field(() => String, { nullable: true })
  rejectionReason?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  completedDate?: Date;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
