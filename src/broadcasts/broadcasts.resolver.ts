import { Resolver, Query, Mutation, Args, ID, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import GraphQLJSON from 'graphql-type-json';
import { BroadcastsService } from './broadcasts.service';
import { BroadcastEntity } from './entities/broadcast.entity';
import { BroadcastPlatformEntity } from './entities/broadcast-platform.entity';
import { CreateBroadcastInput } from './dto/create-broadcast.input';
import { UpdateBroadcastInput } from './dto/update-broadcast.input';
import { BroadcastFilterInput } from './dto/broadcast-filter.input';
import { ConnectPlatformInput } from './dto/connect-platform.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StreamHealthMonitorService } from './services/stream-health-monitor.service';
import { StreamQualityMonitorService } from './services/stream-quality-monitor.service';
import { PlatformCredentialsService } from './services/platform-credentials.service';

@Resolver(() => BroadcastEntity)
@UseGuards(GqlAuthGuard, RolesGuard)
export class BroadcastsResolver {
  constructor(
    private readonly broadcastsService: BroadcastsService,
    private readonly healthMonitor: StreamHealthMonitorService,
    private readonly qualityMonitor: StreamQualityMonitorService,
    private readonly platformCredentials: PlatformCredentialsService,
  ) {}

  @Query(() => BroadcastEntity, { name: 'broadcast' })
  async getBroadcast(@Args('id', { type: () => ID }) id: string) {
    return this.broadcastsService.getBroadcast(id);
  }

  @Query(() => [BroadcastEntity], { name: 'broadcasts' })
  async listBroadcasts(@Args('filter') filter: BroadcastFilterInput) {
    return this.broadcastsService.listBroadcasts(filter);
  }

  @Query(() => [BroadcastEntity], { name: 'upcomingBroadcasts' })
  async getUpcomingBroadcasts(
    @Args('organisationId', { type: () => ID }) organisationId: string,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ) {
    return this.broadcastsService.getUpcomingBroadcasts(organisationId, branchId);
  }

  @Query(() => [BroadcastEntity], { name: 'liveBroadcasts' })
  async getLiveBroadcasts(
    @Args('organisationId', { type: () => ID }) organisationId: string,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ) {
    return this.broadcastsService.getLiveBroadcasts(organisationId, branchId);
  }

  @Mutation(() => BroadcastEntity)
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async createBroadcast(
    @Args('input') input: CreateBroadcastInput,
    @Context() context: any,
  ) {
    const userId = context?.req?.user?.id || context?.req?.user?.userId;
    const organisationId = context?.req?.user?.organisationId;
    if (!userId || !organisationId) {
      throw new Error('Missing user or organisation context');
    }
    return this.broadcastsService.createBroadcast(input, userId, organisationId);
  }

  @Mutation(() => BroadcastEntity)
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async updateBroadcast(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBroadcastInput,
  ) {
    return this.broadcastsService.updateBroadcast(id, input);
  }

  @Mutation(() => BroadcastEntity)
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async deleteBroadcast(@Args('id', { type: () => ID }) id: string) {
    return this.broadcastsService.deleteBroadcast(id);
  }

  @Mutation(() => BroadcastEntity)
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async startBroadcast(@Args('id', { type: () => ID }) id: string) {
    return this.broadcastsService.startBroadcast(id);
  }

  @Mutation(() => BroadcastEntity)
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async endBroadcast(@Args('id', { type: () => ID }) id: string) {
    return this.broadcastsService.endBroadcast(id);
  }

  @Mutation(() => BroadcastEntity)
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async cancelBroadcast(@Args('id', { type: () => ID }) id: string) {
    return this.broadcastsService.cancelBroadcast(id);
  }

  @Mutation(() => BroadcastPlatformEntity)
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async connectPlatform(
    @Args('broadcastId', { type: () => ID }) broadcastId: string,
    @Args('platform') platform: string,
    @Context() context: any,
  ) {
    const organisationId = context.req.user.organisationId;
    return this.broadcastsService.connectPlatform(
      broadcastId,
      platform,
      organisationId,
    );
  }

  @Mutation(() => Boolean)
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async disconnectPlatform(
    @Args('broadcastId', { type: () => ID }) broadcastId: string,
    @Args('platform') platform: string,
  ) {
    return this.broadcastsService.disconnectPlatform(broadcastId, platform);
  }

  // Monitoring Queries
  @Query(() => GraphQLJSON, { name: 'broadcastHealth' })
  async getBroadcastHealth(@Args('broadcastId', { type: () => ID }) broadcastId: string) {
    const results = await this.healthMonitor.checkBroadcastHealth(broadcastId);
    const score = await this.healthMonitor.getBroadcastHealthScore(broadcastId);
    
    return {
      score,
      platforms: results,
    };
  }

  @Query(() => [GraphQLJSON], { name: 'platformHealthHistory' })
  async getPlatformHealthHistory(
    @Args('platformId', { type: () => ID }) platformId: string,
    @Args('hours', { type: () => Int, nullable: true, defaultValue: 24 }) hours: number,
  ) {
    return this.healthMonitor.getPlatformHealthHistory(platformId, hours);
  }

  @Query(() => GraphQLJSON, { name: 'streamQuality' })
  async getStreamQuality(@Args('platformId', { type: () => ID }) platformId: string) {
    const broadcastPlatform = await this.broadcastsService.getBroadcastPlatform(platformId);
    if (!broadcastPlatform) {
      throw new Error('Platform not found');
    }

    const alerts = await this.qualityMonitor.checkPlatformQuality(
      broadcastPlatform.broadcastId,
      platformId,
    );

    // Get current metrics (simulated for now)
    const metrics = await this.qualityMonitor['getCurrentMetrics'](platformId);
    const score = this.qualityMonitor.calculateQualityScore(metrics);
    const recommendations = this.qualityMonitor.getRecommendations(metrics);

    return {
      ...metrics,
      score,
      alerts,
      recommendations,
    };
  }

  @Query(() => [GraphQLJSON], { name: 'qualityHistory' })
  async getQualityHistory(
    @Args('platformId', { type: () => ID }) platformId: string,
    @Args('hours', { type: () => Int, nullable: true, defaultValue: 24 }) hours: number,
  ) {
    return this.qualityMonitor.getQualityHistory(platformId, hours);
  }

  @Mutation(() => [GraphQLJSON], { name: 'forceHealthCheck' })
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN', 'PASTORAL')
  async forceHealthCheck(@Args('broadcastId', { type: () => ID }) broadcastId: string) {
    return this.healthMonitor.forceHealthCheck(broadcastId);
  }

  // Platform Credentials Management
  @Query(() => [GraphQLJSON], { name: 'connectedPlatforms' })
  async getConnectedPlatforms(@Context() context: any) {
    const organisationId = context.req.user.organisationId;
    return this.platformCredentials.getConnectedPlatforms(organisationId);
  }

  @Query(() => GraphQLJSON, { name: 'platformStatus' })
  async getPlatformStatus(
    @Args('platform') platform: string,
    @Context() context: any,
  ) {
    const organisationId = context.req.user.organisationId;
    return this.platformCredentials.getPlatformStatus(organisationId, platform);
  }

  @Mutation(() => GraphQLJSON, { name: 'connectStreamingPlatform' })
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async connectStreamingPlatform(
    @Args('input') input: ConnectPlatformInput,
    @Context() context: any,
  ) {
    const organisationId = context.req.user.organisationId;
    return this.platformCredentials.connectPlatform(organisationId, input);
  }

  @Mutation(() => Boolean, { name: 'disconnectStreamingPlatform' })
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async disconnectStreamingPlatform(
    @Args('platform') platform: string,
    @Context() context: any,
  ) {
    const organisationId = context.req.user.organisationId;
    return this.platformCredentials.disconnectPlatform(organisationId, platform);
  }
}
