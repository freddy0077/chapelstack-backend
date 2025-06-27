import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogInput } from '../dto/create-audit-log.input';
import { AuditLogFilterInput } from '../dto/audit-log-filter.input';
import { PaginationInput } from '../../common/dto/pagination.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Resolver(() => AuditLog)
@UseGuards(GqlAuthGuard, RolesGuard)
export class AuditLogResolver {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Mutation(() => AuditLog)
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  createAuditLog(@Args('input') createAuditLogInput: CreateAuditLogInput) {
    return this.auditLogService.create(createAuditLogInput);
  }

  @Query(() => AuditLog, { name: 'auditLog' })
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.auditLogService.findOne(id);
  }

  @Query(() => [AuditLog], { name: 'auditLogs' })
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  findAll(
    @Args('pagination', { nullable: true })
    paginationInput: PaginationInput = { skip: 0, take: 10 },
    @Args('filter', { nullable: true }) filterInput?: AuditLogFilterInput,
  ) {
    return this.auditLogService.findAll(paginationInput, filterInput);
  }
}
