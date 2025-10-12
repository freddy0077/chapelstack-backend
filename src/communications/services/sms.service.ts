import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SendSmsInput } from '../dto/send-sms.input';
import { SmsMessageDto } from '../dto/sms-message.dto';
import { SendMessageResponse } from '../dto/send-message-response.dto';
import { MessageStatus } from '../enums/message-status.enum';
import { MessageStatus as PrismaMessageStatus } from '@prisma/client';
import { smsQueue } from '../queue/sms.queue';
import { NaloSmsProvider } from '../providers/nalo-sms.provider';
import { format } from 'date-fns';
import { RecipientService } from '../services/recipient.service';

@Injectable()
export class SmsService {
  /**
   * Returns the number of SMS sent in the last 30 days.
   * TODO: Implement actual count logic.
   */
  async countSentLast30Days(): Promise<number> {
    // TODO: Implement actual count logic
    return 0;
  }

  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly naloSmsProvider: NaloSmsProvider,
    private readonly recipientService: RecipientService,
  ) {}

  /**
   * Helper to get member IDs by birthday range
   */
  private async getBirthdayRangeMemberIds(
    birthdayRange: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH',
  ): Promise<string[]> {
    const today = new Date();
    let start: Date, end: Date;
    if (birthdayRange === 'TODAY') {
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );
    } else if (birthdayRange === 'THIS_WEEK') {
      const day = today.getDay();
      start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - day,
      );
      end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + (6 - day) + 1,
      );
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }
    const birthdayMembers = await this.prisma.member.findMany({
      where: {
        dateOfBirth: {
          gte: start,
          lt: end,
        },
      },
      select: { id: true },
    });
    return birthdayMembers.map((m) => m.id);
  }

  /**
   * Replace placeholders in the message for a recipient
   */
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

  /**
   * Send an SMS to one or more recipients (now queues the job)
   * @param input SendSmsInput containing recipients, message, etc.
   * @returns Promise<boolean> indicating job was queued
   */
  async sendSms(input: SendSmsInput): Promise<boolean> {
    try {
      let allRecipientIds: string[] = [...input.recipients];
      if (input.groupIds && input.groupIds.length > 0) {
        const groupMembers = await this.prisma.member.findMany({
          where: {
            groupMemberships: { some: { ministryId: { in: input.groupIds } } },
          },
          select: { id: true },
        });
        allRecipientIds.push(...groupMembers.map((m) => m.id));
      }
      // Add birthday range recipients if specified
      if (input.birthdayRange) {
        const birthdayIds = await this.getBirthdayRangeMemberIds(
          input.birthdayRange,
        );
        allRecipientIds.push(...birthdayIds);
      }
      // Add recipients from filters (centralized)
      if (input.filters && input.filters.length > 0) {
        const centralizedIds =
          await this.recipientService.resolveFilterRecipients(input.filters, {
            branchId: input.branchId,
            organisationId: input.organisationId,
            contactType: 'id',
          });
        allRecipientIds.push(...centralizedIds);
      }
      allRecipientIds = Array.from(new Set(allRecipientIds));
      if (allRecipientIds.length === 0) {
        throw new BadRequestException('No recipients found for SMS');
      }
      // Save audit/history record (optional, can keep for SCHEDULED only)
      const now = new Date();
      let delay = 0;
      if (input.scheduledAt && new Date(input.scheduledAt) > now) {
        delay = new Date(input.scheduledAt).getTime() - now.getTime();
        // Personalized message per recipient for scheduled SMS
        const members = await this.prisma.member.findMany({
          where: { id: { in: allRecipientIds } },
        });
        for (const member of members) {
          const personalizedBody =
            await this.recipientService.personalizeMessage(
              input.message,
              member,
              input.organisationId
                ? (
                    await this.prisma.organisation.findUnique({
                      where: { id: input.organisationId },
                    })
                  )?.name
                : undefined,
            );
          await this.prisma.smsMessage.create({
            data: {
              body: personalizedBody,
              senderNumber:
                this.configService.get<string>('SMS_SENDER_NUMBER') || 'CHURCH',
              recipients: [member.id],
              status: PrismaMessageStatus.SCHEDULED,
              scheduledAt: new Date(input.scheduledAt),
              branchId: input.branchId,
              organisationId: input.organisationId,
            },
          });
        }
      }
      // Always queue the job (immediate or delayed)
      await smsQueue.add('send', input, delay > 0 ? { delay } : {});
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to queue SMS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof BadRequestException) throw error;
      return false;
    }
  }

  /**
   * Send SMS and return detailed response with message ID and stats
   * @param input SendSmsInput containing recipients, message, etc.
   * @returns Promise<SendMessageResponse> with message details
   */
  async sendSmsWithTracking(input: SendSmsInput): Promise<SendMessageResponse> {
    try {
      let allRecipientIds: string[] = [...input.recipients];
      
      // Expand group recipients
      if (input.groupIds && input.groupIds.length > 0) {
        const groupMembers = await this.prisma.member.findMany({
          where: {
            groupMemberships: {
              some: {
                OR: [
                  { ministryId: { in: input.groupIds } },
                  { smallGroupId: { in: input.groupIds } },
                ],
              },
            },
          },
          select: { id: true },
        });
        allRecipientIds.push(...groupMembers.map((m) => m.id));
      }

      // Expand birthday range recipients (if needed in future)
      // For now, birthday range filtering is handled by the existing sendSms method
      // which uses the recipient service properly

      // Remove duplicates
      allRecipientIds = [...new Set(allRecipientIds)];
      const recipientCount = allRecipientIds.length;

      if (recipientCount === 0) {
        return {
          success: false,
          messageId: '',
          recipientCount: 0,
          status: 'FAILED',
          message: 'No recipients found',
        };
      }

      // Fetch recipient phone numbers
      const members = await this.prisma.member.findMany({
        where: { id: { in: allRecipientIds } },
        select: { id: true, phoneNumber: true },
      });

      const phoneNumbers = members
        .filter((m) => m.phoneNumber)
        .map((m) => m.phoneNumber as string);

      if (phoneNumbers.length === 0) {
        return {
          success: false,
          messageId: '',
          recipientCount: 0,
          status: 'FAILED',
          message: 'No valid phone numbers found',
        };
      }

      // Create SMS record
      const smsMessage = await this.prisma.smsMessage.create({
        data: {
          body: input.message,
          senderNumber: this.configService.get<string>('SMS_SENDER_NUMBER') || 'CHURCH',
          recipients: phoneNumbers,
          status: input.scheduledAt ? 'SCHEDULED' : 'SENDING',
          branchId: input.branchId,
          organisationId: input.organisationId,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        },
      });

      // Calculate estimated delivery
      const estimatedDelivery = input.scheduledAt
        ? new Date(input.scheduledAt)
        : new Date(Date.now() + 30000); // 30 seconds from now

      // If scheduled, queue for later
      if (input.scheduledAt) {
        const scheduledDate = new Date(input.scheduledAt);
        const delay = scheduledDate.getTime() - Date.now();
        await smsQueue.add('send', input, delay > 0 ? { delay } : {});

        return {
          success: true,
          messageId: smsMessage.id,
          recipientCount: phoneNumbers.length,
          scheduledFor: scheduledDate,
          status: 'SCHEDULED',
          estimatedDelivery,
          message: `SMS scheduled for ${scheduledDate.toLocaleString()}`,
        };
      }

      // Send immediately via queue
      await smsQueue.add('send', input);

      return {
        success: true,
        messageId: smsMessage.id,
        recipientCount: phoneNumbers.length,
        status: 'SENDING',
        estimatedDelivery,
        message: `SMS queued for delivery to ${phoneNumbers.length} recipient(s)`,
      };
    } catch (error) {
      this.logger.error('Failed to send SMS with tracking:', error);
      return {
        success: false,
        messageId: '',
        recipientCount: 0,
        status: 'FAILED',
        message: error.message || 'Failed to send SMS',
      };
    }
  }

  /**
   * Process and send SMS job from the queue.
   * - Collects all recipient IDs from direct, group, and birthday filters
   * - Validates recipients
   * - Persists SMS message with status
   * - Updates status after sending
   */
  async processSmsJob(input: SendSmsInput): Promise<boolean> {
    try {
      // Destructure relevant fields
      const {
        branchId,
        organisationId,
        recipients = [],
        groupIds = [],
        birthdayRange,
      } = input;

      // Aggregate all recipient IDs
      let allRecipientIds: string[] = [...recipients];

      // Add group member IDs
      if (groupIds.length > 0) {
        const groupMembers = await this.prisma.member.findMany({
          where: {
            OR: [
              { groupMemberships: { some: { ministryId: { in: groupIds } } } },
              {
                groupMemberships: { some: { smallGroupId: { in: groupIds } } },
              },
            ],
          },
          select: { id: true },
        });
        allRecipientIds.push(...groupMembers.map((m) => m.id));
      }

      // Remove duplicate IDs
      allRecipientIds = Array.from(new Set(allRecipientIds));

      // Fetch phone numbers for all recipients
      const members = await this.prisma.member.findMany({
        where: { id: { in: allRecipientIds } },
      });
      const allRecipients = members
        .map((m) => m.phoneNumber)
        .filter((e): e is string => !!e);

      this.logger.debug('Recipients:', allRecipients);
      if (allRecipients.length === 0) {
        throw new BadRequestException('No valid recipient phone numbers found');
      }

      // Personalize and save SMS per recipient
      const smsMessages: {
        smsMessage: any;
        member: any;
        phoneNumber: string;
      }[] = [];
      for (const member of members) {
        if (!member.phoneNumber) continue;
        const personalizedBody = await this.recipientService.personalizeMessage(
          input.message,
          member,
          organisationId
            ? (
                await this.prisma.organisation.findUnique({
                  where: { id: organisationId },
                })
              )?.name
            : undefined,
        );
        const smsData: any = {
          body: personalizedBody,
          senderNumber:
            this.configService.get<string>('SMS_SENDER_NUMBER') || 'CHURCH',
          recipients: [member.id],
          status: PrismaMessageStatus.SENDING,
        };
        if (branchId) {
          smsData.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
          smsData.organisation = { connect: { id: organisationId } };
        }
        const smsMessage = await this.prisma.smsMessage.create({
          data: smsData,
        });
        smsMessages.push({
          smsMessage,
          member,
          phoneNumber: member.phoneNumber,
        });
      }

      // Handle recipients that are raw phone numbers (not members)
      const memberPhoneNumbers = new Set(members.map((m) => m.phoneNumber));
      const extraPhoneNumbers = allRecipients.filter(
        (pn) => !memberPhoneNumbers.has(pn),
      );
      for (const phoneNumber of extraPhoneNumbers) {
        // Personalize with empty member object
        const personalizedBody = await this.recipientService.personalizeMessage(
          input.message,
          {},
          organisationId
            ? (
                await this.prisma.organisation.findUnique({
                  where: { id: organisationId },
                })
              )?.name
            : undefined,
        );
        const smsData: any = {
          body: personalizedBody,
          senderNumber:
            this.configService.get<string>('SMS_SENDER_NUMBER') || 'CHURCH',
          recipients: [], // no member id
          status: PrismaMessageStatus.SENDING,
        };
        if (branchId) {
          smsData.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
          smsData.organisation = { connect: { id: organisationId } };
        }
        const smsMessage = await this.prisma.smsMessage.create({
          data: smsData,
        });
        smsMessages.push({ smsMessage, member: {}, phoneNumber });
      }

      // Send SMS via Nalo Solutions
      for (const { smsMessage, phoneNumber } of smsMessages) {
        if (!phoneNumber) continue;
        const sent = await this.naloSmsProvider.sendSms(
          phoneNumber,
          smsMessage.body,
        );
        if (!sent) {
          this.logger.error('SMS provider failed to send message.');
          await this.prisma.smsMessage.update({
            where: { id: smsMessage.id },
            data: { status: PrismaMessageStatus.FAILED },
          });
          continue;
        }
        await this.prisma.smsMessage.update({
          where: { id: smsMessage.id },
          data: {
            status: PrismaMessageStatus.SENT,
            sentAt: new Date(),
          },
        });
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to process SMS job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  /**
   * Get all SMS messages with optional filtering by branch and organisation.
   */
  async getSms(
    branchId?: string,
    organisationId?: string,
  ): Promise<SmsMessageDto[]> {
    try {
      this.logger.log(
        `getSms called with branchId=${branchId} (${typeof branchId}), organisationId=${organisationId} (${typeof organisationId})`,
      );

      const where: Prisma.SmsMessageWhereInput = {};

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

      this.logger.log(`SMS query where clause: ${JSON.stringify(where)}`);

      const messages = await this.prisma.smsMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(
        `Found ${messages.length} SMS messages with filter: organisationId=${organisationId}, branchId=${branchId}`,
      );

      // Process each message to look up recipient information
      const messagesWithRecipientInfo = await Promise.all(
        messages.map(async (message) => {
          // Check if recipients contains valid UUIDs (member IDs)
          const potentialMemberIds = message.recipients.filter((recipient) =>
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
              `Looking up ${potentialMemberIds.length} potential member IDs for SMS ${message.id}`,
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
              `Found ${members.length} members for SMS ${message.id}`,
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

          // For any recipients that aren't member IDs, they're likely direct phone numbers
          const phoneNumberRecipients = message.recipients.filter(
            (recipient) =>
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                recipient,
              ),
          );

          // Add phone numbers as recipient info without member details
          if (phoneNumberRecipients.length > 0) {
            const phoneRecipients = phoneNumberRecipients.map((phone) => ({
              id: `phone-${phone}`,
              phoneNumber: phone,
              fullName: `Phone: ${phone}`,
            }));

            recipientInfo = [...recipientInfo, ...phoneRecipients];
          }

          return {
            ...message,
            status: message.status as unknown as MessageStatus,
            recipientInfo,
          };
        }),
      );

      return messagesWithRecipientInfo;
    } catch (error) {
      this.logger.error(
        `Failed to get SMS messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get a specific SMS message by ID
   * @param id SMS message ID
   * @returns Promise<SmsMessageDto>
   */
  async getSmsMessage(id: string): Promise<SmsMessageDto> {
    try {
      const message = await this.prisma.smsMessage.findUnique({
        where: { id },
      });

      if (!message) {
        throw new Error(`SMS message with ID ${id} not found`);
      }

      // Check if recipients contains valid UUIDs (member IDs)
      const potentialMemberIds = message.recipients.filter((recipient) =>
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
          `Looking up ${potentialMemberIds.length} potential member IDs for SMS ${message.id}`,
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
          `Found ${members.length} members for SMS ${message.id}`,
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

      // For any recipients that aren't member IDs, they're likely direct phone numbers
      const phoneNumberRecipients = message.recipients.filter(
        (recipient) =>
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            recipient,
          ),
      );

      // Add phone numbers as recipient info without member details
      if (phoneNumberRecipients.length > 0) {
        const phoneRecipients = phoneNumberRecipients.map((phone) => ({
          id: `phone-${phone}`,
          phoneNumber: phone,
          fullName: `Phone: ${phone}`,
        }));

        recipientInfo = [...recipientInfo, ...phoneRecipients];
      }

      // Map Prisma MessageStatus to our enum and include recipient info
      return {
        ...message,
        status: message.status as unknown as MessageStatus,
        recipientInfo,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get SMS message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
