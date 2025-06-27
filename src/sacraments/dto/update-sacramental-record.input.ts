import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateSacramentalRecordInput } from './create-sacramental-record.input';

@InputType()
export class UpdateSacramentalRecordInput extends PartialType(
  CreateSacramentalRecordInput,
) {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
