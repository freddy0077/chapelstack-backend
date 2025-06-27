"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    async sendScheduledReport(params) {
        this.logger.log(`Sending scheduled report email: ${params.subject} to ${params.to.join(', ')}`);
        this.logger.log(`Report: ${params.reportName}`);
        if (params.fileUrl) {
            this.logger.log(`File URL: ${params.fileUrl}`);
        }
        return Promise.resolve();
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map