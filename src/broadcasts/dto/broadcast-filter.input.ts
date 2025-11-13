import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class BroadcastFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  organisationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string; // 'SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED'

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  platform?: string; // 'ZOOM', 'FACEBOOK', 'INSTAGRAM'
}
