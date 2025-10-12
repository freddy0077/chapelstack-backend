import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ConversationService } from '../services/conversation.service';
import {
  CreateConversationInput,
  SendMessageInput,
  GetMessagesInput,
  MarkAsReadInput,
  AddParticipantsInput,
  GetConversationsInput,
  ConversationDto,
  ConversationsResponse,
  ConversationMessageDto,
  MessagesResponse,
  UnreadCountResponse,
  MessageReadReceiptDto,
  ConversationParticipantDto,
} from '../dto/conversation.dto';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) {}

  @Mutation(() => ConversationDto)
  async createConversation(
    @Args('input') input: CreateConversationInput,
    @Context() context: any,
  ): Promise<ConversationDto> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    return this.conversationService.createConversation({
      ...input,
      createdById: userId,
    }) as any;
  }

  @Query(() => ConversationsResponse)
  async getConversations(
    @Args('input', { nullable: true }) input: GetConversationsInput,
    @Context() context: any,
  ): Promise<ConversationsResponse> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    return this.conversationService.getUserConversations(userId, input) as any;
  }

  @Query(() => ConversationDto)
  async getConversation(
    @Args('conversationId') conversationId: string,
    @Context() context: any,
  ): Promise<ConversationDto> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    return this.conversationService.getConversation(conversationId, userId) as any;
  }

  @Mutation(() => ConversationMessageDto)
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @Context() context: any,
  ): Promise<ConversationMessageDto> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    return this.conversationService.sendMessage({
      ...input,
      senderId: userId,
    }) as any;
  }

  @Query(() => MessagesResponse)
  async getMessages(
    @Args('input') input: GetMessagesInput,
    @Context() context: any,
  ): Promise<MessagesResponse> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    return this.conversationService.getMessages(
      input.conversationId,
      userId,
      {
        skip: input.skip,
        take: input.take,
        before: input.before,
      },
    ) as any;
  }

  @Mutation(() => [MessageReadReceiptDto])
  async markMessagesAsRead(
    @Args('input') input: MarkAsReadInput,
    @Context() context: any,
  ): Promise<MessageReadReceiptDto[]> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    return this.conversationService.markAsRead(
      input.conversationId,
      userId,
      input.messageIds,
    ) as any;
  }

  @Mutation(() => [ConversationParticipantDto])
  async addParticipants(
    @Args('input') input: AddParticipantsInput,
    @Context() context: any,
  ): Promise<ConversationParticipantDto[]> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    return this.conversationService.addParticipants(
      input.conversationId,
      input.userIds,
      userId,
    ) as any;
  }

  @Mutation(() => Boolean)
  async leaveConversation(
    @Args('conversationId') conversationId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    await this.conversationService.leaveConversation(conversationId, userId);
    return true;
  }

  @Mutation(() => ConversationDto)
  async archiveConversation(
    @Args('conversationId') conversationId: string,
    @Context() context: any,
  ): Promise<ConversationDto> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    return this.conversationService.archiveConversation(conversationId, userId) as any;
  }

  @Query(() => UnreadCountResponse)
  async getUnreadCount(
    @Args('organisationId', { nullable: true }) organisationId: string,
    @Context() context: any,
  ): Promise<UnreadCountResponse> {
    const userId = context.req.user.userId || context.req.user.sub;
    
    const count = await this.conversationService.getUnreadCount(userId, organisationId);
    return { count };
  }
}
