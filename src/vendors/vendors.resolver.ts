import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { VendorsService } from './vendors.service';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorInput } from './dto/create-vendor.input';
import { UpdateVendorInput } from './dto/update-vendor.input';

@Resolver(() => Vendor)
export class VendorsResolver {
  constructor(private readonly vendorsService: VendorsService) {}

  @Mutation(() => Vendor)
  createVendor(
    @Args('createVendorInput') createVendorInput: CreateVendorInput,
  ) {
    return this.vendorsService.create(createVendorInput);
  }

  @Query(() => [Vendor], { name: 'vendors' })
  findAll(
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
  ) {
    return this.vendorsService.findAll(organisationId);
  }

  @Query(() => Vendor, { name: 'vendor' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.vendorsService.findOne(id);
  }

  @Mutation(() => Vendor)
  updateVendor(
    @Args('updateVendorInput') updateVendorInput: UpdateVendorInput,
  ) {
    return this.vendorsService.update(updateVendorInput.id, updateVendorInput);
  }

  @Mutation(() => Vendor)
  removeVendor(@Args('id', { type: () => String }) id: string) {
    return this.vendorsService.remove(id);
  }
}
