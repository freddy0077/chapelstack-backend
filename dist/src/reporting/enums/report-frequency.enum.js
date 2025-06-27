"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportFrequency = void 0;
const graphql_1 = require("@nestjs/graphql");
var ReportFrequency;
(function (ReportFrequency) {
    ReportFrequency["DAILY"] = "DAILY";
    ReportFrequency["WEEKLY"] = "WEEKLY";
    ReportFrequency["MONTHLY"] = "MONTHLY";
    ReportFrequency["QUARTERLY"] = "QUARTERLY";
})(ReportFrequency || (exports.ReportFrequency = ReportFrequency = {}));
(0, graphql_1.registerEnumType)(ReportFrequency, {
    name: 'ReportFrequency',
    description: 'Frequency at which a report is scheduled to run',
});
//# sourceMappingURL=report-frequency.enum.js.map