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
exports.UpdateBranchSettingInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let UpdateBranchSettingInput = class UpdateBranchSettingInput {
    key;
    value;
};
exports.UpdateBranchSettingInput = UpdateBranchSettingInput;
__decorate([
    (0, graphql_1.Field)({
        description: 'The key of the setting to update. e.g., "defaultCurrency", "timezone"',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateBranchSettingInput.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)({
        description: 'The new value for the setting.',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateBranchSettingInput.prototype, "value", void 0);
exports.UpdateBranchSettingInput = UpdateBranchSettingInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateBranchSettingInput);
//# sourceMappingURL=update-branch-setting.input.js.map