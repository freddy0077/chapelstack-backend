import { registerEnumType } from '@nestjs/graphql';

export enum MessageStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED', // For SMS
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(MessageStatus, {
  name: 'MessageStatus',
  description: 'Status of a message',
});
