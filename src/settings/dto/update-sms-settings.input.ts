import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';

@InputType()
export class UpdateSmsSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['TWILIO', 'AFRICAS_TALKING', 'TERMII'])
  provider?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  apiSecret?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  senderId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

@InputType()
export class SendTestSmsInput {
  @Field()
  @IsString()
  toPhoneNumber: string;
}
