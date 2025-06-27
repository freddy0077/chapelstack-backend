"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermissions = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'permissions';
const RequirePermissions = (permission) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permission);
exports.RequirePermissions = RequirePermissions;
//# sourceMappingURL=require-permissions.decorator.js.map