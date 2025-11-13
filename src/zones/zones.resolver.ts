import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { ZonesService } from './zones.service';
import {
  Zone,
  CreateZoneInput,
  UpdateZoneInput,
  ZoneStats,
} from './dto/zone.dto';

@Resolver(() => Zone)
@UseGuards(GqlAuthGuard)
export class ZonesResolver {
  constructor(private readonly zonesService: ZonesService) {}

  @Mutation(() => Zone)
  async createZone(
    @Args('input', { type: () => CreateZoneInput }) input: CreateZoneInput,
  ): Promise<Zone> {
    console.log('Resolver received input:', JSON.stringify(input, null, 2));
    console.log('Input type:', typeof input);
    console.log('Input keys:', Object.keys(input));
    console.log('Input name:', input?.name);
    console.log('Input organisationId:', input?.organisationId);
    return this.zonesService.createZone(input);
  }

  @Query(() => [Zone])
  async zones(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<Zone[]> {
    return this.zonesService.getZones(organisationId, branchId);
  }

  @Query(() => Zone)
  async zone(@Args('id') id: string): Promise<Zone> {
    return this.zonesService.getZoneById(id);
  }

  @Mutation(() => Zone)
  async updateZone(
    @Args('id') id: string,
    @Args('input', { type: () => UpdateZoneInput }) input: UpdateZoneInput,
  ): Promise<Zone> {
    console.log('UpdateZone resolver received:', { id, input: JSON.stringify(input, null, 2) });
    return this.zonesService.updateZone(id, input);
  }

  @Mutation(() => Zone)
  async deleteZone(@Args('id') id: string): Promise<Zone> {
    return this.zonesService.deleteZone(id);
  }

  @Query(() => ZoneStats)
  async zoneStats(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<ZoneStats> {
    return this.zonesService.getZoneStats(organisationId, branchId);
  }
}
