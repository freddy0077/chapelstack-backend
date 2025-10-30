import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BankStatementService } from '../services/bank-statement.service';
import { UploadBankStatementInput } from '../dto/upload-bank-statement.input';
import { BankStatementEntity } from '../entities/bank-statement.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * BankStatementResolver
 * GraphQL resolver for bank statement operations
 */
@Resolver(() => BankStatementEntity)
export class BankStatementResolver {
  constructor(private readonly bankStatementService: BankStatementService) {}

  /**
   * Get all bank statements for a bank account
   */
  @Query(() => [BankStatementEntity])
  async bankStatements(
    @Args('bankAccountId') bankAccountId: string,
  ): Promise<BankStatementEntity[]> {
    return this.bankStatementService.findByBankAccount(bankAccountId);
  }

  /**
   * Get bank statement by ID
   */
  @Query(() => BankStatementEntity)
  async bankStatement(@Args('id') id: string): Promise<BankStatementEntity> {
    return this.bankStatementService.findOne(id);
  }

  /**
   * Upload bank statement
   * Note: File upload requires additional setup with graphql-upload
   * This is a simplified version - for now, file URL is passed as string
   * TODO: Implement proper file upload with cloud storage
   */
  // @Mutation(() => BankStatementEntity)
  // async uploadBankStatement(
  //   @Args('input') input: UploadBankStatementInput,
  //   @Args('fileUrl') fileUrl: string,
  //   @Args('fileName') fileName: string,
  //   @Args('fileSize') fileSize: number,
  //   @Args('fileType') fileType: string,
  //   @CurrentUser() user: any,
  // ): Promise<BankStatementEntity> {
  //   const file = {
  //     originalname: fileName,
  //     size: fileSize,
  //     mimetype: fileType,
  //   };
  //   const inputWithUrl = { ...input, fileUrl };
  //   return this.bankStatementService.uploadStatement(inputWithUrl, file, user.id);
  // }

  /**
   * Delete bank statement
   */
  @Mutation(() => Boolean)
  async deleteBankStatement(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.bankStatementService.delete(id);
  }
}
