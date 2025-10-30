import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class PostJournalEntryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}
