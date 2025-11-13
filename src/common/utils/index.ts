// Utility Classes
export { ValidationUtil } from './validation.util';
export { DateUtil } from './date.util';
export { StringUtil } from './string.util';
export { ArrayUtil } from './array.util';
export { ObjectUtil } from './object.util';
export { FileUtil } from './file.util';
export { PaginationUtil } from './pagination.util';

/**
 * Converts null values to undefined
 * This is useful when passing data to functions that expect undefined instead of null
 * @param value The value to convert
 * @returns The value or undefined if the value is null
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Converts Prisma entity to GraphQL entity
 * This is useful when returning data from Prisma to GraphQL
 * @param entity The Prisma entity to convert
 * @returns The GraphQL entity with null values converted to undefined
 */
export function prismaToGraphQL<T>(entity: T): T {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  const result = { ...entity };

  // Convert all null values to undefined
  Object.keys(result).forEach((key) => {
    if (result[key] === null) {
      result[key] = undefined;
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Recursively convert nested objects
      result[key] = prismaToGraphQL(result[key]);
    }
  });

  return result;
}
