import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { TransfersService } from './transfers.service';
import { TransferRequest } from './entities/transfer-request.entity';
import { CreateTransferRequestInput } from './dto/create-transfer-request.input';
import { UpdateTransferRequestInput } from './dto/update-transfer-request.input';
import { TransferRequestFilterInput } from './dto/transfer-request-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { PaginatedTransferRequests } from './dto/paginated-transfer-requests.output';

@Resolver(() => TransferRequest)
export class TransfersResolver {
  constructor(private readonly transfersService: TransfersService) {}

  @Mutation(() => TransferRequest)
  async createTransferRequest(
    @Args('input') createTransferRequestInput: CreateTransferRequestInput,
  ): Promise<TransferRequest> {
    return this.transfersService.create(createTransferRequestInput);
  }

  @Query(() => PaginatedTransferRequests, { name: 'transferRequests' })
  async findAll(
    @Args('filterInput', { nullable: true })
    filterInput?: TransferRequestFilterInput,
    @Args('paginationInput', { nullable: true })
    paginationInput?: PaginationInput,
  ): Promise<PaginatedTransferRequests> {
    return this.transfersService.findAll(filterInput, paginationInput);
  }

  @Query(() => TransferRequest, { name: 'transferRequest' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TransferRequest> {
    return this.transfersService.findOne(id);
  }

  @Mutation(() => TransferRequest)
  async updateTransferRequest(
    @Args('input') updateTransferRequestInput: UpdateTransferRequestInput,
  ): Promise<TransferRequest> {
    return this.transfersService.update(updateTransferRequestInput);
  }

  @Mutation(() => Boolean)
  async removeTransferRequest(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.transfersService.remove(id);
  }
}
