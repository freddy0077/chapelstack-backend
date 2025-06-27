import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateEventInput } from './create-event.input';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateEventInput extends PartialType(CreateEventInput) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsUUID(undefined, { message: 'Event ID must be a valid UUID' })
  id: string;
}
