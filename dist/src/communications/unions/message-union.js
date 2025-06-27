"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageUnion = void 0;
const graphql_1 = require("@nestjs/graphql");
const email_message_dto_1 = require("../dto/email-message.dto");
const sms_message_dto_1 = require("../dto/sms-message.dto");
const notification_dto_1 = require("../dto/notification.dto");
exports.MessageUnion = (0, graphql_1.createUnionType)({
    name: 'MessageUnion',
    types: () => [email_message_dto_1.EmailMessageDto, sms_message_dto_1.SmsMessageDto, notification_dto_1.NotificationDto],
    resolveType(value) {
        if ('subject' in value) {
            return email_message_dto_1.EmailMessageDto;
        }
        if ('body' in value && 'senderNumber' in value) {
            return sms_message_dto_1.SmsMessageDto;
        }
        if ('title' in value && 'isRead' in value) {
            return notification_dto_1.NotificationDto;
        }
        return null;
    },
});
//# sourceMappingURL=message-union.js.map