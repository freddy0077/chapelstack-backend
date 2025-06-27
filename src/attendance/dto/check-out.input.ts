import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType('AttendanceCheckOutInput')
export class CheckOutInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  recordId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  checkOutTime?: Date;
}
