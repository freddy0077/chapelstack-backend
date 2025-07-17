import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NaloSmsProvider {
  private readonly logger = new Logger(NaloSmsProvider.name);
  private readonly apiKey: string;
  private readonly senderId: string;
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiKey = this.configService.get<string>('NALO_API_KEY');
    if (!apiKey) {
      const errorMessage =
        'NALO_API_KEY is not configured in environment variables.';
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    this.apiKey = apiKey;

    this.senderId =
      this.configService.get<string>('NALO_SENDER_ID') || 'Chapel';
    this.apiUrl =
      this.configService.get<string>('NALO_API_URL') ||
      'https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/';
  }

  async sendSms(recipients: string, message: string): Promise<boolean> {
    const payload = {
      key: this.apiKey,
      sender_id: this.senderId,
      msisdn: recipients,
      message: message,
    };

    try {
      this.logger.debug(
        `Sending SMS to ${recipients} with payload: ${JSON.stringify({
          ...payload,
        })}`,
      );

      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload),
      );

      this.logger.debug(`Nalo API Response: ${JSON.stringify(response.data)}`);

      if (
        response.data &&
        // Accept both legacy and new Nalo success codes
        (response.data.status === '1701' ||
          response.data.status === 'success' ||
          response.data.code === '200')
      ) {
        this.logger.log(
          `SMS successfully queued for delivery to ${recipients} via Nalo.`,
        );
        return true;
      } else {
        this.logger.error(
          `Failed to send SMS via Nalo. API Response: ${JSON.stringify(
            response.data,
          )}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error calling Nalo SMS API: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
