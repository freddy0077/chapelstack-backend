"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidEnum = IsValidEnum;
exports.createGraphQLEnum = createGraphQLEnum;
const class_validator_1 = require("class-validator");
function IsValidEnum(enumValues, validationOptions) {
    return function (object, propertyName) {
        const values = Array.isArray(enumValues)
            ? enumValues
            : Object.values(enumValues);
        (0, class_validator_1.registerDecorator)({
            name: 'isValidEnum',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    return (value === undefined || value === null || values.includes(value));
                },
                defaultMessage() {
                    return `${propertyName} must be one of the following values: ${values.join(', ')}`;
                },
            },
        });
    };
}
function createGraphQLEnum(enumObj) {
    if (!enumObj)
        return {};
    try {
        const values = Object.values(enumObj);
        const keys = Object.keys(enumObj);
        if (values.length === 0 || keys.length === 0) {
            return {};
        }
        return keys.reduce((acc, key) => {
            acc[key] = enumObj[key];
            return acc;
        }, {});
    }
    catch (error) {
        console.error('Error creating GraphQL enum:', error);
        return {};
    }
}
//# sourceMappingURL=enum-validation.util.js.map