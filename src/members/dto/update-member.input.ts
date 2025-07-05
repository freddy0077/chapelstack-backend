import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsOptional, IsUrl } from 'class-validator';
import { CreateMemberInput } from './create-member.input';

@InputType()
export class UpdateMemberInput extends PartialType(CreateMemberInput) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'Profile image URL must be a valid URL with protocol' },
  )
  profileImageUrl?: string;
}
