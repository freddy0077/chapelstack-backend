"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneNumberScalar = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("graphql");
const PHONE_NUMBER_REGEX = /^\+[1-9]\d{1,14}$/;
let PhoneNumberScalar = class PhoneNumberScalar {
    description = 'Phone number custom scalar type (E.164 format)';
    parseValue(value) {
        if (typeof value !== 'string' || !PHONE_NUMBER_REGEX.test(value)) {
            throw new Error('Invalid phone number format. Expected E.164 format (e.g., +12125551234)');
        }
        return value;
    }
    serialize(value) {
        if (typeof value !== 'string') {
            throw new Error(`PhoneNumberScalar can only serialize string values, but got ${typeof value}`);
        }
        return value;
    }
    parseLiteral(ast) {
        if (ast.kind === graphql_2.Kind.STRING) {
            if (!PHONE_NUMBER_REGEX.test(ast.value)) {
                throw new Error('Invalid phone number format. Expected E.164 format (e.g., +12125551234)');
            }
            return ast.value;
        }
        throw new Error('PhoneNumberScalar can only parse string literals.');
    }
};
exports.PhoneNumberScalar = PhoneNumberScalar;
exports.PhoneNumberScalar = PhoneNumberScalar = __decorate([
    (0, graphql_1.Scalar)('PhoneNumber', () => PhoneNumberScalar)
], PhoneNumberScalar);
//# sourceMappingURL=PhoneNumberScalar.js.map