import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { PaystackService } from '../services/paystack.service';

@Controller('webhooks/paystack')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly paystackService: PaystackService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers() headers: any,
  ): Promise<{ status: string; message: string }> {
    try {
      this.logger.log('Received Paystack webhook');

      // Verify webhook signature
      const signature = headers['x-paystack-signature'];
      if (!signature) {
        this.logger.warn('Webhook received without signature');
        throw new UnauthorizedException('Missing webhook signature');
      }

      const isValidSignature = this.paystackService.verifyWebhookSignature(
        payload,
        signature,
      );
      if (!isValidSignature) {
        this.logger.warn('Invalid webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // Extract event data
      const { event, data } = payload;

      if (!event || !data) {
        this.logger.warn('Invalid webhook payload structure');
        throw new BadRequestException('Invalid webhook payload');
      }

      // Process the webhook event
      await this.webhookService.processWebhookEvent(event, data, data.id);

      this.logger.log(`Webhook processed successfully: ${event}`);

      return {
        status: 'success',
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error(
        `Webhook processing failed: ${error.message}`,
        error.stack,
      );

      // Return success to Paystack to avoid retries for validation errors
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        return {
          status: 'error',
          message: error.message,
        };
      }

      // For other errors, let Paystack retry
      throw error;
    }
  }

  @Post('retry-failed')
  @HttpCode(HttpStatus.OK)
  async retryFailedWebhooks(): Promise<{ status: string; message: string }> {
    try {
      this.logger.log('Retrying failed webhook events');

      await this.webhookService.retryFailedWebhookEvents();

      return {
        status: 'success',
        message: 'Failed webhook events retried successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to retry webhook events: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
