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
exports.UpdateVolunteerInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const create_volunteer_input_1 = require("./create-volunteer.input");
let UpdateVolunteerInput = class UpdateVolunteerInput extends (0, graphql_1.PartialType)(create_volunteer_input_1.CreateVolunteerInput) {
    id;
};
exports.UpdateVolunteerInput = UpdateVolunteerInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateVolunteerInput.prototype, "id", void 0);
exports.UpdateVolunteerInput = UpdateVolunteerInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateVolunteerInput);
//# sourceMappingURL=update-volunteer.input.js.map