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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildrenController = void 0;
const common_1 = require("@nestjs/common");
const children_service_1 = require("../services/children.service");
const create_child_input_1 = require("../dto/create-child.input");
const update_child_input_1 = require("../dto/update-child.input");
const child_filter_input_1 = require("../dto/child-filter.input");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
let ChildrenController = class ChildrenController {
    childrenService;
    constructor(childrenService) {
        this.childrenService = childrenService;
    }
    create(createChildInput) {
        return this.childrenService.create(createChildInput);
    }
    findAll(filter) {
        return this.childrenService.findAll(filter);
    }
    findOne(id) {
        return this.childrenService.findOne(id);
    }
    findByGuardian(guardianId) {
        return this.childrenService.findByGuardian(guardianId);
    }
    update(id, updateChildInput) {
        return this.childrenService.update(id, updateChildInput);
    }
    remove(id) {
        return this.childrenService.remove(id);
    }
    getRecentCheckIns(id, limit) {
        return this.childrenService.getRecentCheckIns(id, limit);
    }
};
exports.ChildrenController = ChildrenController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'Child' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_child_input_1.CreateChildInput]),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Child' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [child_filter_input_1.ChildFilterInput]),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Child' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('by-guardian/:guardianId'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Child' }),
    __param(0, (0, common_1.Param)('guardianId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "findByGuardian", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'Child' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_child_input_1.UpdateChildInput]),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'Child' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/recent-check-ins'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "getRecentCheckIns", null);
exports.ChildrenController = ChildrenController = __decorate([
    (0, common_1.Controller)('children'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [children_service_1.ChildrenService])
], ChildrenController);
//# sourceMappingURL=children.controller.js.map