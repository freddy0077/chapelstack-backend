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
var PermissionsGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let PermissionsGuard = PermissionsGuard_1 = class PermissionsGuard {
    reflector;
    logger = new common_1.Logger(PermissionsGuard_1.name);
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        let requiredPermissionsSet;
        const rawPermissionsFromReflector = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!rawPermissionsFromReflector) {
            this.logger.debug('No permissions metadata found (PERMISSIONS_KEY not set or undefined). Access granted.');
            return true;
        }
        if (Array.isArray(rawPermissionsFromReflector)) {
            requiredPermissionsSet = rawPermissionsFromReflector;
        }
        else {
            this.logger.verbose(`Reflector returned a single permission object: ${JSON.stringify(rawPermissionsFromReflector)}. Wrapping in array.`);
            if (typeof rawPermissionsFromReflector === 'object' &&
                rawPermissionsFromReflector !== null &&
                'action' in rawPermissionsFromReflector &&
                'subject' in rawPermissionsFromReflector) {
                requiredPermissionsSet = [rawPermissionsFromReflector];
            }
            else {
                this.logger.error(`Unexpected permission metadata format from reflector (expected PermissionDef object, got ${typeof rawPermissionsFromReflector}): ${JSON.stringify(rawPermissionsFromReflector)}. Access denied.`);
                return false;
            }
        }
        if (requiredPermissionsSet.length === 0) {
            this.logger.debug('Permissions decorator found, but no permissions specified or processed set is empty. Access granted.');
            return true;
        }
        this.logger.debug(`Effective permissions to check: ${JSON.stringify(requiredPermissionsSet)}`);
        let user;
        const contextType = context.getType().toString();
        if (contextType === 'graphql') {
            const ctx = graphql_1.GqlExecutionContext.create(context);
            const gqlCtx = ctx.getContext();
            user = gqlCtx.req?.user;
        }
        else if (contextType === 'http') {
            const request = context
                .switchToHttp()
                .getRequest();
            user = request.user;
        }
        else {
            this.logger.warn(`Unknown execution context type: ${contextType}. Access denied.`);
            return false;
        }
        if (!user) {
            this.logger.warn(`No user found on request (context: ${contextType}). Access denied.`);
            return false;
        }
        this.logger.verbose(`User object for permission check (context: ${contextType}): ${JSON.stringify(user, null, 2)}`);
        return this.hasRequiredPermissions(user, requiredPermissionsSet);
    }
    hasRequiredPermissions(user, requiredPermissionsSet) {
        this.logger.debug(`Checking permissions for user: ${user.email || user.id}. Required: ${JSON.stringify(requiredPermissionsSet)}`);
        if (user.roles && Array.isArray(user.roles)) {
            const isSuperAdmin = user.roles.some((role) => {
                if (!role || typeof role.name !== 'string') {
                    this.logger.warn(`Malformed role object in user.roles: ${JSON.stringify(role)}`);
                    return false;
                }
                const roleNameLower = role.name.toLowerCase();
                this.logger.debug(`Checking role: ${role.name} (lower: ${roleNameLower}) against 'super_admin'`);
                return roleNameLower === 'super_admin';
            });
            if (isSuperAdmin) {
                this.logger.log(`User ${user.email || user.id} is SUPER_ADMIN. Access granted.`);
                return true;
            }
        }
        else {
            this.logger.warn(`User ${user.email || user.id} has no 'roles' property or it's not an array.`);
        }
        const userPermissions = [];
        if (user.roles && Array.isArray(user.roles)) {
            user.roles.forEach((role) => {
                if (role.permissions && Array.isArray(role.permissions)) {
                    const validPermissions = role.permissions
                        .filter((p) => p &&
                        typeof p.action === 'string' &&
                        typeof p.subject === 'string')
                        .map((p) => ({ action: p.action, subject: p.subject }));
                    userPermissions.push(...validPermissions);
                }
                else {
                    this.logger.debug(`Role '${role.name || 'Unnamed Role'}' has no 'permissions' array or it's malformed/missing. Role object details: ${JSON.stringify(role)}`);
                }
            });
        }
        this.logger.debug(`User ${user.email || user.id} has collected effective permissions: ${JSON.stringify(userPermissions)}`);
        if (userPermissions.length === 0 && requiredPermissionsSet.length > 0) {
            this.logger.warn(`User ${user.email || user.id} has no permissions, but some are required (${JSON.stringify(requiredPermissionsSet)}). Access denied.`);
            return false;
        }
        const hasAllRequired = requiredPermissionsSet.every((requiredPerm) => {
            const found = userPermissions.some((userPerm) => userPerm.action.toLowerCase() === requiredPerm.action.toLowerCase() &&
                userPerm.subject.toLowerCase() === requiredPerm.subject.toLowerCase());
            if (!found) {
                this.logger.warn(`User ${user.email || user.id} MISSING required permission: ${JSON.stringify(requiredPerm)}`);
            }
            else {
                this.logger.debug(`User ${user.email || user.id} HAS required permission: ${JSON.stringify(requiredPerm)}`);
            }
            return found;
        });
        if (hasAllRequired) {
            this.logger.log(`User ${user.email || user.id} has all required permissions. Access granted.`);
        }
        else {
            this.logger.warn(`User ${user.email || user.id} does NOT have all required permissions. Access denied.`);
        }
        return hasAllRequired;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = PermissionsGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map