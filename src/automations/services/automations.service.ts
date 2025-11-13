import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAutomationConfigInput } from '../dto/create-automation-config.input';
import { UpdateAutomationConfigInput } from '../dto/update-automation-config.input';
import { AutomationConfigFiltersInput } from '../dto/automation-config-filters.input';
import { AutomationLogsFiltersInput } from '../dto/automation-logs-filters.input';
import { AutomationStatus } from '@prisma/client';
import { AuditLogService } from '../../audit/services/audit-log.service';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new automation configuration
   */
  async create(
    input: CreateAutomationConfigInput,
    organisationId: string,
    branchId: string,
    userId: string,
  ) {
    const automation = await this.prisma.automationConfig.create({
      data: {
        name: input.name,
        description: input.description,
        type: input.type,
        status: AutomationStatus.INACTIVE,
        isEnabled: input.isEnabled ?? false,
        triggerType: input.triggerType,
        schedule: input.schedule,
        triggerConfig: input.triggerConfig,
        templateId: input.templateId,
        channels: input.channels,
        organisationId,
        branchId: input.branchId || branchId,
        createdBy: userId,
      },
      include: {
        template: true,
      },
    });

    // Log automation creation - scoped to automation's branch
    try {
      await this.auditLogService.create({
        action: 'CREATE_AUTOMATION',
        entityType: 'AutomationConfig',
        entityId: automation.id,
        description: `Automation created: ${automation.name}`,
        userId: userId,
        branchId: automation.branchId || undefined, // 🔒 Branch-scoped: log belongs to automation's branch
        metadata: {
          name: automation.name,
          type: automation.type,
          triggerType: automation.triggerType,
          channels: automation.channels,
        },
      });
    } catch (auditError) {
      this.logger.error(
        `Failed to create audit log for automation ${automation.id}: ${(auditError as Error).message}`,
      );
    }

    return automation;
  }

  /**
   * Find all automation configs with optional filters
   * Filters by organisation and branch
   */
  async findAll(
    organisationId: string,
    branchId: string,
    filters?: AutomationConfigFiltersInput,
  ) {
    const where: any = {
      organisationId,
      branchId: filters?.branchId || branchId,
    };

    if (filters) {
      if (filters.search) {
        where.AND = [
          {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        ];
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.triggerType) {
        where.triggerType = filters.triggerType;
      }

      if (filters.isEnabled !== undefined) {
        where.isEnabled = filters.isEnabled;
      }
    }

    return this.prisma.automationConfig.findMany({
      where,
      include: {
        template: true,
      },
      orderBy: [
        { isEnabled: 'desc' }, // Enabled first
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Find a single automation config by ID
   */
  async findOne(id: string, organisationId: string, branchId: string) {
    const config = await this.prisma.automationConfig.findFirst({
      where: {
        id,
        organisationId,
        branchId,
      },
      include: {
        template: true,
        logs: {
          take: 10,
          orderBy: { executedAt: 'desc' },
        },
      },
    });

    if (!config) {
      throw new NotFoundException(`Automation config with ID ${id} not found`);
    }

    return config;
  }

  /**
   * Update an automation config
   */
  async update(
    input: UpdateAutomationConfigInput,
    organisationId: string,
    branchId: string,
    userId?: string,
  ) {
    // Check if config exists and belongs to organization and branch
    const existing = await this.findOne(input.id, organisationId, branchId);

    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.triggerType !== undefined) updateData.triggerType = input.triggerType;
    if (input.schedule !== undefined) updateData.schedule = input.schedule;
    if (input.triggerConfig !== undefined) updateData.triggerConfig = input.triggerConfig;
    if (input.templateId !== undefined) updateData.templateId = input.templateId;
    if (input.channels !== undefined) updateData.channels = input.channels;
    if (input.isEnabled !== undefined) {
      updateData.isEnabled = input.isEnabled;
      // Update status based on enabled state
      if (input.isEnabled && input.status === undefined) {
        updateData.status = AutomationStatus.ACTIVE;
      } else if (!input.isEnabled && input.status === undefined) {
        updateData.status = AutomationStatus.INACTIVE;
      }
    }

    const automation = await this.prisma.automationConfig.update({
      where: { id: input.id },
      data: updateData,
      include: {
        template: true,
      },
    });

    // Log automation update - scoped to automation's branch
    try {
      await this.auditLogService.create({
        action: 'UPDATE_AUTOMATION',
        entityType: 'AutomationConfig',
        entityId: automation.id,
        description: `Automation updated: ${automation.name}`,
        userId: userId,
        branchId: automation.branchId || undefined, // 🔒 Branch-scoped: log belongs to automation's branch
        metadata: {
          name: automation.name,
          changes: updateData,
        },
      });
    } catch (auditError) {
      this.logger.error(
        `Failed to create audit log for automation ${automation.id}: ${(auditError as Error).message}`,
      );
    }

    return automation;
  }

  /**
   * Delete an automation config
   */
  async delete(id: string, organisationId: string, branchId: string, userId?: string) {
    // Check if config exists and belongs to organization and branch
    const automation = await this.findOne(id, organisationId, branchId);

    await this.prisma.automationConfig.delete({
      where: { id },
    });

    // Log automation deletion - scoped to automation's branch
    try {
      await this.auditLogService.create({
        action: 'DELETE_AUTOMATION',
        entityType: 'AutomationConfig',
        entityId: id,
        description: `Automation deleted: ${automation.name}`,
        userId: userId,
        branchId: automation.branchId || undefined, // 🔒 Branch-scoped: log belongs to automation's branch
        metadata: {
          name: automation.name,
          type: automation.type,
        },
      });
    } catch (auditError) {
      this.logger.error(
        `Failed to create audit log for automation ${id}: ${(auditError as Error).message}`,
      );
    }

    return { success: true, message: 'Automation deleted successfully' };
  }

  /**
   * Toggle automation enabled state
   */
  async toggleEnabled(id: string, organisationId: string, branchId: string) {
    const config = await this.findOne(id, organisationId, branchId);

    return this.prisma.automationConfig.update({
      where: { id },
      data: {
        isEnabled: !config.isEnabled,
        status: !config.isEnabled ? AutomationStatus.ACTIVE : AutomationStatus.INACTIVE,
      },
      include: {
        template: true,
      },
    });
  }

  /**
   * Get automation statistics
   */
  async getStats(organisationId: string, branchId: string) {
    const [total, active, inactive, paused] = await Promise.all([
      this.prisma.automationConfig.count({
        where: { organisationId, branchId },
      }),
      this.prisma.automationConfig.count({
        where: { organisationId, branchId, status: AutomationStatus.ACTIVE },
      }),
      this.prisma.automationConfig.count({
        where: { organisationId, branchId, status: AutomationStatus.INACTIVE },
      }),
      this.prisma.automationConfig.count({
        where: { organisationId, branchId, status: AutomationStatus.PAUSED },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      paused,
    };
  }

  /**
   * Get automation logs with optional filters
   * Returns logs for all automations in the organization and branch
   */
  async getLogs(
    organisationId: string,
    branchId: string,
    filters?: AutomationLogsFiltersInput,
  ) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const where: any = {
      automation: {
        organisationId,
        branchId,
      },
    };

    if (filters?.automationId) {
      where.automationId = filters.automationId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const [logs, total] = await Promise.all([
      this.prisma.automationLog.findMany({
        where,
        include: {
          automation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { executedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.automationLog.count({ where }),
    ]);

    // Transform logs to include automationName
    const transformedLogs = logs.map((log) => ({
      ...log,
      automationName: log.automation.name,
      failureCount: log.failedCount,
      completedAt: log.executedAt, // Use executedAt as completedAt for now
      details: log.metadata,
    }));

    return {
      logs: transformedLogs,
      total,
      limit,
      offset,
    };
  }
}
