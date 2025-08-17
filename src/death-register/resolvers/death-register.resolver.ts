import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { DeathRegisterService } from '../services/death-register.service';
import {
  DeathRegister,
  DeathRegisterStats,
  MemorialDate,
} from '../entities/death-register.entity';
import {
  CreateDeathRegisterInput,
  UpdateDeathRegisterInput,
  DeathRegisterFilterInput,
  UploadDeathDocumentInput,
} from '../dto/death-register.input';

@Resolver(() => DeathRegister)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class DeathRegisterResolver {
  constructor(private readonly deathRegisterService: DeathRegisterService) {}

  @Mutation(() => DeathRegister)
  // @Permissions({ action: 'create', subject: 'DeathRegister' })
  async createDeathRegister(
    @Args('input') createDeathRegisterInput: CreateDeathRegisterInput,
    @CurrentUser() user: User,
  ): Promise<DeathRegister> {
    return this.deathRegisterService.create(createDeathRegisterInput, user.id);
  }

  @Query(() => [DeathRegister], { name: 'deathRegisters' })
  // @Permissions({ action: 'read', subject: 'DeathRegister' })
  async findAll(
    @Args('filter', { nullable: true }) filter?: DeathRegisterFilterInput,
  ): Promise<DeathRegister[]> {
    return this.deathRegisterService.findAll(filter);
  }

  @Query(() => DeathRegister, { name: 'deathRegister' })
  // @Permissions({ action: 'read', subject: 'DeathRegister' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeathRegister> {
    return this.deathRegisterService.findOne(id);
  }

  @Query(() => DeathRegister, { name: 'deathRegisterByMember', nullable: true })
  // @Permissions({ action: 'read', subject: 'DeathRegister' })
  async findByMember(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<DeathRegister | null> {
    return this.deathRegisterService.findByMember(memberId);
  }

  @Mutation(() => DeathRegister)
  // @Permissions({ action: 'update', subject: 'DeathRegister' })
  async updateDeathRegister(
    @Args('input') updateDeathRegisterInput: UpdateDeathRegisterInput,
    @CurrentUser() user: User,
  ): Promise<DeathRegister> {
    return this.deathRegisterService.update(
      updateDeathRegisterInput.id,
      updateDeathRegisterInput,
      user.id,
    );
  }

  @Mutation(() => Boolean)
  // @Permissions({ action: 'delete', subject: 'DeathRegister' })
  async removeDeathRegister(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.deathRegisterService.remove(id);
  }

  @Mutation(() => DeathRegister)
  // @Permissions({ action: 'update', subject: 'DeathRegister' })
  async markFamilyNotified(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<DeathRegister> {
    return this.deathRegisterService.markFamilyNotified(id, user.id);
  }

  @Mutation(() => DeathRegister)
  // @Permissions({ action: 'update', subject: 'DeathRegister' })
  async uploadDeathDocument(
    @Args('input') uploadDocumentInput: UploadDeathDocumentInput,
    @CurrentUser() user: User,
  ): Promise<DeathRegister> {
    return this.deathRegisterService.uploadDocument(uploadDocumentInput, user.id);
  }

  @Query(() => DeathRegisterStats, { name: 'deathRegisterStats' })
  // @Permissions({ action: 'read', subject: 'DeathRegister' })
  async getStatistics(
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
    @Args('branchId', { type: () => ID, nullable: true })
    branchId?: string,
  ): Promise<DeathRegisterStats> {
    return this.deathRegisterService.getStatistics(organisationId, branchId);
  }

  @Query(() => [MemorialDate], { name: 'memorialCalendar' })
  // @Permissions({ action: 'read', subject: 'DeathRegister' })
  async getMemorialCalendar(
    @Args('year', { type: () => Int }) year: number,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
    @Args('branchId', { type: () => ID, nullable: true })
    branchId?: string,
  ): Promise<MemorialDate[]> {
    return this.deathRegisterService.getMemorialCalendar(
      year,
      organisationId,
      branchId,
    );
  }
}
