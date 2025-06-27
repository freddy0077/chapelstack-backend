import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PledgesService } from './pledges.service';
import { Pledge } from './entities/pledge.entity';
import { CreatePledgeInput } from './dto/create-pledge.input';
import { UpdatePledgeInput } from './dto/update-pledge.input';

@Resolver(() => Pledge)
export class PledgesResolver {
  constructor(private readonly pledgesService: PledgesService) {}

  @Mutation(() => Pledge)
  createPledge(
    @Args('createPledgeInput') createPledgeInput: CreatePledgeInput,
  ) {
    return this.pledgesService.create(createPledgeInput);
  }

  @Query(() => [Pledge], { name: 'pledges' })
  findAll(
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
  ) {
    return this.pledgesService.findAll(organisationId);
  }

  @Query(() => Pledge, { name: 'pledge' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.pledgesService.findOne(id);
  }

  @Mutation(() => Pledge)
  updatePledge(
    @Args('updatePledgeInput') updatePledgeInput: UpdatePledgeInput,
  ) {
    return this.pledgesService.update(updatePledgeInput.id, updatePledgeInput);
  }

  @Mutation(() => Pledge)
  removePledge(@Args('id', { type: () => String }) id: string) {
    return this.pledgesService.remove(id);
  }
}
