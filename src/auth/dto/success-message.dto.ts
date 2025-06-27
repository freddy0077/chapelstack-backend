import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('SuccessMessage')
export class SuccessMessageDto {
  @Field(() => String)
  message: string;
}
