import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationInput, PaginatedResult } from '../dto';
import { LoggerService } from 'src/common/services/logger.service';

/**
 * Generic CRUD Service
 * 
 * Provides reusable CRUD operations for all services.
 * Eliminates duplication of findAll, findOne, create, update, delete methods.
 * 
 * Usage:
 * @Injectable()
 * export class MembersService extends CrudService<Member, CreateMemberDto, UpdateMemberDto> {
 *   constructor(protected prisma: PrismaService, protected logger: LoggerService) {
 *     super(prisma, logger);
 *   }
 *   
 *   protected getRepository() {
 *     return this.prisma.member;
 *   }
 *   
 *   // Add custom domain-specific methods here
 * }
 */
@Injectable()
export abstract class CrudService<T, CreateDTO, UpdateDTO> {
  protected modelName: string;

  constructor(
    protected prisma: PrismaService,
    protected logger: LoggerService,
  ) {
    this.modelName = this.constructor.name.replace('Service', '');
  }

  /**
   * Find all records with pagination and filtering
   * 
   * @param where - Prisma where clause for filtering
   * @param pagination - Pagination input (page, limit, sortBy, sortOrder)
   * @param orderBy - Prisma orderBy clause
   * @returns PaginatedResult with data, total, page info, and navigation flags
   * 
   * @example
   * const result = await this.findAll(
   *   { status: 'ACTIVE' },
   *   { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }
   * );
   */
  async findAll(
    where?: Record<string, any>,
    pagination?: PaginationInput,
    orderBy?: Record<string, any>,
  ): Promise<PaginatedResult<T>> {
    try {
      const { page = 1, limit = 10 } = pagination || {};

      // Validate pagination parameters
      if (page < 1 || limit < 1) {
        throw new BadRequestException(
          'Page and limit must be greater than 0',
        );
      }

      const skip = (page - 1) * limit;

      // Fetch data and count in parallel
      const [data, total] = await Promise.all([
        this.getRepository().findMany({
          where,
          skip,
          take: limit,
          orderBy: orderBy || { createdAt: 'desc' },
        }),
        this.getRepository().count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.debug(
        `Retrieved ${data.length} ${this.modelName} records`,
        {
          page,
          limit,
          total,
          totalPages,
        },
        this.modelName,
      );

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      this.logger.error(
        `Error finding all ${this.modelName}`,
        error,
        this.modelName,
      );
      throw error;
    }
  }

  /**
   * Find a single record by ID
   * 
   * @param id - The ID of the record to find
   * @returns The found record
   * @throws NotFoundException if record not found
   * @throws BadRequestException if ID is invalid
   * 
   * @example
   * const member = await this.findOne('123e4567-e89b-12d3-a456-426614174000');
   */
  async findOne(id: string): Promise<T> {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      const record = await this.getRepository().findUnique({
        where: { id },
      });

      if (!record) {
        throw new NotFoundException(
          `${this.modelName} with ID ${id} not found`,
        );
      }

      this.logger.debug(`Found ${this.modelName} with ID ${id}`, null, this.modelName);

      return record;
    } catch (error) {
      this.logger.error(
        `Error finding ${this.modelName} by ID`,
        error,
        this.modelName,
      );
      throw error;
    }
  }

  /**
   * Create a new record
   * 
   * @param data - The data to create the record with
   * @returns The created record
   * @throws BadRequestException if data is invalid
   * 
   * @example
   * const member = await this.create({ name: 'John Doe', email: 'john@example.com' });
   */
  async create(data: CreateDTO): Promise<T> {
    try {
      if (!data) {
        throw new BadRequestException('Data is required');
      }

      const record = await this.getRepository().create({
        data,
      });

      this.logger.log(
        `Created new ${this.modelName} with ID ${record.id}`,
        this.modelName,
      );

      return record;
    } catch (error) {
      this.logger.error(
        `Error creating ${this.modelName}`,
        error,
        this.modelName,
      );
      throw error;
    }
  }

  /**
   * Update an existing record
   * 
   * @param id - The ID of the record to update
   * @param data - The data to update the record with
   * @returns The updated record
   * @throws NotFoundException if record not found
   * @throws BadRequestException if ID is invalid
   * 
   * @example
   * const member = await this.update('123e4567-e89b-12d3-a456-426614174000', { name: 'Jane Doe' });
   */
  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      // Verify record exists before updating
      await this.findOne(id);

      const record = await this.getRepository().update({
        where: { id },
        data,
      });

      this.logger.log(
        `Updated ${this.modelName} with ID ${id}`,
        this.modelName,
      );

      return record;
    } catch (error) {
      this.logger.error(
        `Error updating ${this.modelName}`,
        error,
        this.modelName,
      );
      throw error;
    }
  }

  /**
   * Delete a record
   * 
   * @param id - The ID of the record to delete
   * @returns The deleted record
   * @throws NotFoundException if record not found
   * @throws BadRequestException if ID is invalid
   * 
   * @example
   * const member = await this.delete('123e4567-e89b-12d3-a456-426614174000');
   */
  async delete(id: string): Promise<T> {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      // Verify record exists before deleting
      await this.findOne(id);

      const record = await this.getRepository().delete({
        where: { id },
      });

      this.logger.log(
        `Deleted ${this.modelName} with ID ${id}`,
        this.modelName,
      );

      return record;
    } catch (error) {
      this.logger.error(
        `Error deleting ${this.modelName}`,
        error,
        this.modelName,
      );
      throw error;
    }
  }

  /**
   * Count records matching the given criteria
   * 
   * @param where - Prisma where clause for filtering
   * @returns The count of matching records
   * 
   * @example
   * const count = await this.count({ status: 'ACTIVE' });
   */
  async count(where?: Record<string, any>): Promise<number> {
    try {
      const count = await this.getRepository().count({ where });

      this.logger.debug(
        `Counted ${count} ${this.modelName} records`,
        { where },
        this.modelName,
      );

      return count;
    } catch (error) {
      this.logger.error(
        `Error counting ${this.modelName}`,
        error,
        this.modelName,
      );
      throw error;
    }
  }

  /**
   * Check if a record exists matching the given criteria
   * 
   * @param where - Prisma where clause for filtering
   * @returns True if record exists, false otherwise
   * 
   * @example
   * const exists = await this.exists({ email: 'john@example.com' });
   */
  async exists(where: Record<string, any>): Promise<boolean> {
    try {
      const record = await this.getRepository().findFirst({ where });

      const exists = !!record;

      this.logger.debug(
        `${this.modelName} exists: ${exists}`,
        { where },
        this.modelName,
      );

      return exists;
    } catch (error) {
      this.logger.error(
        `Error checking ${this.modelName} existence`,
        error,
        this.modelName,
      );
      throw error;
    }
  }

  /**
   * Abstract method to get the Prisma repository
   * Must be implemented by child classes
   * 
   * @example
   * protected getRepository() {
   *   return this.prisma.member;
   * }
   */
  protected abstract getRepository(): any;
}
