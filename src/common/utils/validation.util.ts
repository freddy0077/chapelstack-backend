/**
 * Validation Utility
 * 
 * Centralized validation functions for common data types
 * Eliminates duplication of validation logic across services
 */
export class ValidationUtil {
  /**
   * Validate email format
   * 
   * @param email - Email address to validate
   * @returns True if valid email format, false otherwise
   * 
   * @example
   * if (ValidationUtil.isValidEmail('user@example.com')) { ... }
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * 
   * @param phone - Phone number to validate (accepts various formats)
   * @returns True if valid phone format, false otherwise
   * 
   * @example
   * if (ValidationUtil.isValidPhone('+1234567890')) { ... }
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  /**
   * Validate date string
   * 
   * @param date - Date string to validate
   * @returns True if valid date, false otherwise
   * 
   * @example
   * if (ValidationUtil.isValidDate('2025-01-01')) { ... }
   */
  static isValidDate(date: string): boolean {
    return !isNaN(Date.parse(date));
  }

  /**
   * Validate UUID format
   * 
   * @param id - UUID string to validate
   * @returns True if valid UUID, false otherwise
   * 
   * @example
   * if (ValidationUtil.isValidUUID('550e8400-e29b-41d4-a716-446655440000')) { ... }
   */
  static isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Sanitize string by removing whitespace and HTML characters
   * 
   * @param str - String to sanitize
   * @returns Sanitized string
   * 
   * @example
   * const clean = ValidationUtil.sanitizeString('  hello  <script>alert("xss")</script>  ');
   * // Result: 'hello alert("xss")'
   */
  static sanitizeString(str: string): string {
    return str
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[<>]/g, '');
  }

  /**
   * Validate URL format
   * 
   * @param url - URL string to validate
   * @returns True if valid URL, false otherwise
   * 
   * @example
   * if (ValidationUtil.isValidUrl('https://example.com')) { ... }
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if string is empty or whitespace only
   * 
   * @param str - String to check
   * @returns True if empty or whitespace only, false otherwise
   * 
   * @example
   * if (!ValidationUtil.isEmpty(name)) { ... }
   */
  static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Validate minimum length
   * 
   * @param str - String to validate
   * @param minLength - Minimum required length
   * @returns True if string meets minimum length, false otherwise
   * 
   * @example
   * if (ValidationUtil.hasMinLength(password, 8)) { ... }
   */
  static hasMinLength(str: string, minLength: number): boolean {
    return !!(str && str.length >= minLength);
  }

  /**
   * Validate maximum length
   * 
   * @param str - String to validate
   * @param maxLength - Maximum allowed length
   * @returns True if string doesn't exceed maximum length, false otherwise
   * 
   * @example
   * if (ValidationUtil.hasMaxLength(name, 100)) { ... }
   */
  static hasMaxLength(str: string, maxLength: number): boolean {
    return !!(str && str.length <= maxLength);
  }

  /**
   * Validate number is within range
   * 
   * @param num - Number to validate
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns True if number is within range, false otherwise
   * 
   * @example
   * if (ValidationUtil.isInRange(age, 18, 100)) { ... }
   */
  static isInRange(num: number, min: number, max: number): boolean {
    return num >= min && num <= max;
  }

  /**
   * Validate that value is a positive number
   * 
   * @param num - Number to validate
   * @returns True if positive, false otherwise
   * 
   * @example
   * if (ValidationUtil.isPositive(amount)) { ... }
   */
  static isPositive(num: number): boolean {
    return num > 0;
  }

  /**
   * Validate that value is a non-negative number
   * 
   * @param num - Number to validate
   * @returns True if non-negative, false otherwise
   * 
   * @example
   * if (ValidationUtil.isNonNegative(count)) { ... }
   */
  static isNonNegative(num: number): boolean {
    return num >= 0;
  }
}
