import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferRequestInput } from './dto/create-transfer-request.input';
import { UpdateTransferRequestInput } from './dto/update-transfer-request.input';
import {
  TransferRequest,
  TransferStatus,
} from './entities/transfer-request.entity';
import { TransferRequestFilterInput } from './dto/transfer-request-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { PaginatedTransferRequests } from './dto/paginated-transfer-requests.output';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createTransferRequestInput: CreateTransferRequestInput,
  ): Promise<TransferRequest> {
    try {
      // Get member and branch information for the transfer request
      const member = await this.prisma.member.findUnique({
        where: { id: createTransferRequestInput.memberId },
        select: { firstName: true, lastName: true },
      });

      if (!member) {
        throw new NotFoundException(
          `Member with ID ${createTransferRequestInput.memberId} not found`,
        );
      }

      const sourceBranch = await this.prisma.branch.findUnique({
        where: { id: createTransferRequestInput.sourceBranchId },
        select: { name: true },
      });

      if (!sourceBranch) {
        throw new NotFoundException(
          `Source branch with ID ${createTransferRequestInput.sourceBranchId} not found`,
        );
      }

      const destinationBranch = await this.prisma.branch.findUnique({
        where: { id: createTransferRequestInput.destinationBranchId },
        select: { name: true },
      });

      if (!destinationBranch) {
        throw new NotFoundException(
          `Destination branch with ID ${createTransferRequestInput.destinationBranchId} not found`,
        );
      }

      // Create the transfer request
      const transferRequest = await this.prisma.transferRequest.create({
        data: {
          member: { connect: { id: createTransferRequestInput.memberId } },
          memberName: `${member.firstName} ${member.lastName}`,
          sourceBranch: {
            connect: { id: createTransferRequestInput.sourceBranchId },
          },
          sourceBranchName: sourceBranch.name,
          destinationBranch: {
            connect: { id: createTransferRequestInput.destinationBranchId },
          },
          destinationBranchName: destinationBranch.name,
          requestDate: new Date(),
          status: TransferStatus.PENDING,
          reason: createTransferRequestInput.reason,
          transferData: createTransferRequestInput.transferData,
        },
      });

      return transferRequest as unknown as TransferRequest;
    } catch (error) {
      this.logger.error(
        `Error creating transfer request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(
    filterInput?: TransferRequestFilterInput,
    paginationInput?: PaginationInput,
  ): Promise<PaginatedTransferRequests> {
    try {
      const { skip = 0, take = 10 } = paginationInput || {};

      const where = {
        ...(filterInput?.memberId && { memberId: filterInput.memberId }),
        ...(filterInput?.sourceBranchId && {
          sourceBranchId: filterInput.sourceBranchId,
        }),
        ...(filterInput?.destinationBranchId && {
          destinationBranchId: filterInput.destinationBranchId,
        }),
        ...(filterInput?.status && { status: filterInput.status }),
      };

      const [items, totalCount] = await Promise.all([
        this.prisma.transferRequest.findMany({
          where,
          skip,
          take,
          orderBy: { requestDate: 'desc' },
        }),
        this.prisma.transferRequest.count({ where }),
      ]);

      return {
        items: items as unknown as TransferRequest[],
        hasNextPage: skip + take < totalCount,
        totalCount,
      };
    } catch (error) {
      this.logger.error(
        `Error finding transfer requests: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<TransferRequest> {
    try {
      const transferRequest = await this.prisma.transferRequest.findUnique({
        where: { id },
      });

      if (!transferRequest) {
        throw new NotFoundException(`Transfer request with ID ${id} not found`);
      }

      return transferRequest as unknown as TransferRequest;
    } catch (error) {
      this.logger.error(
        `Error finding transfer request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    updateTransferRequestInput: UpdateTransferRequestInput,
  ): Promise<TransferRequest> {
    try {
      const { id, status, rejectionReason } = updateTransferRequestInput;

      // Check if transfer request exists
      const existingTransferRequest =
        await this.prisma.transferRequest.findUnique({
          where: { id },
        });

      if (!existingTransferRequest) {
        throw new NotFoundException(`Transfer request with ID ${id} not found`);
      }

      const updateData: any = {};

      if (status) {
        updateData.status = status;

        // Set appropriate date fields based on status
        if (status === TransferStatus.APPROVED) {
          updateData.approvedDate = new Date();
        } else if (status === TransferStatus.REJECTED) {
          updateData.rejectedDate = new Date();
          updateData.rejectionReason = rejectionReason;
        } else if (status === TransferStatus.COMPLETED) {
          updateData.completedDate = new Date();

          // If status is COMPLETED, update the member's branch
          await this.prisma.member.update({
            where: { id: existingTransferRequest.memberId },
            data: { branchId: existingTransferRequest.destinationBranchId },
          });
        }
      }

      const updatedTransferRequest = await this.prisma.transferRequest.update({
        where: { id },
        data: updateData,
      });

      return updatedTransferRequest as unknown as TransferRequest;
    } catch (error) {
      this.logger.error(
        `Error updating transfer request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      // Check if transfer request exists
      const existingTransferRequest =
        await this.prisma.transferRequest.findUnique({
          where: { id },
        });

      if (!existingTransferRequest) {
        throw new NotFoundException(`Transfer request with ID ${id} not found`);
      }

      // Delete the transfer request
      await this.prisma.transferRequest.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Error removing transfer request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
