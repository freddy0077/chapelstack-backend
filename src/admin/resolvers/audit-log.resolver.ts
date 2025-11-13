import { Resolver, Query, Mutation, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogInput } from '../dto/create-audit-log.input';
import { AuditLogFilterInput } from '../dto/audit-log-filter.input';
import { PaginationInput } from '../../common/dto/pagination.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import GraphQLJSON from 'graphql-type-json';

/**
 * Response type for paginated audit logs
 */
@ObjectType()
export class AuditLogsResponse {
  @Field(() => [AuditLog])
  logs: AuditLog[];

  @Field(() => Number)
  total: number;

  @Field(() => Number)
  limit: number;

  @Field(() => Number)
  offset: number;
}

@Resolver(() => AuditLog)
@UseGuards(GqlAuthGuard, RolesGuard)
export class AuditLogResolver {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Mutation(() => AuditLog)
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  createAuditLog(@Args('input') createAuditLogInput: CreateAuditLogInput) {
    return this.auditLogService.create(createAuditLogInput);
  }

  @Query(() => AuditLog, { name: 'auditLog' })
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.auditLogService.findOne(id);
  }

  @Query(() => AuditLogsResponse, { name: 'auditLogs' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getAuditLogs(
    @CurrentUser() user: any,
    @Args('organisationId', { type: () => String }) organisationId: string,
    @Args('branchId', { type: () => String }) branchId: string,
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 50 })
    limit: number = 50,
    @Args('offset', { type: () => Number, nullable: true, defaultValue: 0 })
    offset: number = 0,
    @Args('filters', { type: () => AuditLogFilterInput, nullable: true })
    filters?: AuditLogFilterInput,
  ): Promise<AuditLogsResponse> {
    // Convert to integers for database operations
    const skip = Math.floor(offset);
    const take = Math.floor(limit);

    // Ensure user can only access their own branch's audit logs
    if (user.branchId && user.branchId !== branchId && user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Cannot access audit logs from other branches');
    }

    const result = await this.auditLogService.findAll(skip, take, {
      ...filters,
      branchId,
    });

    return {
      logs: result.items,
      total: result.totalCount,
      limit: take,
      offset: skip,
    };
  }
}
