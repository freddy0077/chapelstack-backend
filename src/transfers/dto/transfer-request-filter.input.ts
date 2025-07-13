import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TransferStatus } from '../entities/transfer-request.entity';

@InputType()
export class TransferRequestFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  sourceBranchId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  destinationBranchId?: string;

  @Field(() => TransferStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;
}
