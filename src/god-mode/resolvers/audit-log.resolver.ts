import {
  Resolver,
  Query,
  Args,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuditLogService } from '../services/audit-log.service';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class AuditLogType {
  @Field()
  id: string;

  @Field({ nullable: true })
  userId: string;

  @Field()
  action: string;

  @Field()
  entityType: string;

  @Field({ nullable: true })
  entityId: string;

  @Field()
  description: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata: any;

  @Field({ nullable: true })
  ipAddress: string;

  @Field({ nullable: true })
  userAgent: string;

  @Field({ nullable: true })
  branchId: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class AuditLogsResponseType {
  @Field(() => [AuditLogType])
  logs: AuditLogType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
export class AuditStatisticsType {
  @Field(() => Int)
  totalLogs: number;

  @Field(() => Int)
  successfulActions: number;

  @Field(() => Int)
  failedActions: number;

  @Field()
  successRate: string;

  @Field(() => String)
  actionsByType: string;
}

@InputType()
export class AuditLogFilterInputType {
  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  action?: string;

  @Field({ nullable: true })
  entityType?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => Int, { nullable: true })
  take?: number;
}

@Resolver()
export class AuditLogResolver {
  constructor(private auditLogService: AuditLogService) {}

  @Query(() => AuditLogsResponseType, { name: 'godModeAuditLogs' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getAuditLogs(
    @Args('filter', { nullable: true }) filter: AuditLogFilterInputType,
    @Context() context: any,
  ) {
    return this.auditLogService.getAuditLogs(filter || {});
  }

  @Query(() => String, { name: 'godModeAuditLog' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN', 'ADMIN')
  async getAuditLog(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const log = await this.auditLogService.getAuditLogById(id);
    return JSON.stringify(log);
  }

  @Query(() => String, { name: 'godModeUserAuditTrail' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getUserAuditTrail(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 50,
    @Context() context: any,
  ) {
    const trail = await this.auditLogService.getUserAuditTrail(userId, limit);
    return JSON.stringify(trail);
  }

  @Query(() => String, { name: 'godModeEntityAuditTrail' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getEntityAuditTrail(
    @Args('entityType') entityType: string,
    @Args('entityId') entityId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 50,
    @Context() context: any,
  ) {
    const trail = await this.auditLogService.getEntityAuditTrail(entityType, entityId, limit);
    return JSON.stringify(trail);
  }

  @Query(() => AuditStatisticsType, { name: 'godModeAuditStatistics' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getAuditStatistics(
    @Context() context: any,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    const stats = await this.auditLogService.getAuditStatistics(startDate, endDate);
    return {
      totalLogs: stats.totalLogs,
      successfulActions: stats.successfulActions,
      failedActions: stats.failedActions,
      successRate: stats.successRate,
      actionsByType: JSON.stringify(stats.actionsByType),
    };
  }

  @Query(() => AuditLogsResponseType, { name: 'godModeSearchAuditLogs' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async searchAuditLogs(
    @Args('query') query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 20,
    @Context() context: any,
  ) {
    return this.auditLogService.searchAuditLogs(query, skip, take);
  }

  @Query(() => String, { name: 'godModeExportAuditLogs' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async exportAuditLogs(
    @Args('filter', { nullable: true }) filter: AuditLogFilterInputType,
    @Args('format', { nullable: true }) format: 'csv' | 'json' = 'csv',
    @Context() context: any,
  ) {
    return this.auditLogService.exportAuditLogs(filter || {}, format);
  }
}
