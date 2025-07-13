import { Field, Int, ObjectType } from '@nestjs/graphql';
import { TransferRequest } from '../entities/transfer-request.entity';

@ObjectType()
export class PaginatedTransferRequests {
  @Field(() => [TransferRequest])
  items: TransferRequest[];

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Int)
  totalCount: number;
}
