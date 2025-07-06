import { Field, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/dto/paginated.dto';
import { Transaction } from '../entities/transaction.entity';
import { TransactionStats } from './transaction-stats.dto';

@ObjectType()
export class PaginatedTransaction extends Paginated(Transaction) {
  @Field(() => TransactionStats, { nullable: true })
  stats?: TransactionStats;
}
