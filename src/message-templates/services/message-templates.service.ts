import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageTemplateInput } from '../dto/create-message-template.input';
import { UpdateMessageTemplateInput } from '../dto/update-message-template.input';
import { MessageTemplateFiltersInput } from '../dto/message-template-filters.input';
import { AuditLogService } from '../../audit/services/audit-log.service';

@Injectable()
export class MessageTemplatesService {
  private readonly logger = new Logger(MessageTemplatesService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new message template
   */
  async create(
    input: CreateMessageTemplateInput,
    organisationId: string,
    branchId: string,
    userId: string,
  ) {
    const template = await this.prisma.messageTemplate.create({
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        type: input.type,
        subject: input.subject,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml,
        variables: input.variables || [], // Default to empty array if not provided
        isActive: input.isActive ?? true,
        isSystem: false, // User-created templates are never system templates
        organisationId,
        branchId: input.branchId || branchId,
        createdBy: userId,
      },
    });

    // Log template creation - scoped to template's branch (or null for system templates)
    try {
      await this.auditLogService.create({
        action: 'CREATE_TEMPLATE',
        entityType: 'MessageTemplate',
        entityId: template.id,
        description: `Message template created: ${template.name}`,
        userId: userId,
        branchId: template.branchId || undefined, // 🔒 Branch-scoped: log belongs to template's branch (null for system templates)
        metadata: {
          name: template.name,
          category: template.category,
          type: template.type,
          isSystem: template.isSystem,
        },
      });
    } catch (auditError) {
      this.logger.error(
        `Failed to create audit log for template ${template.id}: ${(auditError as Error).message}`,
      );
    }

    return template;
  }

  /**
   * Find all templates with optional filters
   * Returns templates that belong to the organisation and either:
   * - Are system templates (branchId is null)
   * - Belong to the user's branch
   * - Match the branchId filter if provided
   */
  async findAll(
    organisationId: string,
    branchId: string,
    filters?: MessageTemplateFiltersInput,
  ) {
    const where: any = {
      organisationId,
      OR: [
        { isSystem: true, branchId: null }, // System templates
        { branchId: filters?.branchId || branchId }, // User's branch or filtered branch
      ],
    };

    if (filters) {
      if (filters.search) {
        where.AND = [
          {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
              { bodyText: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        ];
      }

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.isSystem !== undefined) {
        where.isSystem = filters.isSystem;
      }
    }

    return this.prisma.messageTemplate.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' }, // System templates first
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Find a single template by ID
   */
  async findOne(id: string, organisationId: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: {
        id,
        organisationId,
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Update a template
   */
  async update(
    input: UpdateMessageTemplateInput,
    organisationId: string,
    userId?: string,
  ) {
    // Check if template exists and belongs to organization
    const existing = await this.findOne(input.id, organisationId);

    // Prevent updating system templates
    if (existing.isSystem) {
      throw new BadRequestException('System templates cannot be modified');
    }

    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.subject !== undefined) updateData.subject = input.subject;
    if (input.bodyText !== undefined) updateData.bodyText = input.bodyText;
    if (input.bodyHtml !== undefined) updateData.bodyHtml = input.bodyHtml;
    if (input.variables !== undefined) updateData.variables = input.variables;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const template = await this.prisma.messageTemplate.update({
      where: { id: input.id },
      data: updateData,
    });

    // Log template update - scoped to template's branch
    try {
      await this.auditLogService.create({
        action: 'UPDATE_TEMPLATE',
        entityType: 'MessageTemplate',
        entityId: template.id,
        description: `Message template updated: ${template.name}`,
        userId: userId,
        branchId: template.branchId || undefined, // 🔒 Branch-scoped: log belongs to template's branch
        metadata: {
          name: template.name,
          changes: updateData,
        },
      });
    } catch (auditError) {
      this.logger.error(
        `Failed to create audit log for template ${template.id}: ${(auditError as Error).message}`,
      );
    }

    return template;
  }

  /**
   * Delete a template
   */
  async delete(id: string, organisationId: string, userId?: string) {
    // Check if template exists and belongs to organization
    const existing = await this.findOne(id, organisationId);

    // Prevent deleting system templates
    if (existing.isSystem) {
      throw new BadRequestException('System templates cannot be deleted');
    }

    await this.prisma.messageTemplate.delete({
      where: { id },
    });

    // Log template deletion - scoped to template's branch
    try {
      await this.auditLogService.create({
        action: 'DELETE_TEMPLATE',
        entityType: 'MessageTemplate',
        entityId: id,
        description: `Message template deleted: ${existing.name}`,
        userId: userId,
        branchId: existing.branchId || undefined, // 🔒 Branch-scoped: log belongs to template's branch
        metadata: {
          name: existing.name,
          category: existing.category,
          type: existing.type,
        },
      });
    } catch (auditError) {
      this.logger.error(
        `Failed to create audit log for template ${id}: ${(auditError as Error).message}`,
      );
    }

    return { success: true, message: 'Template deleted successfully' };
  }

  /**
   * Duplicate a template
   */
  async duplicate(id: string, organisationId: string, userId: string) {
    const original = await this.findOne(id, organisationId);

    return this.prisma.messageTemplate.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        type: original.type,
        subject: original.subject,
        bodyText: original.bodyText,
        bodyHtml: original.bodyHtml,
        variables: original.variables as any,
        isActive: original.isActive,
        isSystem: false, // Duplicates are never system templates
        organisationId,
        branchId: original.branchId,
        createdBy: userId,
      },
    });
  }

  /**
   * Increment usage count
   */
  async incrementUsageCount(id: string) {
    return this.prisma.messageTemplate.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: string, variables: Record<string, string>): string {
    let rendered = template;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(key, 'g'), value);
    });
    return rendered;
  }
}
