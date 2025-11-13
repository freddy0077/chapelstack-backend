import { PaginationInput, PaginatedResult } from 'src/base/dto';

/**
 * Pagination Utility
 * 
 * Centralized pagination helper functions
 * Eliminates duplication of pagination logic across services
 */
export class PaginationUtil {
  /**
   * Calculate skip value for database queries
   * 
   * @param page - Current page (1-indexed)
   * @param limit - Items per page
   * @returns Skip value for database query
   * 
   * @example
   * PaginationUtil.calculateSkip(2, 10);
   * // Returns: 10
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Calculate total pages
   * 
   * @param total - Total number of items
   * @param limit - Items per page
   * @returns Total number of pages
   * 
   * @example
   * PaginationUtil.calculateTotalPages(100, 10);
   * // Returns: 10
   */
  static calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  /**
   * Check if there is a next page
   * 
   * @param page - Current page
   * @param totalPages - Total number of pages
   * @returns True if next page exists
   * 
   * @example
   * PaginationUtil.hasNextPage(1, 5);
   * // Returns: true
   */
  static hasNextPage(page: number, totalPages: number): boolean {
    return page < totalPages;
  }

  /**
   * Check if there is a previous page
   * 
   * @param page - Current page
   * @returns True if previous page exists
   * 
   * @example
   * PaginationUtil.hasPreviousPage(2);
   * // Returns: true
   */
  static hasPreviousPage(page: number): boolean {
    return page > 1;
  }

  /**
   * Validate pagination input
   * 
   * @param pagination - Pagination input
   * @returns Validated pagination input with defaults
   * 
   * @example
   * PaginationUtil.validate({page: 0, limit: -5});
   * // Returns: {page: 1, limit: 10}
   */
  static validate(pagination: Partial<PaginationInput>): PaginationInput {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, Math.min(100, pagination.limit || 10));
    const sortBy = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder || 'asc';

    return { page, limit, sortBy, sortOrder };
  }

  /**
   * Create paginated response
   * 
   * @param data - Array of items
   * @param total - Total number of items
   * @param page - Current page
   * @param limit - Items per page
   * @returns Paginated result object
   * 
   * @example
   * PaginationUtil.createResponse([item1, item2], 100, 1, 10);
   */
  static createResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    const totalPages = this.calculateTotalPages(total, limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: this.hasNextPage(page, totalPages),
      hasPreviousPage: this.hasPreviousPage(page),
    };
  }

  /**
   * Get pagination metadata
   * 
   * @param total - Total number of items
   * @param page - Current page
   * @param limit - Items per page
   * @returns Pagination metadata
   * 
   * @example
   * PaginationUtil.getMetadata(100, 2, 10);
   * // Returns: {page: 2, limit: 10, total: 100, totalPages: 10, skip: 10, ...}
   */
  static getMetadata(total: number, page: number, limit: number) {
    const totalPages = this.calculateTotalPages(total, limit);
    const skip = this.calculateSkip(page, limit);

    return {
      page,
      limit,
      total,
      totalPages,
      skip,
      hasNextPage: this.hasNextPage(page, totalPages),
      hasPreviousPage: this.hasPreviousPage(page),
      startIndex: skip + 1,
      endIndex: Math.min(skip + limit, total),
    };
  }

  /**
   * Get page range for pagination display
   * 
   * @param page - Current page
   * @param totalPages - Total number of pages
   * @param windowSize - Number of pages to show around current page
   * @returns Array of page numbers to display
   * 
   * @example
   * PaginationUtil.getPageRange(5, 10, 2);
   * // Returns: [3, 4, 5, 6, 7]
   */
  static getPageRange(
    page: number,
    totalPages: number,
    windowSize: number = 5,
  ): number[] {
    const halfWindow = Math.floor(windowSize / 2);
    let start = Math.max(1, page - halfWindow);
    let end = Math.min(totalPages, page + halfWindow);

    // Adjust if near boundaries
    if (start === 1) {
      end = Math.min(totalPages, start + windowSize - 1);
    } else if (end === totalPages) {
      start = Math.max(1, end - windowSize + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Get next page number
   * 
   * @param page - Current page
   * @param totalPages - Total number of pages
   * @returns Next page number or null if on last page
   * 
   * @example
   * PaginationUtil.getNextPage(2, 5);
   * // Returns: 3
   */
  static getNextPage(page: number, totalPages: number): number | null {
    return this.hasNextPage(page, totalPages) ? page + 1 : null;
  }

  /**
   * Get previous page number
   * 
   * @param page - Current page
   * @returns Previous page number or null if on first page
   * 
   * @example
   * PaginationUtil.getPreviousPage(2);
   * // Returns: 1
   */
  static getPreviousPage(page: number): number | null {
    return this.hasPreviousPage(page) ? page - 1 : null;
  }

  /**
   * Check if page is valid
   * 
   * @param page - Page number
   * @param totalPages - Total number of pages
   * @returns True if page is valid
   * 
   * @example
   * PaginationUtil.isValidPage(2, 5);
   * // Returns: true
   */
  static isValidPage(page: number, totalPages: number): boolean {
    return page >= 1 && page <= totalPages;
  }
}
