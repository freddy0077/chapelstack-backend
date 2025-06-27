"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaType = void 0;
const graphql_1 = require("@nestjs/graphql");
var MediaType;
(function (MediaType) {
    MediaType["AUDIO"] = "AUDIO";
    MediaType["AUDIO_FILE"] = "AUDIO_FILE";
    MediaType["VIDEO"] = "VIDEO";
    MediaType["IMAGE"] = "IMAGE";
    MediaType["DOCUMENT"] = "DOCUMENT";
    MediaType["DOCUMENT_PDF"] = "DOCUMENT_PDF";
    MediaType["DOCUMENT_WORD"] = "DOCUMENT_WORD";
    MediaType["SLIDESHOW"] = "SLIDESHOW";
    MediaType["OTHER"] = "OTHER";
})(MediaType || (exports.MediaType = MediaType = {}));
(0, graphql_1.registerEnumType)(MediaType, {
    name: 'MediaType',
    description: 'Type of media item',
});
//# sourceMappingURL=media-type.enum.js.map