/**
 * Helper function to convert null to undefined
 * This is useful when passing values from Prisma models (which can have null)
 * to functions that expect undefined instead of null
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}
