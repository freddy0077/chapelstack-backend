"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullToUndefined = nullToUndefined;
exports.prismaToGraphQL = prismaToGraphQL;
function nullToUndefined(value) {
    return value === null ? undefined : value;
}
function prismaToGraphQL(entity) {
    if (!entity || typeof entity !== 'object') {
        return entity;
    }
    const result = { ...entity };
    Object.keys(result).forEach((key) => {
        if (result[key] === null) {
            result[key] = undefined;
        }
        else if (typeof result[key] === 'object' && result[key] !== null) {
            result[key] = prismaToGraphQL(result[key]);
        }
    });
    return result;
}
//# sourceMappingURL=index.js.map