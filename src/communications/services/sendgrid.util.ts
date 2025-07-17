import sgMail from '@sendgrid/mail';
import { EmailProvider } from './email-provider.interface';

export class SendGridEmailProvider implements EmailProvider {
  constructor(private readonly apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

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
    // Ensure we have at least one form of content
    const htmlContent = html || '<p>No content provided</p>';
    const textContent = text || 'No content provided';

    const msg: any = {
      from,
      to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    try {
      await sgMail.send(msg);
    } catch (error: any) {
      if (error.response && error.response.body) {
        // Log the full error response from SendGrid
        // eslint-disable-next-line no-console
        console.error(
          'SendGrid error response:',
          JSON.stringify(error.response.body),
        );
      }
      throw error;
    }
  }
}
