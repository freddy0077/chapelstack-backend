"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormsModule = void 0;
const common_1 = require("@nestjs/common");
const forms_service_1 = require("./services/forms.service");
const form_fields_service_1 = require("./services/form-fields.service");
const form_submissions_service_1 = require("./services/form-submissions.service");
const forms_resolver_1 = require("./resolvers/forms.resolver");
const form_fields_resolver_1 = require("./resolvers/form-fields.resolver");
const form_submissions_resolver_1 = require("./resolvers/form-submissions.resolver");
const prisma_module_1 = require("../prisma/prisma.module");
let FormsModule = class FormsModule {
};
exports.FormsModule = FormsModule;
exports.FormsModule = FormsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            forms_service_1.FormsService,
            form_fields_service_1.FormFieldsService,
            form_submissions_service_1.FormSubmissionsService,
            forms_resolver_1.FormsResolver,
            form_fields_resolver_1.FormFieldsResolver,
            form_submissions_resolver_1.FormSubmissionsResolver,
        ],
        exports: [forms_service_1.FormsService, form_fields_service_1.FormFieldsService, form_submissions_service_1.FormSubmissionsService],
    })
], FormsModule);
//# sourceMappingURL=forms.module.js.map