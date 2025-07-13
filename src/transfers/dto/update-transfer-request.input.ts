import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransferStatus } from '../entities/transfer-request.entity';

@InputType()
export class UpdateTransferRequestInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => TransferStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
