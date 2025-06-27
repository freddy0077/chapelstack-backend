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
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let AllExceptionsFilter = class AllExceptionsFilter {
    httpAdapterHost;
    constructor(httpAdapterHost) {
        this.httpAdapterHost = httpAdapterHost;
    }
    catch(exception, host) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const httpStatus = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: host.getType() === 'http'
                ? httpAdapter.getRequestUrl(ctx.getRequest())
                : 'N/A (GraphQL Error)',
            message: (() => {
                if (!(exception instanceof common_1.HttpException)) {
                    return 'Internal server error';
                }
                const errorResponse = exception.getResponse();
                if (typeof errorResponse === 'string') {
                    return errorResponse;
                }
                if (errorResponse && typeof errorResponse === 'object') {
                    if ('message' in errorResponse) {
                        const messageValue = errorResponse.message;
                        if (Array.isArray(messageValue)) {
                            return messageValue.join(', ');
                        }
                        if (typeof messageValue === 'string') {
                            return messageValue;
                        }
                    }
                }
                if (typeof exception.message === 'string' &&
                    exception.message.trim() !== '') {
                    return exception.message;
                }
                return 'Internal server error';
            })(),
        };
        if (host.getType() === 'http') {
            httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
        }
        else if (host.getType() === 'graphql') {
            console.error('[AllExceptionsFilter] GraphQL error context. Response body prepared but not sent via httpAdapter.reply:', JSON.stringify(responseBody));
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map