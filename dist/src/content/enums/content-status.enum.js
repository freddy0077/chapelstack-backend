"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "DRAFT";
    ContentStatus["PUBLISHED"] = "PUBLISHED";
    ContentStatus["ARCHIVED"] = "ARCHIVED";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
(0, graphql_1.registerEnumType)(ContentStatus, {
    name: 'ContentStatus',
    description: 'Status of the content/sermon',
});
//# sourceMappingURL=content-status.enum.js.map