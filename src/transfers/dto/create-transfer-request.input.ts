import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TransferDataType } from '../entities/transfer-request.entity';

@InputType()
export class CreateTransferRequestInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  sourceBranchId: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  destinationBranchId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  reason: string;

  @Field(() => [TransferDataType])
  @IsArray()
  @IsEnum(TransferDataType, { each: true })
  transferData: TransferDataType[];
}
