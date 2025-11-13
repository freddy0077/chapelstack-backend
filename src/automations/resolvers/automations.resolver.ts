import { Resolver, Query, Mutation, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AutomationsService } from '../services/automations.service';
import { AutomationConfig } from '../entities/automation-config.entity';
import { AutomationLog } from '../entities/automation-log.entity';
import { CreateAutomationConfigInput } from '../dto/create-automation-config.input';
import { UpdateAutomationConfigInput } from '../dto/update-automation-config.input';
import { AutomationConfigFiltersInput } from '../dto/automation-config-filters.input';
import { AutomationLogsFiltersInput } from '../dto/automation-logs-filters.input';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import GraphQLJSON from 'graphql-type-json';

/**
 * Response type for paginated automation logs
 */
@ObjectType()
export class AutomationLogsResponse {
  @Field(() => [AutomationLog])
  logs: AutomationLog[];

  @Field(() => Number)
  total: number;

  @Field(() => Number)
  limit: number;

  @Field(() => Number)
  offset: number;
}

@Resolver(() => AutomationConfig)
@UseGuards(GqlAuthGuard)
export class AutomationsResolver {
  constructor(private automationsService: AutomationsService) {}

  @Query(() => [AutomationConfig], { name: 'automationConfigs' })
  async getAutomationConfigs(
    @CurrentUser() user: any,
    @Args('filters', { type: () => AutomationConfigFiltersInput, nullable: true })
    filters?: AutomationConfigFiltersInput,
  ): Promise<any[]> {
    return this.automationsService.findAll(
      user.organisationId,
      user.branchId,
      filters,
    );
  }

  @Query(() => AutomationConfig, { name: 'automationConfig' })
  async getAutomationConfig(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<any> {
    return this.automationsService.findOne(id, user.organisationId, user.branchId);
  }

  @Query(() => GraphQLJSON, { name: 'automationStats' })
  async getAutomationStats(
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.automationsService.getStats(user.organisationId, user.branchId);
  }

  @Mutation(() => AutomationConfig)
  async createAutomationConfig(
    @CurrentUser() user: any,
    @Args('input') input: CreateAutomationConfigInput,
  ): Promise<any> {
    return this.automationsService.create(
      input,
      user.organisationId,
      user.branchId,
      user.id,
    );
  }

  @Mutation(() => AutomationConfig)
  async updateAutomationConfig(
    @CurrentUser() user: any,
    @Args('input') input: UpdateAutomationConfigInput,
  ): Promise<any> {
    return this.automationsService.update(
      input,
      user.organisationId,
      user.branchId,
    );
  }

  @Mutation(() => GraphQLJSON)
  async deleteAutomationConfig(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.automationsService.delete(id, user.organisationId, user.branchId);
  }

  @Mutation(() => AutomationConfig)
  async toggleAutomationEnabled(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<any> {
    return this.automationsService.toggleEnabled(
      id,
      user.organisationId,
      user.branchId,
    );
  }

  @Query(() => AutomationLogsResponse, { name: 'automationLogs' })
  async getAutomationLogs(
    @CurrentUser() user: any,
    @Args('filters', { type: () => AutomationLogsFiltersInput, nullable: true })
    filters?: AutomationLogsFiltersInput,
  ): Promise<any> {
    return this.automationsService.getLogs(
      user.organisationId,
      user.branchId,
      filters,
    );
  }
}
