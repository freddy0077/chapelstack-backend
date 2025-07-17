import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SendEmailInput } from '../dto/send-email.input';
import { Prisma } from '@prisma/client';
import { CreateEmailTemplateInput } from '../dto/create-email-template.input';
import { UpdateEmailTemplateInput } from '../dto/update-email-template.input';
import { EmailTemplateDto } from '../dto/email-template.dto';
import { EmailMessageDto } from '../dto/email-message.dto';
import { TemplateService } from './template.service';
import { RecipientService } from './recipient.service';

/**
 * Interface for transactional email options
 */
interface TransactionalEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  branchId?: string;
  organisationId?: string;
}

/**
 * Service for handling email communications
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly defaultSender: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
    private readonly recipientService: RecipientService,
  ) {
    this.defaultSender =
      this.configService.get<string>('EMAIL_SENDER') || 'info@chapelstack.com';
  }

  /**
   * Returns the number of emails sent in the last 30 days
   */
  async countSentLast30Days(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.emailMessage.count({
      where: {
        status: 'SENT',
        sentAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
  }

  /**
   * Send an email to one or more recipients
   * @param input SendEmailInput containing recipients, subject, body, etc.
   * @returns Promise<boolean> indicating success or failure
   */
  async sendEmail(input: SendEmailInput): Promise<boolean> {
    try {
      const {
        branchId,
        organisationId,
        templateId,
        groupIds,
        birthdayRange,
        scheduledAt,
        recipients: explicitRecipients = [],
        filters = [],
        ...rest
      } = input;

      // Process template if provided
      const { bodyHtml, bodyText, finalSubject } = await this.processTemplate(
        templateId,
        rest.templateData,
        rest.bodyHtml,
        rest.bodyText,
        rest.subject,
      );

      // Gather all recipients (emails)
      const allRecipientsSet = new Set<string>();

      // Check if explicitRecipients contains member IDs (UUIDs)
      const memberIds: string[] = [];
      const emailAddresses: string[] = [];

      this.logger.debug(
        `Processing ${explicitRecipients?.length || 0} explicit recipients: ${JSON.stringify(explicitRecipients)}`,
      );

      // Separate member IDs from email addresses
      (explicitRecipients || []).forEach((recipient) => {
        this.logger.debug(
          `Processing recipient: ${recipient} (type: ${typeof recipient})`,
        );
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            recipient,
          )
        ) {
          // This is likely a member ID
          memberIds.push(recipient);
          this.logger.debug(`Identified as member ID: ${recipient}`);
        } else if (this.isValidEmail(recipient)) {
          // This is an email address
          emailAddresses.push(recipient);
          this.logger.debug(`Identified as email address: ${recipient}`);
        } else {
          this.logger.debug(
            `Recipient ${recipient} is neither a valid UUID nor email address`,
          );
        }
      });

      this.logger.debug(
        `Found ${memberIds.length} potential member IDs and ${emailAddresses.length} direct email addresses`,
      );

      // Add direct email addresses to recipients
      emailAddresses.forEach((email) => allRecipientsSet.add(email));

      // Look up member emails by ID
      if (memberIds.length > 0) {
        this.logger.debug(
          `Looking up emails for member IDs: ${JSON.stringify(memberIds)}`,
        );
        const members = await this.prisma.member.findMany({
          where: { id: { in: memberIds } },
          select: { id: true, email: true },
        });

        this.logger.debug(
          `Found ${members.length} members from ${memberIds.length} member IDs: ${JSON.stringify(members)}`,
        );

        members.forEach((member) => {
          if (member.email) {
            allRecipientsSet.add(member.email);
            this.logger.debug(
              `Added email ${member.email} for member ${member.id}`,
            );
          } else {
            this.logger.debug(`Member ${member.id} has no email address`);
          }
        });
      }

      const legacyRecipients = await this.gatherRecipients(
        [],
        branchId,
        organisationId,
        groupIds,
        birthdayRange,
      );
      this.logger.debug(
        `Legacy recipients: ${JSON.stringify(legacyRecipients)}`,
      );
      legacyRecipients.forEach((e) => allRecipientsSet.add(e));
      if (filters && filters.length > 0) {
        const centralizedRecipients =
          await this.recipientService.resolveFilterRecipients(filters, {
            branchId,
            organisationId,
            contactType: 'email',
          });
        this.logger.debug(
          `Centralized recipients: ${JSON.stringify(centralizedRecipients)}`,
        );
        centralizedRecipients.forEach((e) => allRecipientsSet.add(e));
      }
      const allRecipients = Array.from(allRecipientsSet);

      this.logger.debug(
        `Final recipients list: ${JSON.stringify(allRecipients)} (count: ${allRecipients.length})`,
      );

      if (allRecipients.length === 0) {
        this.logger.warn('No recipients found for email');
        return false;
      }

      // Fetch member info for all recipients
      const members = await this.prisma.member.findMany({
        where: { email: { in: allRecipients } },
      });
      // Filter out members with null/invalid emails
      const validMembers = members.filter(
        (m) => typeof m.email === 'string' && !!m.email,
      );

      // Personalize and save email per recipient
      const emailRecords: any[] = [];
      for (const member of validMembers) {
        const personalizedHtml = await this.recipientService.personalizeMessage(
          bodyHtml,
          member,
          organisationId
            ? (
                await this.prisma.organisation.findUnique({
                  where: { id: organisationId },
                })
              )?.name
            : undefined,
        );
        const personalizedText = await this.recipientService.personalizeMessage(
          bodyText,
          member,
          organisationId
            ? (
                await this.prisma.organisation.findUnique({
                  where: { id: organisationId },
                })
              )?.name
            : undefined,
        );
        const personalizedSubject =
          await this.recipientService.personalizeMessage(
            finalSubject,
            member,
            organisationId
              ? (
                  await this.prisma.organisation.findUnique({
                    where: { id: organisationId },
                  })
                )?.name
              : undefined,
          );
        const emailRecord = await this.createEmailRecord({
          subject: personalizedSubject,
          bodyHtml: personalizedHtml,
          bodyText: personalizedText,
          recipients: [member.email as string],
          branchId,
          organisationId,
          templateId,
        });
        emailRecords.push(emailRecord);
      }

      // Handle scheduled emails
      if (scheduledAt) {
        this.logger.log(
          `Email scheduled for ${scheduledAt} to ${allRecipients.length} recipients`,
        );
        return true;
      }

      // Send the emails
      const provider = await this.getEmailProvider();
      for (const emailRecord of emailRecords) {
        this.logger.log(
          `Sending email to recipient: ${emailRecord.recipients[0]}`,
        );
        await provider.sendEmail({
          from: this.defaultSender,
          to: emailRecord.recipients,
          subject: emailRecord.subject,
          html: emailRecord.bodyHtml,
          text: emailRecord.bodyText,
        });
        await this.updateEmailStatus(emailRecord.id, 'SENT');
      }

      this.logger.log(
        `Sent emails via ${provider.constructor.name} to ${emailRecords.length} recipients`,
      );
      return true;
    } catch (error) {
      this.handleEmailError(error, 'Failed to send email');
      return false;
    }
  }

  /**
   * Send a single transactional email to one recipient
   * This is optimized for sending individual emails like password resets, confirmations, etc.
   * @param options Simple email options without the complexity of the full SendEmailInput
   * @returns Promise<boolean> indicating success or failure
   */
  async sendSingleEmail(options: TransactionalEmailOptions): Promise<boolean> {
    try {
      const { to, subject, html, text, templateId, templateData } = options;

      // Validate recipient
      if (!to) {
        throw new Error('Recipient email is required');
      }

      // Process template if provided
      const { bodyHtml, bodyText, finalSubject } = await this.processTemplate(
        templateId,
        templateData,
        html,
        text,
        subject,
      );

      // Send the email directly without saving to database
      const provider = await this.getEmailProvider();

      this.logger.log(`Sending transactional email to: ${to}`);

      await provider.sendEmail({
        from: this.defaultSender,
        to: [to],
        subject: finalSubject,
        html: bodyHtml,
        text: bodyText,
      });

      this.logger.log(
        `Sent transactional email via ${provider.constructor.name} to ${to} with subject: ${finalSubject}`,
      );

      return true;
    } catch (error) {
      this.handleEmailError(error, 'Failed to send transactional email');
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
      this.handleEmailError(error, 'Failed to create email template');
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
      this.handleEmailError(error, 'Failed to update email template');
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
      this.logger.log(
        `getEmails called with branchId=${branchId} (${typeof branchId}), organisationId=${organisationId} (${typeof organisationId})`,
      );

      const where: any = {};

      // Only add filters if they are valid strings
      if (
        organisationId &&
        typeof organisationId === 'string' &&
        organisationId.trim() !== ''
      ) {
        where.organisationId = organisationId;
        this.logger.log(`Adding organisationId filter: ${organisationId}`);
      }

      if (branchId && typeof branchId === 'string' && branchId.trim() !== '') {
        where.branchId = branchId;
        this.logger.log(`Adding branchId filter: ${branchId}`);
      }

      this.logger.log(`Email query where clause: ${JSON.stringify(where)}`);

      const emails = await this.prisma.emailMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(
        `Found ${emails.length} emails with filter: organisationId=${organisationId}, branchId=${branchId}`,
      );

      // Process each email to look up recipient information
      const emailsWithRecipientInfo = await Promise.all(
        emails.map(async (email) => {
          // Check if recipients contains valid UUIDs (member IDs)
          const potentialMemberIds = email.recipients.filter((recipient) =>
            // Basic UUID validation pattern
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              recipient,
            ),
          );

          let recipientInfo: Array<{
            id: string;
            firstName?: string;
            lastName?: string;
            phoneNumber?: string;
            email?: string;
            fullName?: string;
          }> = [];

          if (potentialMemberIds.length > 0) {
            this.logger.debug(
              `Looking up ${potentialMemberIds.length} potential member IDs for email ${email.id}`,
            );

            // Look up members by IDs
            const members = await this.prisma.member.findMany({
              where: { id: { in: potentialMemberIds } },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true,
              },
            });

            this.logger.debug(
              `Found ${members.length} members for email ${email.id}`,
            );

            // Map members to RecipientInfoDto
            recipientInfo = members.map((member) => ({
              id: member.id,
              firstName: member.firstName || undefined,
              lastName: member.lastName || undefined,
              phoneNumber: member.phoneNumber || undefined,
              email: member.email || undefined,
              fullName:
                `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
                undefined,
            }));
          }

          // For any recipients that aren't member IDs, they're likely direct email addresses
          const emailAddressRecipients = email.recipients.filter(
            (recipient) =>
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                recipient,
              ),
          );

          // Add email addresses as recipient info without member details
          if (emailAddressRecipients.length > 0) {
            const emailRecipients = emailAddressRecipients.map(
              (emailAddress) => ({
                id: `email-${emailAddress}`,
                email: emailAddress,
                fullName: `Email: ${emailAddress}`,
              }),
            );

            recipientInfo = [...recipientInfo, ...emailRecipients];
          }

          return {
            ...email,
            bodyText: email.bodyText || undefined, // Convert null to undefined for the DTO
            recipientInfo,
          };
        }),
      );

      return emailsWithRecipientInfo;
    } catch (error) {
      this.handleEmailError(error, 'Failed to fetch emails');
      return [];
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
    try {
      const where: Prisma.EmailTemplateWhereInput = {};
      if (branchId) where.branchId = branchId;
      if (organisationId) where.organisationId = organisationId;

      const templates = await this.prisma.emailTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return templates;
    } catch (error) {
      this.handleEmailError(error, 'Failed to fetch email templates');
      return [];
    }
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
      this.handleEmailError(error, 'Failed to fetch email template');
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
      this.handleEmailError(error, 'Failed to delete email template');
      return false;
    }
  }

  /**
   * Get a specific email message by ID
   * @param id Email message ID
   * @returns Promise<EmailMessageDto>
   */
  async getEmailById(id: string): Promise<EmailMessageDto> {
    try {
      const email = await this.prisma.emailMessage.findUnique({
        where: { id },
      });

      if (!email) {
        throw new Error(`Email message with ID ${id} not found`);
      }

      // Check if recipients contains valid UUIDs (member IDs)
      const potentialMemberIds = email.recipients.filter((recipient) =>
        // Basic UUID validation pattern
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          recipient,
        ),
      );

      let recipientInfo: Array<{
        id: string;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        email?: string;
        fullName?: string;
      }> = [];

      if (potentialMemberIds.length > 0) {
        this.logger.debug(
          `Looking up ${potentialMemberIds.length} potential member IDs for email ${email.id}`,
        );

        // Look up members by IDs
        const members = await this.prisma.member.findMany({
          where: { id: { in: potentialMemberIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
          },
        });

        this.logger.debug(
          `Found ${members.length} members for email ${email.id}`,
        );

        // Map members to RecipientInfoDto
        recipientInfo = members.map((member) => ({
          id: member.id,
          firstName: member.firstName || undefined,
          lastName: member.lastName || undefined,
          phoneNumber: member.phoneNumber || undefined,
          email: member.email || undefined,
          fullName:
            `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
            undefined,
        }));
      }

      // For any recipients that aren't member IDs, they're likely direct email addresses
      const emailAddressRecipients = email.recipients.filter(
        (recipient) =>
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            recipient,
          ),
      );

      // Add email addresses as recipient info without member details
      if (emailAddressRecipients.length > 0) {
        const emailRecipients = emailAddressRecipients.map((emailAddress) => ({
          id: `email-${emailAddress}`,
          email: emailAddress,
          fullName: `Email: ${emailAddress}`,
        }));

        recipientInfo = [...recipientInfo, ...emailRecipients];
      }

      return {
        ...email,
        bodyText: email.bodyText || undefined, // Convert null to undefined for the DTO
        recipientInfo,
      };
    } catch (error) {
      this.handleEmailError(error, `Failed to get email message with ID ${id}`);
      throw error;
    }
  }

  /**
   * Process email template and apply template data
   * @param templateId Optional template ID to use
   * @param templateData Optional data to apply to template
   * @param bodyHtml Optional HTML body to use if no template
   * @param bodyText Optional text body to use if no template
   * @param subject Optional subject to use if no template
   * @returns Processed email content
   * @private
   */
  private async processTemplate(
    templateId?: string,
    templateData?: Record<string, any>,
    bodyHtml?: string,
    bodyText?: string,
    subject?: string,
  ): Promise<{
    bodyHtml: string;
    bodyText: string;
    finalSubject: string;
  }> {
    let bodyHtmlContent = bodyHtml || '';
    let bodyTextContent = bodyText || '';
    let finalSubjectContent = subject || '';

    if (templateId) {
      const template = await this.prisma.emailTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new Error(`Email template with ID ${templateId} not found`);
      }

      bodyHtmlContent = template.bodyHtml;
      bodyTextContent = template.bodyText || '';
      finalSubjectContent = template.subject;

      if (templateData) {
        ({
          bodyHtml: bodyHtmlContent,
          bodyText: bodyTextContent,
          subject: finalSubjectContent,
        } = this.applyTemplateData(
          bodyHtmlContent,
          bodyTextContent,
          finalSubjectContent,
          templateData,
        ));
      }
    }

    return {
      bodyHtml: bodyHtmlContent,
      bodyText: bodyTextContent,
      finalSubject: finalSubjectContent,
    };
  }

  /**
   * Apply template data to content
   * @private
   */
  private applyTemplateData(
    html: string,
    text: string,
    subject: string,
    data: Record<string, any>,
  ): { bodyHtml: string; bodyText: string; subject: string } {
    let bodyHtml = html;
    let bodyText = text;
    let finalSubject = subject;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\s*${key}\s*}}`, 'g');
      const stringValue = String(value);

      if (bodyHtml) {
        bodyHtml = bodyHtml.replace(regex, stringValue);
      }

      if (bodyText) {
        bodyText = bodyText.replace(regex, stringValue);
      }

      finalSubject = finalSubject.replace(regex, stringValue);
    });

    return { bodyHtml, bodyText, subject: finalSubject };
  }

  /**
   * Gather all recipients from various sources
   * @param explicitRecipients Explicitly specified recipient emails
   * @param branchId Optional branch ID to filter members
   * @param organisationId Optional organisation ID to filter members
   * @param groupIds Optional group IDs to filter members
   * @param birthdayRange Optional birthday range to filter members
   * @returns Array of unique recipient emails
   * @private
   */
  private async gatherRecipients(
    explicitRecipients: string[],
    branchId?: string,
    organisationId?: string,
    groupIds?: string[],
    birthdayRange?: string,
  ): Promise<string[]> {
    // Filter out non-email strings from explicit recipients
    const validExplicitRecipients = explicitRecipients.filter((email) =>
      this.isValidEmail(email),
    );

    const allRecipients = new Set<string>(validExplicitRecipients);

    // Add members from groups if specified
    if (groupIds && groupIds.length > 0) {
      const members = await this.prisma.member.findMany({
        where: {
          // Use groupMemberships relation with OR condition for ministry and small group
          groupMemberships: {
            some: {
              OR: [
                {
                  ministryId: {
                    in: groupIds,
                  },
                },
                {
                  smallGroupId: {
                    in: groupIds,
                  },
                },
              ],
            },
          },
          branchId: branchId,
          email: {
            not: null,
          },
        },
        select: {
          email: true,
        },
      });

      members.forEach((member) => {
        if (member.email) {
          allRecipients.add(member.email);
        }
      });
    }

    // Add members with birthdays in range if specified
    if (birthdayRange) {
      const today = new Date();
      let startDate: Date, endDate: Date;

      switch (birthdayRange) {
        case 'TODAY':
          startDate = today;
          endDate = today;
          break;
        case 'THIS_WEEK':
          // Start of week (Sunday)
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          // End of week (Saturday)
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'THIS_MONTH':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        default:
          startDate = today;
          endDate = today;
      }

      const members = await this.prisma.member.findMany({
        where: {
          dateOfBirth: {
            not: null,
          },
        },
        select: {
          email: true,
          dateOfBirth: true,
        },
      });

      members.forEach((member) => {
        if (member.email && member.dateOfBirth) {
          const birthDate = new Date(member.dateOfBirth);
          const birthMonth = birthDate.getMonth();
          const birthDay = birthDate.getDate();

          // Check if birthday falls within range
          const currentYear = today.getFullYear();
          const memberBirthday = new Date(currentYear, birthMonth, birthDay);

          if (memberBirthday >= startDate && memberBirthday <= endDate) {
            allRecipients.add(member.email);
          }
        }
      });
    }

    return Array.from(allRecipients);
  }

  private async personalizeMessage(
    template: string,
    member: any,
    churchName: string,
  ): Promise<string> {
    return this.recipientService.personalizeMessage(
      template,
      member,
      churchName,
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Create email record in database
   * @param options Email record creation options
   * @returns Created email message
   * @private
   */
  private async createEmailRecord({
    subject,
    bodyHtml,
    bodyText,
    recipients,
    branchId,
    organisationId,
    templateId,
  }: {
    subject: string;
    bodyHtml: string;
    bodyText: string;
    recipients: string[];
    branchId?: string;
    organisationId?: string;
    templateId?: string;
  }): Promise<{ id: string }> {
    const data: Prisma.EmailMessageCreateInput = {
      subject,
      bodyHtml,
      bodyText,
      senderEmail: this.defaultSender,
      recipients,
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

    return this.prisma.emailMessage.create({ data });
  }

  /**
   * Update email status
   * @param id Email ID
   * @param status New email status
   * @returns Promise<void>
   * @private
   */
  private async updateEmailStatus(
    id: string,
    status: 'SENDING' | 'SENT' | 'FAILED',
  ): Promise<void> {
    const updateData: Prisma.EmailMessageUpdateInput = { status };

    if (status === 'SENT') {
      updateData.sentAt = new Date();
    }

    await this.prisma.emailMessage.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Get configured email provider
   * @returns Promise<EmailProvider>
   * @private
   */
  private async getEmailProvider(): Promise<any> {
    const providerType =
      this.configService.get<string>('EMAIL_PROVIDER') || 'sendgrid';

    if (providerType === 'sendgrid') {
      const { SendGridEmailProvider } = await import('./sendgrid.util.js');
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');

      if (!apiKey) {
        throw new Error('SENDGRID_API_KEY is not set');
      }

      return new SendGridEmailProvider(apiKey);
    } else {
      const { SesEmailProvider } = await import('./ses-email-provider.js');
      const region = this.configService.get<string>('AWS_SES_REGION');
      const accessKeyId = this.configService.get<string>(
        'AWS_SES_ACCESS_KEY_ID',
      );
      const secretAccessKey = this.configService.get<string>(
        'AWS_SES_SECRET_ACCESS_KEY',
      );

      if (!region || !accessKeyId || !secretAccessKey) {
        throw new Error(
          'Missing AWS SES configuration: region, accessKeyId, or secretAccessKey is undefined',
        );
      }

      return new SesEmailProvider({
        region,
        accessKeyId,
        secretAccessKey,
      });
    }
  }

  /**
   * Handle email errors consistently
   * @param error Error to handle
   * @param context Context of the error
   * @private
   */
  private handleEmailError(error: unknown, context: string): void {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    this.logger.error(`${context}: ${errorMessage}`, errorStack);
  }
}
