/**
 * String Utility
 * 
 * Centralized string manipulation functions
 * Eliminates duplication of string operations across services
 */
export class StringUtil {
  /**
   * Generate URL-friendly slug from text
   * 
   * @param text - Text to convert to slug
   * @returns URL-friendly slug
   * 
   * @example
   * StringUtil.generateSlug('Hello World!');
   * // Returns: 'hello-world'
   */
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Capitalize first letter of string
   * 
   * @param str - String to capitalize
   * @returns Capitalized string
   * 
   * @example
   * StringUtil.capitalize('hello');
   * // Returns: 'Hello'
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitalize each word in string
   * 
   * @param str - String to capitalize
   * @returns String with each word capitalized
   * 
   * @example
   * StringUtil.capitalizeWords('hello world');
   * // Returns: 'Hello World'
   */
  static capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map((word) => this.capitalize(word))
      .join(' ');
  }

  /**
   * Truncate string to specified length with ellipsis
   * 
   * @param str - String to truncate
   * @param length - Maximum length
   * @param suffix - Suffix to add (default: '...')
   * @returns Truncated string
   * 
   * @example
   * StringUtil.truncate('Hello World', 8);
   * // Returns: 'Hello...'
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Generate random string of specified length
   * 
   * @param length - Length of random string
   * @param charset - Character set to use (default: alphanumeric)
   * @returns Random string
   * 
   * @example
   * StringUtil.generateRandomString(10);
   * // Returns: 'aB3cD9eF2g'
   */
  static generateRandomString(
    length: number,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return result;
  }

  /**
   * Convert camelCase to kebab-case
   * 
   * @param str - String in camelCase
   * @returns String in kebab-case
   * 
   * @example
   * StringUtil.camelToKebab('helloWorld');
   * // Returns: 'hello-world'
   */
  static camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Convert kebab-case to camelCase
   * 
   * @param str - String in kebab-case
   * @returns String in camelCase
   * 
   * @example
   * StringUtil.kebabToCamel('hello-world');
   * // Returns: 'helloWorld'
   */
  static kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Convert snake_case to camelCase
   * 
   * @param str - String in snake_case
   * @returns String in camelCase
   * 
   * @example
   * StringUtil.snakeToCamel('hello_world');
   * // Returns: 'helloWorld'
   */
  static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Convert camelCase to snake_case
   * 
   * @param str - String in camelCase
   * @returns String in snake_case
   * 
   * @example
   * StringUtil.camelToSnake('helloWorld');
   * // Returns: 'hello_world'
   */
  static camelToSnake(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1_$2').toLowerCase();
  }

  /**
   * Reverse string
   * 
   * @param str - String to reverse
   * @returns Reversed string
   * 
   * @example
   * StringUtil.reverse('hello');
   * // Returns: 'olleh'
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  /**
   * Check if string is palindrome
   * 
   * @param str - String to check
   * @returns True if palindrome, false otherwise
   * 
   * @example
   * StringUtil.isPalindrome('racecar');
   * // Returns: true
   */
  static isPalindrome(str: string): boolean {
    const cleaned = str.toLowerCase().replace(/\s/g, '');
    return cleaned === this.reverse(cleaned);
  }

  /**
   * Count occurrences of substring in string
   * 
   * @param str - String to search in
   * @param substring - Substring to count
   * @returns Number of occurrences
   * 
   * @example
   * StringUtil.countOccurrences('hello hello world', 'hello');
   * // Returns: 2
   */
  static countOccurrences(str: string, substring: string): number {
    return str.split(substring).length - 1;
  }

  /**
   * Replace all occurrences of substring
   * 
   * @param str - String to search in
   * @param search - Substring to find
   * @param replace - Replacement string
   * @returns String with replacements
   * 
   * @example
   * StringUtil.replaceAll('hello hello', 'hello', 'hi');
   * // Returns: 'hi hi'
   */
  static replaceAll(str: string, search: string, replace: string): string {
    return str.split(search).join(replace);
  }

  /**
   * Remove all whitespace from string
   * 
   * @param str - String to process
   * @returns String without whitespace
   * 
   * @example
   * StringUtil.removeWhitespace('hello world');
   * // Returns: 'helloworld'
   */
  static removeWhitespace(str: string): string {
    return str.replace(/\s/g, '');
  }

  /**
   * Repeat string specified number of times
   * 
   * @param str - String to repeat
   * @param count - Number of times to repeat
   * @returns Repeated string
   * 
   * @example
   * StringUtil.repeat('ab', 3);
   * // Returns: 'ababab'
   */
  static repeat(str: string, count: number): string {
    return str.repeat(count);
  }

  /**
   * Pad string to specified length
   * 
   * @param str - String to pad
   * @param length - Target length
   * @param padChar - Character to pad with (default: space)
   * @param padStart - Pad at start if true, end if false (default: false)
   * @returns Padded string
   * 
   * @example
   * StringUtil.pad('5', 3, '0', true);
   * // Returns: '005'
   */
  static pad(
    str: string,
    length: number,
    padChar: string = ' ',
    padStart: boolean = false,
  ): string {
    if (padStart) {
      return str.padStart(length, padChar);
    }
    return str.padEnd(length, padChar);
  }

  /**
   * Extract numbers from string
   * 
   * @param str - String to process
   * @returns String containing only numbers
   * 
   * @example
   * StringUtil.extractNumbers('abc123def456');
   * // Returns: '123456'
   */
  static extractNumbers(str: string): string {
    return str.replace(/\D/g, '');
  }

  /**
   * Extract letters from string
   * 
   * @param str - String to process
   * @returns String containing only letters
   * 
   * @example
   * StringUtil.extractLetters('abc123def456');
   * // Returns: 'abcdef'
   */
  static extractLetters(str: string): string {
    return str.replace(/[^a-zA-Z]/g, '');
  }
}
