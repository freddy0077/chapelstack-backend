"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMemberRole = void 0;
const graphql_1 = require("@nestjs/graphql");
var GroupMemberRole;
(function (GroupMemberRole) {
    GroupMemberRole["LEADER"] = "LEADER";
    GroupMemberRole["ASSISTANT_LEADER"] = "ASSISTANT_LEADER";
    GroupMemberRole["MEMBER"] = "MEMBER";
    GroupMemberRole["VOLUNTEER"] = "VOLUNTEER";
})(GroupMemberRole || (exports.GroupMemberRole = GroupMemberRole = {}));
(0, graphql_1.registerEnumType)(GroupMemberRole, {
    name: 'GroupMemberRole',
    description: 'Roles available for ministry and small group members',
});
//# sourceMappingURL=group-member-role.enum.js.map