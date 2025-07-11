import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ForgotPasswordInput {
  @Field(() => String)
  email: string;
}
