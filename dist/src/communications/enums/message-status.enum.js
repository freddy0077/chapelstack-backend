"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["DRAFT"] = "DRAFT";
    MessageStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    MessageStatus["SCHEDULED"] = "SCHEDULED";
    MessageStatus["SENDING"] = "SENDING";
    MessageStatus["SENT"] = "SENT";
    MessageStatus["DELIVERED"] = "DELIVERED";
    MessageStatus["FAILED"] = "FAILED";
    MessageStatus["CANCELLED"] = "CANCELLED";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
(0, graphql_1.registerEnumType)(MessageStatus, {
    name: 'MessageStatus',
    description: 'Status of a message',
});
//# sourceMappingURL=message-status.enum.js.map