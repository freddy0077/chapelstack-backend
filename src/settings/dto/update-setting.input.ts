import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateSettingInput } from './create-setting.input';

@InputType()
export class UpdateSettingInput extends PartialType(CreateSettingInput) {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  // id is not in CreateSettingInput, so it's defined here and is now optional for updates
  id?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID() // Align with CreateSettingInput, branchId should be a UUID if provided
  // branchId is made explicitly nullable here to allow unsetting it or setting to null.
  // CreateSettingInput has branchId as optional string, PartialType makes it string | undefined.
  // We want string | null | undefined for updates.
  branchId?: string | null;

  // key and value are inherited from CreateSettingInput via PartialType
  // and will be optional. No need to redefine them unless their type or decorators change.
}
