import { Resolver, Query, Mutation, Args, ID, Int, Context } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { BirthRegistryService } from '../services/birth-registry.service';
import {
  CreateBirthRegistryInput,
  UpdateBirthRegistryInput,
  BirthRegistryFiltersInput,
  UploadDocumentInput,
} from '../dto/birth-registry.input';
import {
  BirthRegistry,
  BirthRegistryStats,
  BirthRegistryCalendarEntry,
  ParentMember,
} from '../entities/birth-registry.entity';

@Resolver(() => BirthRegistry)
@UseGuards(GqlAuthGuard, RolesGuard)
export class BirthRegistryResolver {
  private readonly logger = new Logger(BirthRegistryResolver.name);

  constructor(private readonly birthRegistryService: BirthRegistryService) {}

  @Mutation(() => BirthRegistry)
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF')
  async createBirthRegistry(
    @Args('createBirthRegistryInput')
    createBirthRegistryInput: CreateBirthRegistryInput,
    @Context() context: any,
  ): Promise<BirthRegistry> {
    const { user, req } = context;
    const userId = user?.sub;
    const ipAddress = req?.ip;
    const userAgent = req?.headers?.['user-agent'];

    this.logger.log(
      `Creating birth registry for child: ${createBirthRegistryInput.childFirstName} ${createBirthRegistryInput.childLastName}`,
    );

    return this.birthRegistryService.create(
      createBirthRegistryInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => [BirthRegistry], { name: 'birthRegistries' })
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF', 'MINISTRY_LEADER')
  async findAllBirthRegistries(
    @Args('organisationId', { type: () => ID }) organisationId: string,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
    @Args('filters', { nullable: true }) filters?: BirthRegistryFiltersInput,
  ): Promise<BirthRegistry[]> {
    this.logger.log(
      `Fetching birth registries for organization: ${organisationId}, branch: ${branchId}`,
    );

    return this.birthRegistryService.findAll(organisationId, branchId, filters);
  }

  @Query(() => BirthRegistry, { name: 'birthRegistry' })
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF', 'MINISTRY_LEADER')
  async findOneBirthRegistry(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<BirthRegistry> {
    this.logger.log(`Fetching birth registry with ID: ${id}`);

    return this.birthRegistryService.findOne(id);
  }

  @Mutation(() => BirthRegistry)
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF')
  async updateBirthRegistry(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateBirthRegistryInput')
    updateBirthRegistryInput: UpdateBirthRegistryInput,
    @Context() context: any,
  ): Promise<BirthRegistry> {
    const { user, req } = context;
    const userId = user?.sub;
    const ipAddress = req?.ip;
    const userAgent = req?.headers?.['user-agent'];

    this.logger.log(`Updating birth registry with ID: ${id}`);

    return this.birthRegistryService.update(
      id,
      updateBirthRegistryInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  // @Roles('ADMIN', 'BRANCH_ADMIN')
  async removeBirthRegistry(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const { user, req } = context;
    const userId = user?.sub;
    const ipAddress = req?.ip;
    const userAgent = req?.headers?.['user-agent'];

    this.logger.log(`Deleting birth registry with ID: ${id}`);

    return this.birthRegistryService.remove(id, userId, ipAddress, userAgent);
  }

  @Query(() => BirthRegistryStats, { name: 'birthRegistryStatistics' })
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF', 'MINISTRY_LEADER')
  async getBirthRegistryStatistics(
    @Args('organisationId', { type: () => ID }) organisationId: string,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ): Promise<BirthRegistryStats> {
    this.logger.log(
      `Fetching birth registry statistics for organization: ${organisationId}, branch: ${branchId}`,
    );

    return this.birthRegistryService.getStatistics(organisationId, branchId);
  }

  @Query(() => [BirthRegistryCalendarEntry], { name: 'birthRegistryCalendar' })
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF', 'MINISTRY_LEADER')
  async getBirthRegistryCalendar(
    @Args('organisationId', { type: () => ID }) organisationId: string,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
    @Args('month', { type: () => Int, nullable: true }) month?: number,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
  ): Promise<BirthRegistryCalendarEntry[]> {
    this.logger.log(
      `Fetching birth registry calendar for organization: ${organisationId}, branch: ${branchId}, month: ${month}, year: ${year}`,
    );

    return this.birthRegistryService.getCalendarEntries(
      organisationId,
      branchId,
      month,
      year,
    );
  }

  @Query(() => [ParentMember], { name: 'searchMembersForParents' })
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF')
  async searchMembersForParents(
    @Args('organisationId', { type: () => ID }) organisationId: string,
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('query', { type: () => String }) query: string,
    @Args('skip', { type: () => Number, nullable: true, defaultValue: 0 })
    skip?: number,
    @Args('take', { type: () => Number, nullable: true, defaultValue: 10 })
    take?: number,
  ): Promise<ParentMember[]> {
    this.logger.log(`Searching members for parents with query: ${query}`);

    return this.birthRegistryService.searchMembersForParents(
      organisationId,
      branchId,
      query,
      skip,
      take,
    );
  }

  @Mutation(() => BirthRegistry)
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF')
  async uploadBirthRegistryDocument(
    @Args('uploadDocumentInput') uploadDocumentInput: UploadDocumentInput,
    @Context() context: any,
  ): Promise<BirthRegistry> {
    const { user, req } = context;
    const userId = user?.sub;
    const ipAddress = req?.ip;
    const userAgent = req?.headers?.['user-agent'];

    this.logger.log(
      `Uploading document for birth registry: ${uploadDocumentInput.birthRegistryId}`,
    );

    return this.birthRegistryService.uploadDocument(
      uploadDocumentInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => BirthRegistry)
  // @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF')
  async scheduleBaptism(
    @Args('birthRegistryId', { type: () => ID }) birthRegistryId: string,
    @Args('baptismDate', { type: () => String }) baptismDate: string,
    @Context() context: any,
    @Args('baptismLocation', { type: () => String, nullable: true })
    baptismLocation?: string,
    @Args('baptismOfficiant', { type: () => String, nullable: true })
    baptismOfficiant?: string,
    @Args('baptismEventId', { type: () => ID, nullable: true })
    baptismEventId?: string,
  ): Promise<BirthRegistry> {
    const { user, req } = context;
    const userId = user?.sub;
    const ipAddress = req?.ip;
    const userAgent = req?.headers?.['user-agent'];

    this.logger.log(
      `Scheduling baptism for birth registry: ${birthRegistryId}`,
    );

    const updateInput: UpdateBirthRegistryInput = {
      baptismPlanned: true,
      baptismDate,
      baptismLocation,
      baptismOfficiant,
      baptismEventId,
    };

    return this.birthRegistryService.update(
      birthRegistryId,
      updateInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => BirthRegistry)
  @Roles('ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF')
  async completeBaptism(
    @Args('birthRegistryId', { type: () => ID }) birthRegistryId: string,
    @Args('baptismDate', { type: () => String }) baptismDate: string,
    @Args('baptismLocation', { type: () => String }) baptismLocation: string,
    @Args('baptismOfficiant', { type: () => String }) baptismOfficiant: string,
    @Context() context: any,
    @Args('baptismEventId', { type: () => ID, nullable: true })
    baptismEventId?: string,
  ): Promise<BirthRegistry> {
    const { user, req } = context;
    const userId = user?.sub;
    const ipAddress = req?.ip;
    const userAgent = req?.headers?.['user-agent'];

    this.logger.log(
      `Completing baptism for birth registry: ${birthRegistryId}`,
    );

    const updateInput: UpdateBirthRegistryInput = {
      baptismPlanned: true,
      baptismDate,
      baptismLocation,
      baptismOfficiant,
      baptismEventId,
    };

    return this.birthRegistryService.update(
      birthRegistryId,
      updateInput,
      userId,
      ipAddress,
      userAgent,
    );
  }
}
