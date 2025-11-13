export type NotificationChannel = 'EMAIL' | 'SMS';

export interface RecipientInput {
  id?: string;
  email?: string;
  phone?: string;
  name?: string;
}

export interface SendNotificationInput {
  channel: NotificationChannel;
  recipients: RecipientInput[];
  templateKey?: string;
  templateId?: string;
  variables?: Record<string, any>;
  scheduleAt?: Date | null;
  branchId?: string;
  organisationId?: string;
  groupIds?: string[];
  filters?: any[];
  birthdayRange?: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
}

export interface ITemplateEngine {
  render(templateKey: string, variables: Record<string, any>): Promise<string>;
}

export interface INotificationDispatcher {
  send(input: SendNotificationInput): Promise<{ success: boolean; count: number }>; 
}
