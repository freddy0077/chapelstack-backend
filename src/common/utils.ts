/**
 * Utility function to convert null values to undefined
 * This is useful when passing data to functions that expect undefined instead of null
 * @param value The value to check
 * @returns The original value if not null, undefined otherwise
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}
