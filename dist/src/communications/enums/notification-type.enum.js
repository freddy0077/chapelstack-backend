"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
const graphql_1 = require("@nestjs/graphql");
var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "INFO";
    NotificationType["WARNING"] = "WARNING";
    NotificationType["SUCCESS"] = "SUCCESS";
    NotificationType["ERROR"] = "ERROR";
    NotificationType["EVENT_REMINDER"] = "EVENT_REMINDER";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
(0, graphql_1.registerEnumType)(NotificationType, {
    name: 'NotificationType',
    description: 'Type of notification',
});
//# sourceMappingURL=notification-type.enum.js.map