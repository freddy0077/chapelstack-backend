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
exports.UpdateNotificationInput = void 0;
const create_notification_input_1 = require("./create-notification.input");
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let UpdateNotificationInput = class UpdateNotificationInput extends (0, graphql_1.PartialType)(create_notification_input_1.CreateNotificationInput) {
    id;
};
exports.UpdateNotificationInput = UpdateNotificationInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateNotificationInput.prototype, "id", void 0);
exports.UpdateNotificationInput = UpdateNotificationInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateNotificationInput);
//# sourceMappingURL=update-notification.input.js.map