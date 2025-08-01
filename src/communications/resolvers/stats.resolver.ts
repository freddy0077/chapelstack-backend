import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { StatsService } from '../services/stats.service';
import {
  CommunicationStatsEntity,
  CommunicationChannelStats,
  RecipientGroupStats,
} from '../entities/communication-stats.entity';
import { MessagePerformanceEntity } from '../entities/message-performance.entity';
import { CommunicationStatsFilterInput } from '../dto/communication-stats-filter.input';

@Resolver(() => CommunicationStatsEntity)
export class StatsResolver {
  constructor(private readonly statsService: StatsService) {}

  @Query(() => CommunicationStatsEntity)
  async communicationStats(
    @Args('filter', { nullable: true }) filter?: CommunicationStatsFilterInput,
  ): Promise<CommunicationStatsEntity> {
    return this.statsService.getCommunicationStats(
      filter?.organisationId,
      filter?.branchId,
      filter?.startDate,
      filter?.endDate,
    );
  }

  @Query(() => [CommunicationChannelStats])
  async communicationChannelStats(
    @Args('filter', { nullable: true }) filter?: CommunicationStatsFilterInput,
  ): Promise<CommunicationChannelStats[]> {
    return this.statsService.getChannelStats(
      filter?.organisationId,
      filter?.branchId,
      filter?.startDate,
      filter?.endDate,
      filter?.channels,
    );
  }

  @Query(() => [RecipientGroupStats])
  async recipientGroupStats(
    @Args('filter', { nullable: true }) filter?: CommunicationStatsFilterInput,
  ): Promise<RecipientGroupStats[]> {
    return this.statsService.getRecipientGroupStats(
      filter?.organisationId,
      filter?.branchId,
      filter?.startDate,
      filter?.endDate,
    );
  }

  @Query(() => MessagePerformanceEntity)
  async messagePerformanceMetrics(
    @Args('filter', { nullable: true }) filter?: CommunicationStatsFilterInput,
  ): Promise<MessagePerformanceEntity> {
    return this.statsService.getMessagePerformanceMetrics(
      filter?.organisationId,
      filter?.branchId,
      filter?.startDate,
      filter?.endDate,
    );
  }
}
