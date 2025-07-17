import { sendSESEmail } from './ses.util';
import { EmailProvider } from './email-provider.interface';

export class SesEmailProvider implements EmailProvider {
  constructor(
    private readonly config: {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    },
  ) {}

  async sendEmail({
    from,
    to,
    subject,
    html,
    text,
  }: {
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    await sendSESEmail({
      region: this.config.region,
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      from,
      to,
      subject,
      html,
      text,
    });
  }
}
