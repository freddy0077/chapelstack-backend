import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SendEmailInput } from '../dto/send-email.input';
// Import Prisma types but use string literals for MessageStatus
import { Prisma } from '@prisma/client';
import { CreateEmailTemplateInput } from '../dto/create-email-template.input';
import { UpdateEmailTemplateInput } from '../dto/update-email-template.input';
import { EmailTemplateDto } from '../dto/email-template.dto';
import { EmailMessageDto } from '../dto/email-message.dto';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService {
  /**
   * Returns the number of emails sent in the last 30 days.
   * TODO: Implement actual count logic.
   */
  async countSentLast30Days(): Promise<number> {
    // TODO: Implement actual count logic
    return 0;
  }

  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * Send an email to one or more recipients
   * @param input SendEmailInput containing recipients, subject, body, etc.
   * @returns Promise<boolean> indicating success or failure
   */
  async sendEmail(input: SendEmailInput): Promise<boolean> {
    try {
      const { branchId, organisationId, templateId, ...rest } = input;
      let bodyHtml = rest.bodyHtml;
      let bodyText = rest.bodyText;
      let subject = rest.subject;

      // If a template is specified, retrieve and use it
      if (templateId) {
        const template = await this.prisma.emailTemplate.findUnique({
          where: { id: templateId },
        });

        if (!template) {
          throw new Error(`Email template with ID ${templateId} not found`);
        }

        // Apply template data if provided
        bodyHtml = template.bodyHtml;
        bodyText = template.bodyText || '';
        subject = template.subject;

        // Replace template variables with actual data
        if (rest.templateData) {
          Object.entries(rest.templateData).forEach(([key, value]) => {
            const regex = new RegExp(`{{\s*${key}\s*}}`, 'g');
            if (bodyHtml) {
              bodyHtml = bodyHtml.replace(regex, String(value));
            }
            if (bodyText) {
              bodyText = bodyText.replace(regex, String(value));
            }
            subject = subject.replace(regex, String(value));
          });
        }
      }

      const data: Prisma.EmailMessageCreateInput = {
        subject,
        bodyHtml: bodyHtml || '',
        bodyText,
        senderEmail:
          this.configService.get<string>('EMAIL_SENDER') ||
          'noreply@church.org',
        recipients: rest.recipients,
        status: 'SENDING',
      };

      if (branchId) {
        data.branch = { connect: { id: branchId } };
      }
      if (organisationId) {
        data.organisation = { connect: { id: organisationId } };
      }
      if (templateId) {
        data.template = { connect: { id: templateId } };
      }

      // Create a record of the email in the database
      const emailMessage = await this.prisma.emailMessage.create({ data });

      // TODO: Implement actual email sending using a provider like SendGrid, AWS SES, etc.
      // For now, we'll just log the email and update the status
      this.logger.log(
        `[MOCK] Sending email to ${input.recipients.join(', ')} with subject: ${subject}`,
      );

      // Update the email status to SENT
      await this.prisma.emailMessage.update({
        where: { id: emailMessage.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send email: ${errorMessage}`, errorStack);
      return false;
    }
  }

  /**
   * Create a new email template
   * @param input CreateEmailTemplateInput
   * @returns Promise<EmailTemplateDto>
   */
  async createEmailTemplate(
    input: CreateEmailTemplateInput,
  ): Promise<EmailTemplateDto> {
    try {
      const template = await this.prisma.emailTemplate.create({
        data: {
          name: input.name,
          description: input.description,
          subject: input.subject,
          bodyHtml: input.bodyHtml,
          bodyText: input.bodyText,
          isActive: input.isActive ?? true,
          branchId: input.branchId,
        },
      });

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
  async updateEmailTemplate(
    id: string,
    input: UpdateEmailTemplateInput,
  ): Promise<EmailTemplateDto> {
    try {
      const template = await this.prisma.emailTemplate.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          subject: input.subject,
          bodyHtml: input.bodyHtml,
          bodyText: input.bodyText,
          isActive: input.isActive,
        },
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
   * Get all email messages
   * @param branchId Optional branch ID to filter emails
   * @param organisationId Optional organisation ID to filter emails
   * @returns Promise<EmailMessageDto[]>
   */
  async getEmails(
    branchId?: string,
    organisationId?: string,
  ): Promise<EmailMessageDto[]> {
    try {
      const where: Prisma.EmailMessageWhereInput = {};
      if (branchId) {
        where.branchId = branchId;
      }
      if (organisationId) {
        where.organisationId = organisationId;
      }

      const emails = await this.prisma.emailMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { branch: true, template: true },
      });

      return emails.map((email) => ({
        ...email,
        bodyText: email.bodyText === null ? undefined : email.bodyText,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get email messages: ${error.message}`,
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
  async getEmailTemplates(
    branchId?: string,
    organisationId?: string,
  ): Promise<EmailTemplateDto[]> {
    return this.templateService.getTemplates(branchId, organisationId);
  }

  /**
   * Get a specific email template by ID
   * @param id Template ID
   * @returns Promise<EmailTemplateDto>
   */
  async getEmailTemplate(id: string): Promise<EmailTemplateDto> {
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
  async deleteEmailTemplate(id: string): Promise<boolean> {
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
