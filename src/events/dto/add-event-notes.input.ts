import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class AddEventNotesInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsUUID(undefined, { message: 'Event ID must be a valid UUID' })
  eventId: string;

  @Field()
  @IsNotEmpty({ message: 'Post-event notes are required' })
  @IsString({ message: 'Post-event notes must be a string' })
  @MaxLength(10000, {
    message: 'Post-event notes cannot exceed 10,000 characters',
  })
  postEventNotes: string;
}
