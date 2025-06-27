import { createUnionType } from '@nestjs/graphql';
import { EmailMessageDto } from '../dto/email-message.dto';
import { SmsMessageDto } from '../dto/sms-message.dto';
import { NotificationDto } from '../dto/notification.dto';

export const MessageUnion = createUnionType({
  name: 'MessageUnion',
  types: () => [EmailMessageDto, SmsMessageDto, NotificationDto] as const,
  resolveType(value) {
    if ('subject' in value) {
      return EmailMessageDto;
    }
    if ('body' in value && 'senderNumber' in value) {
      return SmsMessageDto;
    }
    if ('title' in value && 'isRead' in value) {
      return NotificationDto;
    }
    return null;
  },
});
