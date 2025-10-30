import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BankReconciliationService } from '../services/bank-reconciliation.service';
import { SaveBankReconciliationInput } from '../dto/save-bank-reconciliation.input';
import { BankReconciliationEntity } from '../entities/bank-reconciliation.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * BankReconciliationResolver
 * GraphQL resolver for bank reconciliation operations
 */
@Resolver('BankReconciliation')
export class BankReconciliationResolver {
  constructor(
    private readonly bankReconciliationService: BankReconciliationService,
  ) {}

  /**
   * Get reconciliations for a bank account
   */
  @Query(() => [BankReconciliationEntity])
  async bankReconciliations(
    @Args('bankAccountId') bankAccountId: string,
  ): Promise<BankReconciliationEntity[]> {
    return this.bankReconciliationService.findByBankAccount(bankAccountId);
  }

  /**
   * Get reconciliation by ID
   */
  @Query(() => BankReconciliationEntity)
  async bankReconciliation(
    @Args('id') id: string,
  ): Promise<BankReconciliationEntity> {
    return this.bankReconciliationService.findOne(id);
  }

  /**
   * Save bank reconciliation
   */
  @Mutation(() => BankReconciliationEntity)
  async saveBankReconciliation(
    @Args('input') input: SaveBankReconciliationInput,
    @CurrentUser() user: any,
  ): Promise<BankReconciliationEntity> {
    return this.bankReconciliationService.save(input, user.id);
  }

  /**
   * Submit reconciliation for review
   */
  @Mutation(() => BankReconciliationEntity)
  async submitBankReconciliationForReview(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<BankReconciliationEntity> {
    return this.bankReconciliationService.submitForReview(id, user.id);
  }

  /**
   * Approve reconciliation
   */
  @Mutation(() => BankReconciliationEntity)
  async approveBankReconciliation(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<BankReconciliationEntity> {
    return this.bankReconciliationService.approve(id, user.id);
  }

  /**
   * Reject reconciliation
   */
  @Mutation(() => BankReconciliationEntity)
  async rejectBankReconciliation(
    @Args('id') id: string,
    @Args('reason') reason: string,
    @CurrentUser() user: any,
  ): Promise<BankReconciliationEntity> {
    return this.bankReconciliationService.reject(id, user.id, reason);
  }

  /**
   * Void reconciliation
   */
  @Mutation(() => BankReconciliationEntity)
  async voidBankReconciliation(
    @Args('id') id: string,
    @Args('reason') reason: string,
    @CurrentUser() user: any,
  ): Promise<BankReconciliationEntity> {
    return this.bankReconciliationService.void(id, reason);
  }
}
