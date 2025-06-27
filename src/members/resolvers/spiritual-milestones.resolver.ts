import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SpiritualMilestonesService } from '../services/spiritual-milestones.service';
import { SpiritualMilestone } from '../entities/spiritual-milestone.entity';
import { CreateSpiritualMilestoneInput } from '../dto/create-spiritual-milestone.input';
import { UpdateSpiritualMilestoneInput } from '../dto/update-spiritual-milestone.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { IpAddress, UserAgent } from '../../common/decorators';

@Resolver(() => SpiritualMilestone)
export class SpiritualMilestonesResolver {
  constructor(
    private readonly spiritualMilestonesService: SpiritualMilestonesService,
  ) {}

  @Mutation(() => SpiritualMilestone)
  async createSpiritualMilestone(
    @Args('createSpiritualMilestoneInput')
    createSpiritualMilestoneInput: CreateSpiritualMilestoneInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<SpiritualMilestone> {
    return this.spiritualMilestonesService.create(
      createSpiritualMilestoneInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => [SpiritualMilestone], { name: 'spiritualMilestones' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 10 })
    take: number,
  ): Promise<SpiritualMilestone[]> {
    return this.spiritualMilestonesService.findAll(skip, take);
  }

  @Query(() => SpiritualMilestone, { name: 'spiritualMilestone' })
  async findOne(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<SpiritualMilestone> {
    return this.spiritualMilestonesService.findOne(id);
  }

  @Query(() => [SpiritualMilestone], { name: 'spiritualMilestonesByMember' })
  async findByMember(
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
  ): Promise<SpiritualMilestone[]> {
    return this.spiritualMilestonesService.findByMember(memberId);
  }

  @Mutation(() => SpiritualMilestone)
  async updateSpiritualMilestone(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('updateSpiritualMilestoneInput')
    updateSpiritualMilestoneInput: UpdateSpiritualMilestoneInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<SpiritualMilestone> {
    return this.spiritualMilestonesService.update(
      id,
      updateSpiritualMilestoneInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  async removeSpiritualMilestone(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.spiritualMilestonesService.remove(
      id,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => Int, { name: 'spiritualMilestonesCount' })
  async count(): Promise<number> {
    return this.spiritualMilestonesService.count();
  }
}
