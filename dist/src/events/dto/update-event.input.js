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
exports.UpdateEventInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const create_event_input_1 = require("./create-event.input");
const class_validator_1 = require("class-validator");
let UpdateEventInput = class UpdateEventInput extends (0, graphql_1.PartialType)(create_event_input_1.CreateEventInput) {
    id;
};
exports.UpdateEventInput = UpdateEventInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Event ID is required' }),
    (0, class_validator_1.IsUUID)(undefined, { message: 'Event ID must be a valid UUID' }),
    __metadata("design:type", String)
], UpdateEventInput.prototype, "id", void 0);
exports.UpdateEventInput = UpdateEventInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateEventInput);
//# sourceMappingURL=update-event.input.js.map