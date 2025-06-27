"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModule = void 0;
const common_1 = require("@nestjs/common");
const DateTimeScalar_1 = require("./graphql/DateTimeScalar");
const EmailScalar_1 = require("./graphql/EmailScalar");
const PhoneNumberScalar_1 = require("./graphql/PhoneNumberScalar");
const all_exceptions_filter_1 = require("./filters/all-exceptions.filter");
let BaseModule = class BaseModule {
};
exports.BaseModule = BaseModule;
exports.BaseModule = BaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            DateTimeScalar_1.DateTimeScalar,
            EmailScalar_1.EmailScalar,
            PhoneNumberScalar_1.PhoneNumberScalar,
            all_exceptions_filter_1.AllExceptionsFilter,
        ],
        exports: [
            DateTimeScalar_1.DateTimeScalar,
            EmailScalar_1.EmailScalar,
            PhoneNumberScalar_1.PhoneNumberScalar,
            all_exceptions_filter_1.AllExceptionsFilter,
        ],
    })
], BaseModule);
//# sourceMappingURL=base.module.js.map