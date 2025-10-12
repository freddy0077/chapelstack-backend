import { InputType, Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min } from 'class-validator';
import { ConversationStatus, MessageChannelType } from '@prisma/client';

// Input DTOs
@InputType()
export class CreateConversationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subject?: string;

  @Field()
  @IsString()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field(() => [String])
  @IsArray()
  participantIds: string[];
}

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  conversationId: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(MessageChannelType)
  messageType?: MessageChannelType;
}

@InputType()
export class GetMessagesInput {
  @Field()
  @IsString()
  conversationId: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;

  @Field({ nullable: true })
  @IsOptional()
  before?: Date;
}

@InputType()
export class MarkAsReadInput {
  @Field()
  @IsString()
  conversationId: string;

  @Field(() => [String])
  @IsArray()
  messageIds: string[];
}

@InputType()
export class AddParticipantsInput {
  @Field()
  @IsString()
  conversationId: string;

  @Field(() => [String])
  @IsArray()
  userIds: string[];
}

@InputType()
export class GetConversationsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organisationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}

// Output DTOs
@ObjectType()
export class UserInfo {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  email: string;
}

@ObjectType()
export class ConversationParticipantDto {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => UserInfo)
  user: UserInfo;

  @Field()
  joinedAt: Date;

  @Field({ nullable: true })
  leftAt?: Date;

  @Field({ nullable: true })
  lastReadAt?: Date;

  @Field()
  role: string;
}

@ObjectType()
export class MessageAttachmentDto {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  fileUrl: string;

  @Field(() => Int)
  fileSize: number;

  @Field()
  mimeType: string;

  @Field()
  scanStatus: string;
}

@ObjectType()
export class MessageReadReceiptDto {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => UserInfo)
  user: UserInfo;

  @Field()
  readAt: Date;
}

@ObjectType()
export class ConversationMessageDto {
  @Field(() => ID)
  id: string;

  @Field()
  conversationId: string;

  @Field()
  senderId: string;

  @Field(() => UserInfo)
  sender: UserInfo;

  @Field()
  content: string;

  @Field()
  messageType: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  readAt?: Date;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field()
  createdAt: Date;

  @Field(() => [MessageAttachmentDto], { nullable: true })
  attachments?: MessageAttachmentDto[];

  @Field(() => [MessageReadReceiptDto], { nullable: true })
  readReceipts?: MessageReadReceiptDto[];
}

@ObjectType()
export class ConversationDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  subject?: string;

  @Field()
  organisationId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  lastMessageAt?: Date;

  @Field(() => [ConversationParticipantDto])
  participants: ConversationParticipantDto[];

  @Field(() => [ConversationMessageDto], { nullable: true })
  messages?: ConversationMessageDto[];

  @Field(() => Int, { nullable: true })
  messageCount?: number;
}

@ObjectType()
export class ConversationsResponse {
  @Field(() => [ConversationDto])
  conversations: ConversationDto[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class MessagesResponse {
  @Field(() => [ConversationMessageDto])
  messages: ConversationMessageDto[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class UnreadCountResponse {
  @Field(() => Int)
  count: number;
}
