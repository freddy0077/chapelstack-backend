"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["PENDING"] = "PENDING";
    SubmissionStatus["COMPLETED"] = "COMPLETED";
    SubmissionStatus["REJECTED"] = "REJECTED";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
(0, graphql_1.registerEnumType)(SubmissionStatus, {
    name: 'SubmissionStatus',
    description: 'Status of a form submission',
});
//# sourceMappingURL=submission-status.enum.js.map