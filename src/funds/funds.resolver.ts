import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FundsService } from './funds.service';
import { Fund } from './entities/fund.entity';
import { CreateFundInput } from './dto/create-fund.input';
import { UpdateFundInput } from './dto/update-fund.input';

@Resolver(() => Fund)
export class FundsResolver {
  constructor(private readonly fundsService: FundsService) {}

  @Mutation(() => Fund)
  createFund(@Args('createFundInput') createFundInput: CreateFundInput) {
    return this.fundsService.create(createFundInput);
  }

  @Query(() => [Fund], { name: 'funds' })
  findAll(
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
  ) {
    return this.fundsService.findAll(organisationId);
  }

  @Query(() => Fund, { name: 'fund' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.fundsService.findOne(id);
  }

  @Mutation(() => Fund)
  updateFund(@Args('updateFundInput') updateFundInput: UpdateFundInput) {
    return this.fundsService.update(updateFundInput.id, updateFundInput);
  }

  @Mutation(() => Fund)
  removeFund(@Args('id', { type: () => String }) id: string) {
    return this.fundsService.remove(id);
  }
}
