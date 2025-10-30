import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FiscalPeriodService } from '../services/fiscal-period.service';
import {
  GetFiscalPeriodInput,
  ListFiscalPeriodsInput,
  CloseFiscalPeriodInput,
  CreateFiscalYearInput,
} from '../dto/fiscal-period.input';
import { FiscalPeriodEntity } from '../entities/fiscal-period.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * FiscalPeriodResolver
 * GraphQL resolver for fiscal period operations
 */
@Resolver('FiscalPeriod')
export class FiscalPeriodResolver {
  constructor(private readonly fiscalPeriodService: FiscalPeriodService) {}

  /**
   * Get fiscal period
   */
  @Query(() => FiscalPeriodEntity)
  async fiscalPeriod(
    @Args('input') input: GetFiscalPeriodInput,
  ): Promise<FiscalPeriodEntity> {
    return this.fiscalPeriodService.getFiscalPeriod(
      input.fiscalYear,
      input.periodNumber,
      input.organisationId,
      input.branchId,
    );
  }

  /**
   * List fiscal periods
   */
  @Query(() => [FiscalPeriodEntity])
  async fiscalPeriods(
    @Args('input') input: ListFiscalPeriodsInput,
  ): Promise<FiscalPeriodEntity[]> {
    return this.fiscalPeriodService.listFiscalPeriods(
      input.organisationId,
      input.branchId,
      input.fiscalYear,
    );
  }

  /**
   * Get current fiscal period
   */
  @Query(() => FiscalPeriodEntity)
  async currentFiscalPeriod(
    @Args('organisationId') organisationId: string,
    @Args('branchId') branchId: string,
  ): Promise<FiscalPeriodEntity> {
    return this.fiscalPeriodService.getCurrentFiscalPeriod(
      organisationId,
      branchId,
    );
  }

  /**
   * Close fiscal period
   */
  @Mutation(() => FiscalPeriodEntity)
  async closeFiscalPeriod(
    @Args('input') input: CloseFiscalPeriodInput,
    @CurrentUser() user: any,
  ): Promise<FiscalPeriodEntity> {
    return this.fiscalPeriodService.closeFiscalPeriod(
      input.fiscalYear,
      input.periodNumber,
      input.organisationId,
      input.branchId,
      user.id,
    );
  }

  /**
   * Reopen fiscal period
   */
  @Mutation(() => FiscalPeriodEntity)
  async reopenFiscalPeriod(
    @Args('input') input: CloseFiscalPeriodInput,
  ): Promise<FiscalPeriodEntity> {
    return this.fiscalPeriodService.reopenFiscalPeriod(
      input.fiscalYear,
      input.periodNumber,
      input.organisationId,
      input.branchId,
    );
  }

  /**
   * Lock fiscal period
   */
  @Mutation(() => FiscalPeriodEntity)
  async lockFiscalPeriod(
    @Args('input') input: CloseFiscalPeriodInput,
    @CurrentUser() user: any,
  ): Promise<FiscalPeriodEntity> {
    return this.fiscalPeriodService.lockFiscalPeriod(
      input.fiscalYear,
      input.periodNumber,
      input.organisationId,
      input.branchId,
      user.id,
    );
  }

  /**
   * Create fiscal year
   */
  @Mutation(() => [FiscalPeriodEntity])
  async createFiscalYear(
    @Args('input') input: CreateFiscalYearInput,
  ): Promise<FiscalPeriodEntity[]> {
    return this.fiscalPeriodService.createFiscalYear(
      input.fiscalYear,
      input.organisationId,
      input.branchId,
    );
  }
}
