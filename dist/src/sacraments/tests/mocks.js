"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSacramentalRecordInput = exports.CreateSacramentalRecordInput = exports.SacramentalRecord = exports.SacramentalRecordFilterInput = exports.SacramentType = void 0;
var SacramentType;
(function (SacramentType) {
    SacramentType["BAPTISM"] = "BAPTISM";
    SacramentType["EUCHARIST_FIRST_COMMUNION"] = "EUCHARIST_FIRST_COMMUNION";
    SacramentType["CONFIRMATION"] = "CONFIRMATION";
    SacramentType["RECONCILIATION_FIRST"] = "RECONCILIATION_FIRST";
    SacramentType["ANOINTING_OF_THE_SICK"] = "ANOINTING_OF_THE_SICK";
    SacramentType["HOLY_ORDERS_DIACONATE"] = "HOLY_ORDERS_DIACONATE";
    SacramentType["HOLY_ORDERS_PRIESTHOOD"] = "HOLY_ORDERS_PRIESTHOOD";
    SacramentType["MATRIMONY"] = "MATRIMONY";
    SacramentType["RCIA_INITIATION"] = "RCIA_INITIATION";
    SacramentType["OTHER"] = "OTHER";
})(SacramentType || (exports.SacramentType = SacramentType = {}));
class SacramentalRecordFilterInput {
    sacramentType;
    dateFrom;
    dateTo;
    branchId;
    certificateNumber;
    officiantName;
    locationOfSacrament;
}
exports.SacramentalRecordFilterInput = SacramentalRecordFilterInput;
class SacramentalRecord {
    id;
    memberId;
    sacramentType;
    dateOfSacrament;
    locationOfSacrament;
    officiantName;
    officiantId;
    godparent1Name;
    godparent2Name;
    sponsorName;
    witness1Name;
    witness2Name;
    certificateNumber;
    certificateUrl;
    notes;
    branchId;
    createdAt;
    updatedAt;
}
exports.SacramentalRecord = SacramentalRecord;
class CreateSacramentalRecordInput {
    memberId;
    sacramentType;
    dateOfSacrament;
    locationOfSacrament;
    officiantName;
    officiantId;
    godparent1Name;
    godparent2Name;
    sponsorName;
    witness1Name;
    witness2Name;
    certificateNumber;
    notes;
    branchId;
}
exports.CreateSacramentalRecordInput = CreateSacramentalRecordInput;
class UpdateSacramentalRecordInput {
    id;
    sacramentType;
    dateOfSacrament;
    locationOfSacrament;
    officiantName;
    officiantId;
    godparent1Name;
    godparent2Name;
    sponsorName;
    witness1Name;
    witness2Name;
    certificateNumber;
    certificateUrl;
    notes;
}
exports.UpdateSacramentalRecordInput = UpdateSacramentalRecordInput;
//# sourceMappingURL=mocks.js.map