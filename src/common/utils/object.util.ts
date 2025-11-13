/**
 * Object Utility
 * 
 * Centralized object manipulation functions
 * Eliminates duplication of object operations across services
 */
export class ObjectUtil {
  /**
   * Deep merge two objects
   * 
   * @param target - Target object
   * @param source - Source object to merge
   * @returns Merged object
   * 
   * @example
   * ObjectUtil.deepMerge({a: 1, b: {c: 2}}, {b: {d: 3}});
   * // Returns: {a: 1, b: {c: 2, d: 3}}
   */
  static deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

    /**
   * Pick specific properties from object
   * 
   * @param obj - Object to pick from
   * @param keys - Keys to pick
   * @returns New object with only picked properties
   * 
   * @example
   * ObjectUtil.pick({a: 1, b: 2, c: 3}, ['a', 'c']);
   * // Returns: {a: 1, c: 3}
   */
  static pick(obj: any, keys: string[]): any {
    const result: any = {};

    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });

    return result;
  }

  /**
   * Omit specific properties from object
   * 
   * @param obj - Object to omit from
   * @param keys - Keys to omit
   * @returns New object without omitted properties
   * 
   * @example
   * ObjectUtil.omit({a: 1, b: 2, c: 3}, ['b']);
   * // Returns: {a: 1, c: 3}
   */
  static omit(obj: any, keys: string[]): any {
    const result: any = { ...obj };

    keys.forEach((key) => {
      delete result[key];
    });

    return result;
  }

  /**
   * Transform object values using a function
   * 
   * @param obj - Object to transform
   * @param transformer - Function to transform values
   * @returns New object with transformed values
   * 
   * @example
   * ObjectUtil.transform({a: 1, b: 2}, v => v * 2);
   * // Returns: {a: 2, b: 4}
   */
  static transform(obj: any, transformer: (value: any) => any): any {
    const result: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = transformer(obj[key]);
      }
    }

    return result;
  }

  /**
   * Get value from nested object using dot notation
   * 
   * @param obj - Object to get value from
   * @param path - Dot notation path (e.g., 'user.profile.name')
   * @param defaultValue - Default value if path not found
   * @returns Value at path or default value
   * 
   * @example
   * ObjectUtil.get({user: {profile: {name: 'John'}}}, 'user.profile.name');
   * // Returns: 'John'
   */
  static get(obj: any, path: string, defaultValue: any = undefined): any {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }

    return result;
  }

  /**
   * Set value in nested object using dot notation
   * 
   * @param obj - Object to set value in
   * @param path - Dot notation path (e.g., 'user.profile.name')
   * @param value - Value to set
   * @returns Modified object
   * 
   * @example
   * ObjectUtil.set({}, 'user.profile.name', 'John');
   * // Returns: {user: {profile: {name: 'John'}}}
   */
  static set(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
  }

  /**
   * Check if object is empty
   * 
   * @param obj - Object to check
   * @returns True if object has no properties
   * 
   * @example
   * ObjectUtil.isEmpty({});
   * // Returns: true
   */
  static isEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  /**
   * Get object keys
   * 
   * @param obj - Object to get keys from
   * @returns Array of keys
   * 
   * @example
   * ObjectUtil.keys({a: 1, b: 2});
   * // Returns: ['a', 'b']
   */
  static keys(obj: any): string[] {
    return Object.keys(obj);
  }

  /**
   * Get object values
   * 
   * @param obj - Object to get values from
   * @returns Array of values
   * 
   * @example
   * ObjectUtil.values({a: 1, b: 2});
   * // Returns: [1, 2]
   */
  static values(obj: any): any[] {
    return Object.values(obj);
  }

  /**
   * Get object entries
   * 
   * @param obj - Object to get entries from
   * @returns Array of [key, value] pairs
   * 
   * @example
   * ObjectUtil.entries({a: 1, b: 2});
   * // Returns: [['a', 1], ['b', 2]]
   */
  static entries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  /**
   * Invert object keys and values
   * 
   * @param obj - Object to invert
   * @returns Inverted object
   * 
   * @example
   * ObjectUtil.invert({a: 'x', b: 'y'});
   * // Returns: {x: 'a', y: 'b'}
   */
  static invert(obj: any): any {
    const result: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[obj[key]] = key;
      }
    }

    return result;
  }

  /**
   * Clone object deeply
   * 
   * @param obj - Object to clone
   * @returns Deep clone of object
   * 
   * @example
   * const clone = ObjectUtil.clone({a: 1, b: {c: 2}});
   */
  static clone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => this.clone(item));
    if (obj instanceof Object) {
      const cloned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.clone(obj[key]);
        }
      }
      return cloned;
    }
  }

  /**
   * Check if object has property
   * 
   * @param obj - Object to check
   * @param key - Property key
   * @returns True if property exists
   * 
   * @example
   * ObjectUtil.hasProperty({a: 1}, 'a');
   * // Returns: true
   */
  static hasProperty(obj: any, key: string): boolean {
    return obj.hasOwnProperty(key);
  }

  /**
   * Filter object by predicate
   * 
   * @param obj - Object to filter
   * @param predicate - Function to test properties
   * @returns Filtered object
   * 
   * @example
   * ObjectUtil.filter({a: 1, b: 2, c: 3}, (v) => v > 1);
   * // Returns: {b: 2, c: 3}
   */
  static filter(
    obj: any,
    predicate: (value: any, key: string) => boolean,
  ): any {
    const result: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
        result[key] = obj[key];
      }
    }

    return result;
  }

  /**
   * Flatten nested object to dot notation
   * 
   * @param obj - Object to flatten
   * @param prefix - Prefix for keys
   * @returns Flattened object
   * 
   * @example
   * ObjectUtil.flatten({a: 1, b: {c: 2, d: {e: 3}}});
   * // Returns: {'a': 1, 'b.c': 2, 'b.d.e': 3}
   */
  static flatten(obj: any, prefix: string = ''): any {
    const result: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(result, this.flatten(value, newKey));
        } else {
          result[newKey] = value;
        }
      }
    }

    return result;
  }
}
