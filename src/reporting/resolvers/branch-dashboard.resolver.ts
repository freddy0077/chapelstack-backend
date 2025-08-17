import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { BranchDashboardService } from '../services/branch-dashboard.service';
import { BranchDashboardDataDto } from '../entities/branch-dashboard-data.entity';

@Resolver(() => BranchDashboardDataDto)
export class BranchDashboardResolver {
  constructor(
    private readonly branchDashboardService: BranchDashboardService,
  ) {}

  @Query(() => BranchDashboardDataDto, { name: 'branchDashboard' })
  async getBranchDashboard(
    @Args('branchId', { type: () => ID }) branchId: string,
  ): Promise<BranchDashboardDataDto> {
    // The service already returns the correct shape for the DTO
    return this.branchDashboardService.getBranchDashboardData(branchId) as any;
  }
}
