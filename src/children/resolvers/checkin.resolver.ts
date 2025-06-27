import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CheckinService } from '../services/checkin.service';
import { CheckInRecord } from '../entities/check-in-record.entity';
import { CheckInInput } from '../dto/check-in.input';
import { CheckOutInput } from '../dto/check-out.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { CheckInStatsOutput } from '../dto/checkin-stats.dto';

@Resolver(() => CheckInRecord)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class CheckinResolver {
  constructor(private readonly checkinService: CheckinService) {}

  @Mutation(() => CheckInRecord)
  @RequirePermissions({ action: 'create', subject: 'CheckInRecord' })
  checkInChild(
    @Args('input') checkInInput: CheckInInput,
  ): Promise<CheckInRecord> {
    return this.checkinService.checkIn(checkInInput);
  }

  @Mutation(() => CheckInRecord)
  @RequirePermissions({ action: 'update', subject: 'CheckInRecord' })
  checkOutChild(
    @Args('input') checkOutInput: CheckOutInput,
  ): Promise<CheckInRecord> {
    return this.checkinService.checkOut(checkOutInput);
  }

  @Query(() => [CheckInRecord], { name: 'activeCheckIns' })
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  findActiveCheckIns(
    @Args('branchId') branchId: string,
    @Args('eventId', { nullable: true }) eventId?: string,
  ): Promise<CheckInRecord[]> {
    return this.checkinService.findActiveCheckIns(branchId, eventId);
  }

  @Query(() => [CheckInRecord], { name: 'checkInHistory' })
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  findCheckInHistory(
    @Args('branchId') branchId: string,
    @Args('dateFrom', { nullable: true, type: () => GraphQLISODateTime })
    dateFrom?: Date,
    @Args('dateTo', { nullable: true, type: () => GraphQLISODateTime })
    dateTo?: Date,
    @Args('childId', { nullable: true }) childId?: string,
    @Args('eventId', { nullable: true }) eventId?: string,
  ): Promise<CheckInRecord[]> {
    return this.checkinService.findCheckInHistory(
      branchId,
      dateFrom,
      dateTo,
      childId,
      eventId,
    );
  }

  @Query(() => CheckInStatsOutput, { name: 'checkInStats' })
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  getCheckInStats(
    @Args('branchId') branchId: string,
    @Args('dateFrom', { nullable: true, type: () => GraphQLISODateTime })
    dateFrom?: Date,
    @Args('dateTo', { nullable: true, type: () => GraphQLISODateTime })
    dateTo?: Date,
  ): Promise<CheckInStatsOutput> {
    return this.checkinService.getCheckInStats(branchId, dateFrom, dateTo);
  }
}
