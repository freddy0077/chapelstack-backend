import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';
import { IsValidEnum } from '../../common/utils/enum-validation.util';

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  link?: string;

  @Field(() => NotificationType)
  @IsValidEnum(NotificationType)
  type: NotificationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
