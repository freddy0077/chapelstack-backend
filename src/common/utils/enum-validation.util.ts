import { ValidationOptions, registerDecorator } from 'class-validator';

/**
 * Custom validator for enum values that works safely with Prisma-generated enums
 * Avoids the "Cannot convert undefined or null to object" error that can occur with IsEnum
 *
 * @param enumValues An array of valid enum values or an enum object
 * @param validationOptions Additional validation options
 * @returns PropertyDecorator
 */
export function IsValidEnum(
  enumValues: any[] | object,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    const values = Array.isArray(enumValues)
      ? enumValues
      : Object.values(enumValues);

    registerDecorator({
      name: 'isValidEnum',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            value === undefined || value === null || values.includes(value)
          );
        },
        defaultMessage() {
          return `${propertyName} must be one of the following values: ${values.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Helper function to create a GraphQL-compatible enum from a Prisma enum
 *
 * @param enumObj The Prisma enum object
 * @returns An object with the same keys and values as the Prisma enum
 */
export function createGraphQLEnum(enumObj: any): Record<string, string> {
  // If the enum is undefined or null, return an empty object
  if (!enumObj) return {};

  // For safety, try to get enum values using different approaches
  try {
    // First try to get enum values directly
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const values = Object.values(enumObj);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const keys = Object.keys(enumObj);

    if (values.length === 0 || keys.length === 0) {
      return {};
    }

    // Create a new enum object with the same keys and values
    return keys.reduce(
      (acc, key) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        acc[key] = enumObj[key];
        return acc;
      },
      {} as Record<string, string>,
    );
  } catch (error) {
    console.error('Error creating GraphQL enum:', error);
    return {};
  }
}
