import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmailTemplateInput } from '../dto/create-email-template.input';
import { UpdateEmailTemplateInput } from '../dto/update-email-template.input';
import { EmailTemplateDto } from '../dto/email-template.dto';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new email template
   * @param input CreateEmailTemplateInput
   * @returns Promise<EmailTemplateDto>
   */
  async createTemplate(
    input: CreateEmailTemplateInput,
  ): Promise<EmailTemplateDto> {
    try {
      const { branchId, organisationId, ...rest } = input;
      const data: Prisma.EmailTemplateCreateInput = { ...rest };

      if (branchId) {
        data.branch = { connect: { id: branchId } };
      }
      if (organisationId) {
        data.organisation = { connect: { id: organisationId } };
      }

      const template = await this.prisma.emailTemplate.create({ data });

      return template;
    } catch (error) {
      this.logger.error(
        `Failed to create email template: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update an existing email template
   * @param id Template ID
   * @param input UpdateEmailTemplateInput
   * @returns Promise<EmailTemplateDto>
   */
  async updateTemplate(
    id: string,
    input: UpdateEmailTemplateInput,
  ): Promise<EmailTemplateDto> {
    try {
      const { id: _, branchId, organisationId, ...rest } = input;
      const data: Prisma.EmailTemplateUpdateInput = { ...rest };

      if (branchId) {
        data.branch = { connect: { id: branchId } };
      }
      if (organisationId) {
        data.organisation = { connect: { id: organisationId } };
      }

      const template = await this.prisma.emailTemplate.update({
        where: { id },
        data,
      });

      return template;
    } catch (error) {
      this.logger.error(
        `Failed to update email template: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all email templates, optionally filtered by branch and organisation
   * @param branchId Optional branch ID to filter templates
   * @param organisationId Optional organisation ID to filter templates
   * @returns Promise<EmailTemplateDto[]>
   */
  async getTemplates(
    branchId?: string,
    organisationId?: string,
  ): Promise<EmailTemplateDto[]> {
    try {
      const where: Prisma.EmailTemplateWhereInput = {};
      if (branchId) {
        where.branchId = branchId;
      }
      if (organisationId) {
        where.organisationId = organisationId;
      }

      const templates = await this.prisma.emailTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return templates;
    } catch (error) {
      this.logger.error(
        `Failed to get email templates: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get a specific email template by ID
   * @param id Template ID
   * @returns Promise<EmailTemplateDto>
   */
  async getTemplate(id: string): Promise<EmailTemplateDto> {
    try {
      const template = await this.prisma.emailTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        throw new Error(`Email template with ID ${id} not found`);
      }

      return template;
    } catch (error) {
      this.logger.error(
        `Failed to get email template: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete an email template
   * @param id Template ID
   * @returns Promise<boolean>
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      await this.prisma.emailTemplate.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete email template: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
