import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PrayerRequestsService } from './prayer-requests.service';
import { PrayerRequest } from './prayer-request.entity';
import { CreatePrayerRequestInput } from './dto/create-prayer-request.input';
import { UpdatePrayerRequestInput } from './dto/update-prayer-request.input';
import { PrayerRequestStatusEnum } from './prayer-request-status.enum';

@Resolver(() => PrayerRequest)
export class PrayerRequestsResolver {
  constructor(private readonly service: PrayerRequestsService) {}

  @Mutation(() => PrayerRequest)
  createPrayerRequest(@Args('data') data: CreatePrayerRequestInput) {
    return this.service.create(data);
  }

  @Query(() => [PrayerRequest])
  prayerRequests(
    @Args('branchId', { type: () => String, nullable: true }) branchId?: string,
    @Args('status', { type: () => PrayerRequestStatusEnum, nullable: true })
    status?: PrayerRequestStatusEnum,
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
  ) {
    return this.service.findAll({ branchId, status, organisationId });
  }

  @Query(() => PrayerRequest)
  prayerRequest(@Args('id', { type: () => ID }) id: string) {
    return this.service.findOne(id);
  }

  @Mutation(() => PrayerRequest)
  updatePrayerRequest(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdatePrayerRequestInput,
  ) {
    return this.service.update(id, data);
  }

  @Mutation(() => PrayerRequest)
  removePrayerRequest(@Args('id', { type: () => ID }) id: string) {
    return this.service.remove(id);
  }
}
