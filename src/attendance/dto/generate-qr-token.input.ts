import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsOptional, IsInt, Min } from 'class-validator';

@InputType()
export class GenerateQRTokenInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInMinutes?: number = 60; // Default 1 hour
}
