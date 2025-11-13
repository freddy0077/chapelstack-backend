import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Controller('engagement/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('paystack')
  @HttpCode(HttpStatus.OK)
  async handlePaystackWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    this.logger.log('Received Paystack webhook');

    // Verify signature
    const isValid = this.webhookService.verifySignature(payload, signature);
    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      return { success: false, message: 'Invalid signature' };
    }

    // Process webhook
    const result = await this.webhookService.handleWebhook({
      event: payload.event,
      data: payload.data,
    });

    return result;
  }
}
