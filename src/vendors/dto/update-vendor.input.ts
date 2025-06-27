import { CreateVendorInput } from './create-vendor.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateVendorInput extends PartialType(CreateVendorInput) {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
