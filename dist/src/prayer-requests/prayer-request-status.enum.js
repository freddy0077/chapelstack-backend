"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrayerRequestStatusEnum = void 0;
const graphql_1 = require("@nestjs/graphql");
var PrayerRequestStatusEnum;
(function (PrayerRequestStatusEnum) {
    PrayerRequestStatusEnum["NEW"] = "NEW";
    PrayerRequestStatusEnum["IN_PROGRESS"] = "IN_PROGRESS";
    PrayerRequestStatusEnum["ANSWERED"] = "ANSWERED";
})(PrayerRequestStatusEnum || (exports.PrayerRequestStatusEnum = PrayerRequestStatusEnum = {}));
(0, graphql_1.registerEnumType)(PrayerRequestStatusEnum, {
    name: 'PrayerRequestStatusEnum',
});
//# sourceMappingURL=prayer-request-status.enum.js.map