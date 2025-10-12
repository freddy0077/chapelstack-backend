import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CommunicationsGateway } from '../gateways/communications.gateway';
import {
  ConversationStatus,
  ParticipantRole,
  MessageChannelType,
  MessageStatus,
} from '@prisma/client';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: CommunicationsGateway,
  ) {}

  // Create a new conversation
  async createConversation(input: {
    subject?: string;
    organisationId: string;
    branchId?: string;
    participantIds: string[];
    createdById: string;
  }) {
    const { subject, organisationId, branchId, participantIds, createdById } = input;

    // Create conversation with participants
    const conversation = await this.prisma.conversation.create({
      data: {
        subject,
        organisationId,
        branchId,
        participants: {
          create: participantIds.map((userId, index) => ({
            userId,
            role: userId === createdById ? ParticipantRole.ADMIN : ParticipantRole.MEMBER,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Notify all participants
    participantIds.forEach((userId) => {
      this.gateway.notifyUser(userId, 'conversation:created', conversation);
    });

    return conversation;
  }

  // Get conversations for a user
  async getUserConversations(
    userId: string,
    filters?: {
      organisationId?: string;
      branchId?: string;
      status?: ConversationStatus;
      skip?: number;
      take?: number;
    },
  ) {
    const { organisationId, branchId, status, skip = 0, take = 20 } = filters || {};

    const where: any = {
      participants: {
        some: {
          userId,
          leftAt: null, // Only active participants
        },
      },
    };

    if (organisationId) where.organisationId = organisationId;
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          participants: {
            where: { leftAt: null },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      conversations,
      total,
      hasMore: skip + take < total,
    };
  }

  // Get a single conversation
  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            attachments: true,
            readReceipts: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId && !p.leftAt,
    );

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return conversation;
  }

  // Send a message in a conversation
  async sendMessage(input: {
    conversationId: string;
    senderId: string;
    content: string;
    messageType?: MessageChannelType;
  }) {
    const { conversationId, senderId, content, messageType = MessageChannelType.IN_APP } = input;

    // Verify user is a participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: senderId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Create message
    const message = await this.prisma.conversationMessage.create({
      data: {
        conversationId,
        senderId,
        content,
        messageType,
        status: MessageStatus.SENT,
        deliveredAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update conversation's lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Notify all participants via WebSocket
    this.gateway.notifyNewMessage(conversationId, message);

    return message;
  }

  // Get messages in a conversation with pagination
  async getMessages(
    conversationId: string,
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      before?: Date;
    },
  ) {
    const { skip = 0, take = 50, before } = options || {};

    // Verify user is a participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const where: any = { conversationId };
    if (before) {
      where.createdAt = { lt: before };
    }

    const [messages, total] = await Promise.all([
      this.prisma.conversationMessage.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          attachments: true,
          readReceipts: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.conversationMessage.count({ where }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      total,
      hasMore: skip + take < total,
    };
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string, messageIds: string[]) {
    // Verify user is a participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Create read receipts
    const readReceipts = await Promise.all(
      messageIds.map((messageId) =>
        this.prisma.messageReadReceipt.upsert({
          where: {
            messageId_userId: {
              messageId,
              userId,
            },
          },
          create: {
            messageId,
            userId,
          },
          update: {
            readAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      ),
    );

    // Update participant's lastReadAt
    await this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    // Notify conversation about read receipts
    this.gateway.notifyMessageRead(conversationId, {
      userId,
      messageIds,
      readAt: new Date(),
    });

    return readReceipts;
  }

  // Add participants to conversation
  async addParticipants(
    conversationId: string,
    userIds: string[],
    addedBy: string,
  ) {
    // Verify addedBy is an admin participant
    const adminParticipant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: addedBy,
        role: ParticipantRole.ADMIN,
        leftAt: null,
      },
    });

    if (!adminParticipant) {
      throw new ForbiddenException('Only admins can add participants');
    }

    // Add new participants
    const participants = await Promise.all(
      userIds.map((userId) =>
        this.prisma.conversationParticipant.create({
          data: {
            conversationId,
            userId,
            role: ParticipantRole.MEMBER,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      ),
    );

    // Notify new participants
    userIds.forEach((userId) => {
      this.gateway.notifyUser(userId, 'conversation:added', {
        conversationId,
        addedBy,
      });
    });

    return participants;
  }

  // Leave conversation
  async leaveConversation(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new NotFoundException('You are not a participant in this conversation');
    }

    // Mark as left
    await this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { leftAt: new Date() },
    });

    // Notify other participants
    this.gateway.notifyNewMessage(conversationId, {
      type: 'system',
      content: `User left the conversation`,
      userId,
    });

    return { success: true };
  }

  // Archive conversation
  async archiveConversation(conversationId: string, userId: string) {
    // Verify user is an admin participant
    const adminParticipant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        role: ParticipantRole.ADMIN,
        leftAt: null,
      },
    });

    if (!adminParticipant) {
      throw new ForbiddenException('Only admins can archive conversations');
    }

    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: ConversationStatus.ARCHIVED },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  // Get unread message count
  async getUnreadCount(userId: string, organisationId?: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        ...(organisationId && { organisationId }),
        participants: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
      include: {
        participants: {
          where: { userId },
          select: { lastReadAt: true },
        },
        messages: {
          select: {
            createdAt: true,
            senderId: true,
          },
        },
      },
    });

    let totalUnread = 0;

    conversations.forEach((conv) => {
      const lastReadAt = conv.participants[0]?.lastReadAt;
      const unreadMessages = conv.messages.filter(
        (msg) =>
          msg.senderId !== userId &&
          (!lastReadAt || msg.createdAt > lastReadAt),
      );
      totalUnread += unreadMessages.length;
    });

    return totalUnread;
  }
}
