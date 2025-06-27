import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { GraphQLUpload, FileUpload } from 'graphql-upload';

@InputType()
export class InitialSettingsInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  organizationName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  organizationDescription?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @Field({ nullable: true })
  @IsUrl({}, { message: 'Please provide a valid website URL' })
  @IsOptional()
  websiteUrl?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  logo?: Promise<FileUpload>;
}
