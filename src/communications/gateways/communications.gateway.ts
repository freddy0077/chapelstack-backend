import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'communications',
})
export class CommunicationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CommunicationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(
          `Client ${client.id} connection rejected: No token provided`,
        );
        client.disconnect();
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(
          `Client ${client.id} connection rejected: Invalid token`,
        );
        client.disconnect();
        return;
      }

      // Store user-socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Store userId in socket data for later use
      client.data.userId = userId;

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);

      // Notify user of successful connection
      client.emit('connected', { userId, socketId: client.id });
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}:`,
        error.message,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);

        // Clean up empty sets
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }

    this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
  }

  // Join a conversation room
  @SubscribeMessage('conversation:join')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId } = data;
    client.join(`conversation:${conversationId}`);
    this.logger.log(
      `Client ${client.id} joined conversation ${conversationId}`,
    );

    return { event: 'conversation:joined', data: { conversationId } };
  }

  // Leave a conversation room
  @SubscribeMessage('conversation:leave')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId } = data;
    client.leave(`conversation:${conversationId}`);
    this.logger.log(`Client ${client.id} left conversation ${conversationId}`);

    return { event: 'conversation:left', data: { conversationId } };
  }

  // Typing indicator
  @SubscribeMessage('conversation:typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const { conversationId, isTyping } = data;

    // Broadcast to others in the conversation
    client.to(`conversation:${conversationId}`).emit('conversation:typing', {
      conversationId,
      userId,
      isTyping,
    });
  }

  // Send message to conversation participants
  notifyNewMessage(conversationId: string, message: any) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit('message:new', message);
    this.logger.log(
      `New message notification sent to conversation ${conversationId}`,
    );
  }

  // Notify specific user(s) about message delivery status
  notifyMessageDelivered(userId: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('message:delivered', data);
      });
      this.logger.log(`Delivery notification sent to user ${userId}`);
    }
  }

  // Notify about message read status
  notifyMessageRead(conversationId: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:read', data);
    this.logger.log(`Read notification sent to conversation ${conversationId}`);
  }

  // Broadcast to specific user across all their connections
  notifyUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
      this.logger.log(`Event '${event}' sent to user ${userId}`);
    }
  }

  // Broadcast to multiple users
  notifyUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => this.notifyUser(userId, event, data));
  }

  // Get online status
  isUserOnline(userId: string): boolean {
    const userSocketSet = this.userSockets.get(userId);
    return (
      this.userSockets.has(userId) &&
      userSocketSet !== undefined &&
      userSocketSet.size > 0
    );
  }

  // Get all online users
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Get connection count for a user
  getUserConnectionCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
}
