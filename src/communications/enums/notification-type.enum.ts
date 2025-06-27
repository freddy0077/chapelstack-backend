import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  EVENT_REMINDER = 'EVENT_REMINDER',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Type of notification',
});
