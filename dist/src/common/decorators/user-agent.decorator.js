"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAgent = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
exports.UserAgent = (0, common_1.createParamDecorator)((data, context) => {
    const ctx = graphql_1.GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.headers['user-agent'] || 'unknown';
});
//# sourceMappingURL=user-agent.decorator.js.map