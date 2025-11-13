import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsEmail, IsBoolean, IsEnum, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class UpdateEmailSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  smtpHost?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  smtpPort?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  smtpUsername?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  smtpPassword?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['NONE', 'SSL', 'TLS'])
  smtpEncryption?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fromEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fromName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (value === '' ? undefined : value))
  replyToEmail?: string;
}

@InputType()
export class SendTestEmailInput {
  @Field()
  @IsEmail()
  toEmail: string;
}
