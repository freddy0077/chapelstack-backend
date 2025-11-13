/**
 * Array Utility
 * 
 * Centralized array manipulation functions
 * Eliminates duplication of array operations across services
 */
export class ArrayUtil {
  /**
   * Remove duplicate items from array
   * 
   * @param arr - Array to process
   * @param key - Optional property key for object arrays
   * @returns Array with duplicates removed
   * 
   * @example
   * ArrayUtil.removeDuplicates([1, 2, 2, 3, 3, 3]);
   * // Returns: [1, 2, 3]
   * 
   * ArrayUtil.removeDuplicates([{id: 1}, {id: 2}, {id: 1}], 'id');
   * // Returns: [{id: 1}, {id: 2}]
   */
  static removeDuplicates<T>(arr: T[], key?: keyof T): T[] {
    if (!key) {
      return [...new Set(arr)];
    }

    const seen = new Set();
    return arr.filter((item) => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  /**
   * Group array items by key
   * 
   * @param arr - Array to group
   * @param key - Property key to group by
   * @returns Object with grouped items
   * 
   * @example
   * const users = [{name: 'John', role: 'admin'}, {name: 'Jane', role: 'user'}];
   * ArrayUtil.groupBy(users, 'role');
   * // Returns: { admin: [{...}], user: [{...}] }
   */
  static groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce(
      (result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      },
      {} as Record<string, T[]>,
    );
  }

  /**
   * Split array into chunks of specified size
   * 
   * @param arr - Array to chunk
   * @param size - Size of each chunk
   * @returns Array of chunks
   * 
   * @example
   * ArrayUtil.chunk([1, 2, 3, 4, 5], 2);
   * // Returns: [[1, 2], [3, 4], [5]]
   */
  static chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }

    return chunks;
  }

  /**
   * Flatten nested array
   * 
   * @param arr - Array to flatten
   * @param depth - Depth to flatten (default: 1)
   * @returns Flattened array
   * 
   * @example
   * ArrayUtil.flatten([[1, 2], [3, [4, 5]]]);
   * // Returns: [1, 2, 3, [4, 5]]
   * 
   * ArrayUtil.flatten([[1, 2], [3, [4, 5]]], 2);
   * // Returns: [1, 2, 3, 4, 5]
   */
  static flatten<T>(arr: any[], depth: number = 1): T[] {
    if (depth === 0) return arr;

    return arr.reduce((result, item) => {
      if (Array.isArray(item)) {
        result.push(...this.flatten(item, depth - 1));
      } else {
        result.push(item);
      }
      return result;
    }, []);
  }

  /**
   * Get unique values from array
   * 
   * @param arr - Array to process
   * @returns Array with unique values
   * 
   * @example
   * ArrayUtil.unique([1, 2, 2, 3, 3, 3]);
   * // Returns: [1, 2, 3]
   */
  static unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  /**
   * Find common elements between arrays
   * 
   * @param arr1 - First array
   * @param arr2 - Second array
   * @returns Array of common elements
   * 
   * @example
   * ArrayUtil.intersection([1, 2, 3], [2, 3, 4]);
   * // Returns: [2, 3]
   */
  static intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((item) => arr2.includes(item));
  }

  /**
   * Find elements in first array but not in second
   * 
   * @param arr1 - First array
   * @param arr2 - Second array
   * @returns Array of elements in arr1 but not in arr2
   * 
   * @example
   * ArrayUtil.difference([1, 2, 3], [2, 3, 4]);
   * // Returns: [1]
   */
  static difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((item) => !arr2.includes(item));
  }

  /**
   * Shuffle array randomly
   * 
   * @param arr - Array to shuffle
   * @returns Shuffled array
   * 
   * @example
   * ArrayUtil.shuffle([1, 2, 3, 4, 5]);
   * // Returns: [3, 1, 4, 5, 2] (random order)
   */
  static shuffle<T>(arr: T[]): T[] {
    const result = [...arr];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  /**
   * Get random element from array
   * 
   * @param arr - Array to select from
   * @returns Random element
   * 
   * @example
   * ArrayUtil.random([1, 2, 3, 4, 5]);
   * // Returns: 3 (random)
   */
  static random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Get first N elements from array
   * 
   * @param arr - Array to process
   * @param n - Number of elements to get
   * @returns First N elements
   * 
   * @example
   * ArrayUtil.first([1, 2, 3, 4, 5], 3);
   * // Returns: [1, 2, 3]
   */
  static first<T>(arr: T[], n: number = 1): T[] {
    return arr.slice(0, n);
  }

  /**
   * Get last N elements from array
   * 
   * @param arr - Array to process
   * @param n - Number of elements to get
   * @returns Last N elements
   * 
   * @example
   * ArrayUtil.last([1, 2, 3, 4, 5], 3);
   * // Returns: [3, 4, 5]
   */
  static last<T>(arr: T[], n: number = 1): T[] {
    return arr.slice(-n);
  }

  /**
   * Sum numeric array
   * 
   * @param arr - Array of numbers
   * @returns Sum of all elements
   * 
   * @example
   * ArrayUtil.sum([1, 2, 3, 4, 5]);
   * // Returns: 15
   */
  static sum(arr: number[]): number {
    return arr.reduce((sum, num) => sum + num, 0);
  }

  /**
   * Get average of numeric array
   * 
   * @param arr - Array of numbers
   * @returns Average value
   * 
   * @example
   * ArrayUtil.average([1, 2, 3, 4, 5]);
   * // Returns: 3
   */
  static average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return this.sum(arr) / arr.length;
  }

  /**
   * Find min value in numeric array
   * 
   * @param arr - Array of numbers
   * @returns Minimum value
   * 
   * @example
   * ArrayUtil.min([5, 2, 8, 1, 9]);
   * // Returns: 1
   */
  static min(arr: number[]): number {
    return Math.min(...arr);
  }

  /**
   * Find max value in numeric array
   * 
   * @param arr - Array of numbers
   * @returns Maximum value
   * 
   * @example
   * ArrayUtil.max([5, 2, 8, 1, 9]);
   * // Returns: 9
   */
  static max(arr: number[]): number {
    return Math.max(...arr);
  }

  /**
   * Check if array contains all elements from another array
   * 
   * @param arr - Array to check
   * @param elements - Elements to look for
   * @returns True if all elements are present
   * 
   * @example
   * ArrayUtil.containsAll([1, 2, 3, 4], [2, 3]);
   * // Returns: true
   */
  static containsAll<T>(arr: T[], elements: T[]): boolean {
    return elements.every((element) => arr.includes(element));
  }

  /**
   * Check if array contains any element from another array
   * 
   * @param arr - Array to check
   * @param elements - Elements to look for
   * @returns True if any element is present
   * 
   * @example
   * ArrayUtil.containsAny([1, 2, 3], [3, 4, 5]);
   * // Returns: true
   */
  static containsAny<T>(arr: T[], elements: T[]): boolean {
    return elements.some((element) => arr.includes(element));
  }
}
