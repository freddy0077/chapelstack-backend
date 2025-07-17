export interface EmailProvider {
  sendEmail(options: {
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void>;
}
