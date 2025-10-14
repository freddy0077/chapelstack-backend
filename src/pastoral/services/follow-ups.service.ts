import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFollowUpInput } from '../dto';

// Note: FollowUp model doesn't exist in Prisma schema
// Only FollowUpReminder exists. This service needs schema updates or removal.
// All methods are stubbed to prevent build errors.
@Injectable()
export class FollowUpsService {
  private readonly logger = new Logger(FollowUpsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new follow-up (STUB - FollowUp model doesn't exist)
   */
  async create(
    data: CreateFollowUpInput,
    userId: string,
    branchId: string,
    organisationId: string,
  ) {
    this.logger.warn('FollowUp model does not exist in schema. This is a stub method.');
    throw new NotFoundException('FollowUp feature not implemented - schema missing');
  }

  /**
   * Find all follow-ups (STUB)
   */
  async findAll(params: any) {
    this.logger.warn('FollowUp model does not exist in schema.');
    return [];
  }

  /**
   * Find one follow-up (STUB)
   */
  async findOne(id: string) {
    throw new NotFoundException('FollowUp feature not implemented - schema missing');
  }

  /**
   * Update a follow-up (STUB)
   */
  async update(id: string, data: any) {
    throw new NotFoundException('FollowUp feature not implemented - schema missing');
  }

  /**
   * Mark follow-up as completed (STUB)
   */
  async complete(id: string, completedNotes?: string) {
    throw new NotFoundException('FollowUp feature not implemented - schema missing');
  }

  /**
   * Mark follow-up as overdue (STUB)
   */
  async markOverdue() {
    this.logger.warn('FollowUp model does not exist in schema.');
    return { count: 0 };
  }

  /**
   * Delete a follow-up (STUB)
   */
  async remove(id: string) {
    throw new NotFoundException('FollowUp feature not implemented - schema missing');
  }

  /**
   * Get upcoming follow-ups (STUB)
   */
  async getUpcoming(
    assignedTo?: string,
    branchId?: string,
    organisationId?: string,
    days: number = 7,
  ) {
    this.logger.warn('FollowUp model does not exist in schema.');
    return [];
  }

  /**
   * Get follow-up statistics (STUB)
   */
  async getStats(branchId?: string, organisationId?: string) {
    return {
      total: 0,
      pending: 0,
      completed: 0,
      overdue: 0,
    };
  }
}
