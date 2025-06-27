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
exports.PaginatedBranches = void 0;
const graphql_1 = require("@nestjs/graphql");
const branch_entity_1 = require("../entities/branch.entity");
let PaginatedBranches = class PaginatedBranches {
    items;
    totalCount;
    hasNextPage;
};
exports.PaginatedBranches = PaginatedBranches;
__decorate([
    (0, graphql_1.Field)(() => [branch_entity_1.Branch], {
        description: 'A list of branches for the current page',
    }),
    __metadata("design:type", Array)
], PaginatedBranches.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, {
        description: 'Total number of branches matching the filter',
    }),
    __metadata("design:type", Number)
], PaginatedBranches.prototype, "totalCount", void 0);
__decorate([
    (0, graphql_1.Field)({
        description: 'Indicates if there are more branches to fetch',
    }),
    __metadata("design:type", Boolean)
], PaginatedBranches.prototype, "hasNextPage", void 0);
exports.PaginatedBranches = PaginatedBranches = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedBranches);
//# sourceMappingURL=paginated-branches.output.js.map