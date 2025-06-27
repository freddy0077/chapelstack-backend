import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SendSmsInput } from '../dto/send-sms.input';
import { SmsMessageDto } from '../dto/sms-message.dto';
import { MessageStatus } from '../enums/message-status.enum';
import { MessageStatus as PrismaMessageStatus } from '@prisma/client';

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
  ) {}

  /**
   * Send an SMS to one or more recipients
   * @param input SendSmsInput containing recipients, message, etc.
   * @returns Promise<boolean> indicating success or failure
   */
  async sendSms(input: SendSmsInput): Promise<boolean> {
    try {
      const { branchId, organisationId, ...rest } = input;
      // Create a record of the SMS in the database
      const data: Prisma.SmsMessageCreateInput = {
        body: rest.message,
        senderNumber:
          this.configService.get<string>('SMS_SENDER_NUMBER') || 'CHURCH',
        recipients: rest.recipients,
        status: PrismaMessageStatus.SENDING,
      };

      if (branchId) {
        data.branch = { connect: { id: branchId } };
      }
      if (organisationId) {
        data.organisation = { connect: { id: organisationId } };
      }

      const smsMessage = await this.prisma.smsMessage.create({ data });

      // TODO: Implement actual SMS sending using a provider like Twilio, AWS SNS, etc.
      // For now, we'll just log the SMS and update the status
      this.logger.log(
        `[MOCK] Sending SMS to ${input.recipients.join(', ')}: ${input.message}`,
      );

      // Update the SMS status to SENT
      await this.prisma.smsMessage.update({
        where: { id: smsMessage.id },
        data: {
          status: PrismaMessageStatus.SENT,
          sentAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  /**
   * Get all SMS messages, optionally filtered by branch and organisation
   * @param branchId Optional branch ID to filter messages
   * @param organisationId Optional organisation ID to filter messages
   * @returns Promise<SmsMessageDto[]>
   */
  async getSms(
    branchId?: string,
    organisationId?: string,
  ): Promise<SmsMessageDto[]> {
    try {
      const where: Prisma.SmsMessageWhereInput = {};
      if (branchId) {
        where.branchId = branchId;
      }
      if (organisationId) {
        where.organisationId = organisationId;
      }
      const messages = await this.prisma.smsMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // Map Prisma MessageStatus to our enum
      return messages.map((message) => ({
        ...message,
        status: message.status as unknown as MessageStatus,
      }));
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

      // Map Prisma MessageStatus to our enum
      return {
        ...message,
        status: message.status as unknown as MessageStatus,
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
