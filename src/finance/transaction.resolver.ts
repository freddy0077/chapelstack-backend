import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import { TransactionType } from '@prisma/client';

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Mutation(() => Transaction)
  createTransaction(@Args('input') input: CreateTransactionInput) {
    return this.transactionService.create(input);
  }

  @Query(() => [Transaction], { name: 'transactions' })
  findAll(
    @Args('organisationId', { nullable: true }) organisationId?: string,
    @Args('type', { nullable: true }) type?: TransactionType,
    @Args('fundId', { nullable: true }) fundId?: string,
  ) {
    // If type is provided as a string (from client), cast to TransactionType if valid
    let parsedType: TransactionType | undefined = undefined;
    if (type && typeof type === 'string') {
      if (Object.values(TransactionType).includes(type as TransactionType)) {
        parsedType = type as TransactionType;
      }
    } else if (type) {
      parsedType = type;
    }
    return this.transactionService.findAll({ organisationId, type: parsedType, fundId });
  }

  @Query(() => Transaction, { name: 'transaction' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.transactionService.findOne(id);
  }

  @Mutation(() => Transaction)
  updateTransaction(@Args('input') input: UpdateTransactionInput) {
    return this.transactionService.update(input.id, input);
  }

  @Mutation(() => Transaction)
  removeTransaction(@Args('id', { type: () => ID }) id: string) {
    return this.transactionService.remove(id);
  }
}
