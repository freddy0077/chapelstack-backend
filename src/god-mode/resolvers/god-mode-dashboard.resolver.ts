import { Resolver, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GodModeDashboardService } from '../services/god-mode-dashboard.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class SystemHealthMetricsType {
  @Field()
  status: string;

  @Field(() => Float)
  uptime: number;

  @Field(() => Float)
  avgResponseTime: number;

  @Field(() => Float)
  errorRate: number;

  @Field()
  databaseStatus: string;

  @Field()
  databaseSize: string;
}

@ObjectType()
export class SystemLoadType {
  @Field(() => Float)
  cpu: number;

  @Field(() => Float)
  memory: number;

  @Field(() => Float)
  disk: number;
}

@ObjectType()
export class KeyMetricsType {
  @Field(() => Int)
  totalUsers: number;

  @Field(() => Float)
  userGrowth: number;

  @Field(() => Int)
  totalOrganizations: number;

  @Field(() => Float)
  organizationGrowth: number;

  @Field(() => Int)
  activeSubscriptions: number;

  @Field(() => Float)
  monthlyRecurringRevenue: number;

  @Field(() => SystemLoadType)
  systemLoad: SystemLoadType;
}

@ObjectType()
export class GodModeDashboardType {
  @Field(() => SystemHealthMetricsType)
  systemHealth: SystemHealthMetricsType;

  @Field(() => KeyMetricsType)
  keyMetrics: KeyMetricsType;

  @Field(() => [String])
  recentActivities: string[];

  @Field(() => [String])
  alerts: string[];
}

@Resolver()
export class GodModeDashboardResolver {
  constructor(
    private godModeDashboardService: GodModeDashboardService,
    private auditLogService: AuditLogService,
  ) {}

  @Query(() => GodModeDashboardType, { name: 'godModeDashboard' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getDashboard(
    @CurrentUser() user: any,
  ) {
    // Log God Mode dashboard access
    try {
      await this.auditLogService.create({
        action: 'ACCESS_GOD_MODE_DASHBOARD',
        entityType: 'GOD_MODE',
        entityId: 'dashboard',
        description: `User accessed God Mode dashboard`,
        userId: user?.id,
        branchId: user?.branchId,
        metadata: {
          userEmail: user?.email,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('[GodModeDashboard] Failed to log access:', error);
      // Don't throw - audit logging failure shouldn't block the request
    }

    const overview = await this.godModeDashboardService.getDashboardOverview();
    return {
      systemHealth: overview.systemHealth,
      keyMetrics: overview.keyMetrics,
      recentActivities: overview.recentActivities.map((a) => JSON.stringify(a)),
      alerts: overview.alerts.map((a) => JSON.stringify(a)),
    };
  }

  @Query(() => String, { name: 'godModeSystemStats' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getSystemStats(
    @CurrentUser() user: any,
  ) {
    // Log system stats access
    try {
      await this.auditLogService.create({
        action: 'ACCESS_GOD_MODE_STATS',
        entityType: 'GOD_MODE',
        entityId: 'system-stats',
        description: `User accessed God Mode system statistics`,
        userId: user?.id,
        branchId: user?.branchId,
        metadata: {
          userEmail: user?.email,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('[GodModeDashboard] Failed to log stats access:', error);
      // Don't throw - audit logging failure shouldn't block the request
    }

    const stats = await this.godModeDashboardService.getSystemStatistics();
    return JSON.stringify(stats);
  }
}
