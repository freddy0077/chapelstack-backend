import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { UseGuards } from '@nestjs/common';
import { OfferingService } from '../services/offering.service';
import {
  CreateOfferingBatchInput,
  VerifyOfferingBatchInput,
  ListOfferingBatchesInput,
  PostOfferingToGLInput,
} from '../dto/offering-batch.input';
import { OfferingBatchEntity, OfferingBatchListResponse } from '../entities/offering-batch.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * OfferingBatchResolver
 * GraphQL resolver for offering batch operations
 */
@Resolver('OfferingBatch')
export class OfferingBatchResolver {
  constructor(private readonly offeringService: OfferingService) {}

  /**
   * Get offering batch by ID
   */
  @Query(() => OfferingBatchEntity)
  async offeringBatch(@Args('id') id: string): Promise<OfferingBatchEntity> {
    return this.offeringService.getOfferingBatchById(id);
  }

  /**
   * List offering batches
   */
  @Query(() => OfferingBatchListResponse)
  async offeringBatches(
    @Args('input') input: ListOfferingBatchesInput,
  ): Promise<OfferingBatchListResponse> {
    const filters = {
      status: input.status,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    };

    const pagination = {
      skip: input.skip,
      take: input.take,
    };

    return this.offeringService.listOfferingBatches(
      input.organisationId,
      input.branchId,
      filters,
      pagination,
    );
  }

  /**
   * Create offering batch
   */
  @Mutation(() => OfferingBatchEntity)
  async createOfferingBatch(
    @Args('input') input: CreateOfferingBatchInput,
    @CurrentUser() user: any,
  ): Promise<OfferingBatchEntity> {
    return this.offeringService.createOfferingBatch(
      {
        batchDate: new Date(input.batchDate),
        serviceName: input.serviceName,
        serviceId: input.serviceId,
        offeringType: input.offeringType,
        cashAmount: input.cashAmount,
        mobileMoneyAmount: input.mobileMoneyAmount,
        chequeAmount: input.chequeAmount,
        foreignCurrencyAmount: input.foreignCurrencyAmount,
        cashDenominations: input.cashDenominations,
        counters: input.counters,
        countedBy: input.countedBy,
        verifierId: input.verifierId,
        status: input.status,
      },
      input.organisationId,
      input.branchId,
      user?.id,
    );
  }

  /**
   * Verify offering batch (2nd counter) with optional deposit
   */
  @Mutation(() => OfferingBatchEntity)
  async verifyOfferingBatch(
    @Args('input') input: VerifyOfferingBatchInput,
    @CurrentUser() user: any,
  ): Promise<OfferingBatchEntity> {
    const depositInfo = input.depositBankAccountId ? {
      bankAccountId: input.depositBankAccountId,
      depositDate: input.depositDate ? new Date(input.depositDate) : undefined,
      depositSlipNumber: input.depositSlipNumber,
    } : undefined;

    return this.offeringService.verifyOfferingBatch(
      input.id,
      user?.id,
      input.discrepancyAmount,
      input.discrepancyNotes,
      depositInfo,
    );
  }

  /**
   * Approve offering batch
   */
  @Mutation(() => OfferingBatchEntity)
  async approveOfferingBatch(
    @Args('id') id: string,
    @Args('version', { type: () => Int, nullable: true }) version: number,
    @CurrentUser() user: any,
  ): Promise<OfferingBatchEntity> {
    return this.offeringService.approveOfferingBatch(id, user?.id);
  }

  /**
   * Post offering batch to GL
   */
  @Mutation(() => OfferingBatchEntity)
  async postOfferingToGL(
    @Args('input') input: PostOfferingToGLInput,
    @Args('version', { type: () => Int, nullable: true }) version: number,
    @CurrentUser() user: any,
  ): Promise<OfferingBatchEntity> {
    return this.offeringService.postOfferingToGL(
      input.id,
      user?.id,
      {
        cashAccountId: input.cashAccountId,
        mobileMoneyAccountId: input.mobileMoneyAccountId,
        chequeAccountId: input.chequeAccountId,
        revenueAccountId: input.revenueAccountId,
        notes: input.notes,
      },
    );
  }
}
