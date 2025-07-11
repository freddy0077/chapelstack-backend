import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export async function sendSESEmail({
  region,
  accessKeyId,
  secretAccessKey,
  from,
  to,
  subject,
  html,
  text,
}: {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
}): Promise<void> {
  const ses = new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const params = {
    Destination: {
      ToAddresses: to,
    },
    Message: {
      Body: {
        Html: html ? { Charset: 'UTF-8', Data: html } : undefined,
        Text: text ? { Charset: 'UTF-8', Data: text } : undefined,
      },
      Subject: { Charset: 'UTF-8', Data: subject },
    },
    Source: from,
  };

  await ses.send(new SendEmailCommand(params));
}
