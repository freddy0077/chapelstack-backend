import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('ChildCheckOutInput')
export class CheckOutInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  checkInRecordId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  checkedOutById: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  guardianIdAtCheckOut: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
