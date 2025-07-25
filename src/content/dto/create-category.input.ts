import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;
}
