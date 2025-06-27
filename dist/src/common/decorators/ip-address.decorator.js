"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpAddress = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
exports.IpAddress = (0, common_1.createParamDecorator)((data, context) => {
    const ctx = graphql_1.GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const ip = request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        request.headers['x-real-ip'] ||
        request.connection?.remoteAddress ||
        'unknown';
    return ip;
});
//# sourceMappingURL=ip-address.decorator.js.map