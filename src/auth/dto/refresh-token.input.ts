import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class RefreshTokenInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  refreshToken: string;
}
