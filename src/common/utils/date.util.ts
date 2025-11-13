/**
 * Date Utility
 * 
 * Centralized date operations including calculations, formatting, and parsing
 * Eliminates duplication of date logic across services
 */
export class DateUtil {
  /**
   * Calculate age from birth date
   * 
   * @param birthDate - Birth date
   * @returns Age in years
   * 
   * @example
   * const age = DateUtil.calculateAge(new Date('1990-01-15'));
   */
  static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Get date range for a given period
   * 
   * @param period - Period type: 'today', 'week', 'month', 'year'
   * @returns Object with start and end dates
   * 
   * @example
   * const range = DateUtil.getDateRange('month');
   * // Returns: { start: Date(first day of month), end: Date(today) }
   */
  static getDateRange(
    period: 'today' | 'week' | 'month' | 'year',
  ): { start: Date; end: Date } {
    const today = new Date();
    const start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(today.getDate() - today.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return { start, end: today };
  }

  /**
   * Format date to string
   * 
   * @param date - Date to format
   * @param format - Format type: 'date', 'time', 'datetime'
   * @returns Formatted date string
   * 
   * @example
   * DateUtil.formatDate(new Date(), 'date');
   * // Returns: '11/05/2025'
   */
  static formatDate(
    date: Date,
    format: 'date' | 'time' | 'datetime' = 'datetime',
  ): string {
    const options: Intl.DateTimeFormatOptions = {};

    if (format === 'date' || format === 'datetime') {
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
    }

    if (format === 'time' || format === 'datetime') {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
    }

    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Parse date string to Date object
   * 
   * @param dateString - Date string to parse
   * @returns Parsed Date object
   * @throws Error if date string is invalid
   * 
   * @example
   * const date = DateUtil.parseDate('2025-01-15');
   */
  static parseDate(dateString: string): Date {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }

    return date;
  }

  /**
   * Add days to a date
   * 
   * @param date - Base date
   * @param days - Number of days to add (can be negative)
   * @returns New date with days added
   * 
   * @example
   * const futureDate = DateUtil.addDays(new Date(), 7);
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Get difference between two dates in days
   * 
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Absolute difference in days
   * 
   * @example
   * const days = DateUtil.getDaysDifference(new Date('2025-01-01'), new Date('2025-01-08'));
   * // Returns: 7
   */
  static getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Add months to a date
   * 
   * @param date - Base date
   * @param months - Number of months to add (can be negative)
   * @returns New date with months added
   * 
   * @example
   * const futureDate = DateUtil.addMonths(new Date(), 3);
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Add years to a date
   * 
   * @param date - Base date
   * @param years - Number of years to add (can be negative)
   * @returns New date with years added
   * 
   * @example
   * const futureDate = DateUtil.addYears(new Date(), 1);
   */
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Check if date is in the past
   * 
   * @param date - Date to check
   * @returns True if date is in the past, false otherwise
   * 
   * @example
   * if (DateUtil.isPast(eventDate)) { ... }
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if date is in the future
   * 
   * @param date - Date to check
   * @returns True if date is in the future, false otherwise
   * 
   * @example
   * if (DateUtil.isFuture(eventDate)) { ... }
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Check if date is today
   * 
   * @param date - Date to check
   * @returns True if date is today, false otherwise
   * 
   * @example
   * if (DateUtil.isToday(eventDate)) { ... }
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Get start of day (00:00:00)
   * 
   * @param date - Date
   * @returns Date at start of day
   * 
   * @example
   * const startOfDay = DateUtil.getStartOfDay(new Date());
   */
  static getStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day (23:59:59)
   * 
   * @param date - Date
   * @returns Date at end of day
   * 
   * @example
   * const endOfDay = DateUtil.getEndOfDay(new Date());
   */
  static getEndOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }
}
