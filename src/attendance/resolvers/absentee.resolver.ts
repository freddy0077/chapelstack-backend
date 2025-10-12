import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AbsenteeService } from '../services/absentee.service';
import {
  AbsenteeInfo,
  AbsenteeFiltersInput,
  SendAbsenteeMessageInput,
  AbsenteeMessageResult,
  MultiWeekAbsentee,
} from '../dto/absentee.dto';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AbsenteeResolver {
  constructor(private readonly absenteeService: AbsenteeService) {}

  @Query(() => [AbsenteeInfo])
  async getAbsentees(
    @Args('organisationId') organisationId: string,
    @Args('branchId') branchId: string,
    @Args('eventId', { nullable: true }) eventId?: string,
    @Args('attendanceSessionId', { nullable: true }) attendanceSessionId?: string,
    @Args('filters', { nullable: true }) filters?: AbsenteeFiltersInput,
  ): Promise<AbsenteeInfo[]> {
    return this.absenteeService.getAbsentees({
      organisationId,
      branchId,
      eventId,
      attendanceSessionId,
      filters,
    });
  }

  @Query(() => [MultiWeekAbsentee])
  async getMultiWeekAbsentees(
    @Args('organisationId') organisationId: string,
    @Args('branchId') branchId: string,
    @Args('weeks') weeks: number,
  ): Promise<MultiWeekAbsentee[]> {
    return this.absenteeService.getMultiWeekAbsentees(
      organisationId,
      branchId,
      weeks,
    );
  }

  @Mutation(() => AbsenteeMessageResult)
  async sendAbsenteeMessage(
    @Args('input') input: SendAbsenteeMessageInput,
    @CurrentUser() user: any,
  ): Promise<AbsenteeMessageResult> {
    return this.absenteeService.sendAbsenteeMessage({
      ...input,
      userId: user.id,
    });
  }
}
