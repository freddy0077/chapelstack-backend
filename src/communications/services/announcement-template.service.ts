import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Service for managing announcement templates
 */
@Injectable()
export class AnnouncementTemplateService {
  private readonly logger = new Logger(AnnouncementTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new announcement template
   */
  async createTemplate(
    input: {
      name: string;
      category: string;
      content: string;
      isSystem?: boolean;
    },
    userId: string,
    branchId?: string,
  ) {
    try {
      const template = await this.prisma.announcementTemplate.create({
        data: {
          name: input.name,
          category: input.category,
          content: input.content,
          isSystem: input.isSystem || false,
          branchId: input.isSystem ? null : branchId,
          createdBy: userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Announcement template created: ${template.id} by user ${userId}`);
      return template;
    } catch (error) {
      this.logger.error(`Failed to create announcement template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an announcement template
   */
  async updateTemplate(
    id: string,
    input: {
      name?: string;
      category?: string;
      content?: string;
    },
    userId: string,
    branchId?: string,
  ) {
    try {
      const existing = await this.prisma.announcementTemplate.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Announcement template with id ${id} not found`);
      }

      // Check permissions
      if (existing.isSystem) {
        throw new ForbiddenException('Cannot update system templates');
      }

      if (existing.branchId !== branchId) {
        throw new ForbiddenException('You do not have permission to update this template');
      }

      const template = await this.prisma.announcementTemplate.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.category && { category: input.category }),
          ...(input.content && { content: input.content }),
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Announcement template updated: ${template.id} by user ${userId}`);
      return template;
    } catch (error) {
      this.logger.error(`Failed to update announcement template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an announcement template
   */
  async deleteTemplate(id: string, userId: string, branchId?: string): Promise<boolean> {
    try {
      const existing = await this.prisma.announcementTemplate.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Announcement template with id ${id} not found`);
      }

      // Check permissions
      if (existing.isSystem) {
        throw new ForbiddenException('Cannot delete system templates');
      }

      if (existing.branchId !== branchId) {
        throw new ForbiddenException('You do not have permission to delete this template');
      }

      await this.prisma.announcementTemplate.delete({
        where: { id },
      });

      this.logger.log(`Announcement template deleted: ${id} by user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete announcement template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all templates for a branch (including system templates)
   */
  async getTemplates(branchId: string) {
    try {
      const templates = await this.prisma.announcementTemplate.findMany({
        where: {
          OR: [
            { branchId },
            { isSystem: true },
          ],
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { isSystem: 'desc' },
          { name: 'asc' },
        ],
      });

      return templates;
    } catch (error) {
      this.logger.error(`Failed to get announcement templates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(id: string) {
    try {
      const template = await this.prisma.announcementTemplate.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!template) {
        throw new NotFoundException(`Announcement template with id ${id} not found`);
      }

      return template;
    } catch (error) {
      this.logger.error(`Failed to get announcement template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Use a template to create announcement data
   */
  async useTemplate(
    templateId: string,
    customizations?: {
      title?: string;
      additionalContent?: string;
    },
  ) {
    try {
      const template = await this.getTemplate(templateId);

      // Merge template content with customizations
      let content = template.content;
      
      if (customizations?.additionalContent) {
        content += `\n\n${customizations.additionalContent}`;
      }

      return {
        category: template.category,
        content,
        title: customizations?.title || `Announcement from ${template.name}`,
      };
    } catch (error) {
      this.logger.error(`Failed to use announcement template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string, branchId: string) {
    try {
      const templates = await this.prisma.announcementTemplate.findMany({
        where: {
          category,
          OR: [
            { branchId },
            { isSystem: true },
          ],
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isSystem: 'desc' },
          { name: 'asc' },
        ],
      });

      return templates;
    } catch (error) {
      this.logger.error(`Failed to get templates by category: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create default system templates (run once during setup)
   */
  async createDefaultSystemTemplates(userId: string) {
    try {
      const defaultTemplates = [
        {
          name: 'General Announcement',
          category: 'General',
          content: `
            <p>Dear Church Family,</p>
            <p>[Your announcement content here]</p>
            <p>God bless you!</p>
          `,
          isSystem: true,
        },
        {
          name: 'Event Announcement',
          category: 'Event',
          content: `
            <h2>Upcoming Event</h2>
            <p><strong>Event:</strong> [Event Name]</p>
            <p><strong>Date:</strong> [Event Date]</p>
            <p><strong>Time:</strong> [Event Time]</p>
            <p><strong>Location:</strong> [Event Location]</p>
            <p>[Event Description]</p>
            <p>We look forward to seeing you there!</p>
          `,
          isSystem: true,
        },
        {
          name: 'Urgent Notice',
          category: 'Urgent',
          content: `
            <h2>⚠️ Important Notice</h2>
            <p>[Urgent message content]</p>
            <p>Please take note and act accordingly.</p>
          `,
          isSystem: true,
        },
        {
          name: 'Maintenance Notice',
          category: 'Maintenance',
          content: `
            <h2>🔧 Scheduled Maintenance</h2>
            <p>We will be performing maintenance on [Date] from [Start Time] to [End Time].</p>
            <p>During this time, [affected services] may be temporarily unavailable.</p>
            <p>We apologize for any inconvenience.</p>
          `,
          isSystem: true,
        },
      ];

      const createdTemplates: any[] = [];

      for (const template of defaultTemplates) {
        const existing = await this.prisma.announcementTemplate.findFirst({
          where: {
            name: template.name,
            isSystem: true,
          },
        });

        if (!existing) {
          const created = await this.prisma.announcementTemplate.create({
            data: {
              ...template,
              createdBy: userId,
            },
          });
          createdTemplates.push(created);
        }
      }

      this.logger.log(`Created ${createdTemplates.length} default system templates`);
      return createdTemplates;
    } catch (error) {
      this.logger.error(`Failed to create default system templates: ${error.message}`);
      throw error;
    }
  }
}
