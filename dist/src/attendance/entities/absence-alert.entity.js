"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsenceAlertResult = exports.AbsentMember = void 0;
const graphql_1 = require("@nestjs/graphql");
let AbsentMember = class AbsentMember {
    id;
    firstName;
    lastName;
    email;
    phone;
    lastAttendance;
};
exports.AbsentMember = AbsentMember;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AbsentMember.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AbsentMember.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AbsentMember.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AbsentMember.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AbsentMember.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], AbsentMember.prototype, "lastAttendance", void 0);
exports.AbsentMember = AbsentMember = __decorate([
    (0, graphql_1.ObjectType)()
], AbsentMember);
let AbsenceAlertResult = class AbsenceAlertResult {
    success;
    count;
    members;
};
exports.AbsenceAlertResult = AbsenceAlertResult;
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], AbsenceAlertResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AbsenceAlertResult.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AbsentMember]),
    __metadata("design:type", Array)
], AbsenceAlertResult.prototype, "members", void 0);
exports.AbsenceAlertResult = AbsenceAlertResult = __decorate([
    (0, graphql_1.ObjectType)()
], AbsenceAlertResult);
//# sourceMappingURL=absence-alert.entity.js.map