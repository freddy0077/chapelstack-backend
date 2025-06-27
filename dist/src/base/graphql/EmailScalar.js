"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailScalar = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("graphql");
const EMAIL_ADDRESS_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
let EmailScalar = class EmailScalar {
    description = 'Email custom scalar type';
    parseValue(value) {
        if (typeof value !== 'string' || !EMAIL_ADDRESS_REGEX.test(value)) {
            throw new Error('Invalid email address format');
        }
        return value;
    }
    serialize(value) {
        if (typeof value !== 'string') {
            throw new Error(`EmailScalar can only serialize string values, but got ${typeof value}`);
        }
        return value;
    }
    parseLiteral(ast) {
        if (ast.kind === graphql_2.Kind.STRING) {
            if (!EMAIL_ADDRESS_REGEX.test(ast.value)) {
                throw new Error('Invalid email address format');
            }
            return ast.value;
        }
        throw new Error('EmailScalar can only parse string literals.');
    }
};
exports.EmailScalar = EmailScalar;
exports.EmailScalar = EmailScalar = __decorate([
    (0, graphql_1.Scalar)('Email', () => EmailScalar)
], EmailScalar);
//# sourceMappingURL=EmailScalar.js.map