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
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat/chat.service';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  ChatWebSocketMessage,
  AnalyticsWebSocketMessage,
  WebSocketMessage,
} from '@repo/types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private analyticsService: AnalyticsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store user connection
      this.connectedUsers.set(client.id, userId);

      // Join user to their personal room
      client.join(`user:${userId}`);

      console.log(`✅ User ${userId} connected via WebSocket`);

      // Send connection confirmation
      client.emit('connected', {
        type: 'connection',
        data: { userId, connected: true },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      console.log(`🔌 User ${userId} disconnected from WebSocket`);
    }
  }

  @SubscribeMessage('chat_message')
  async handleChatMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      const { message, sessionId } = data;

      // Save message to database
      const savedMessage = await this.chatService.createMessage({
        message,
        userId,
        sessionId,
      });

      // Broadcast to user's room
      this.server.to(`user:${userId}`).emit('chat_message', {
        type: 'chat_message',
        data: savedMessage,
        timestamp: new Date(),
      });

      // Here you would typically call the AI service to get a response
      // For now, we'll simulate an AI response
      setTimeout(async () => {
        const aiResponse = await this.chatService.saveAIMessage(
          `I received your message: "${message}". This is a simulated AI response.`,
          userId,
          sessionId,
        );

        this.server.to(`user:${userId}`).emit('chat_response', {
          type: 'chat_response',
          data: aiResponse,
          timestamp: new Date(),
        });
      }, 1000);
    } catch (error) {
      console.error('Chat message error:', error);
      client.emit('error', { message: 'Failed to process chat message' });
    }
  }

  @SubscribeMessage('analytics_query')
  async handleAnalyticsQuery(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      const { query, timeRange } = data;

      // Get analytics data
      const analyticsData = await this.analyticsService.getAnalyticsData(
        userId,
        {
          timeRange: timeRange || '7d',
        },
      );

      // Send analytics response
      this.server.to(`user:${userId}`).emit('analytics_response', {
        type: 'analytics_response',
        data: {
          query,
          analyticsData,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Analytics query error:', error);
      client.emit('error', { message: 'Failed to process analytics query' });
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      const { room } = data;
      client.join(room);

      client.emit('room_joined', {
        type: 'room_joined',
        data: { room, userId },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Join room error:', error);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      const { room } = data;
      client.leave(room);

      client.emit('room_left', {
        type: 'room_left',
        data: { room, userId },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Leave room error:', error);
      client.emit('error', { message: 'Failed to leave room' });
    }
  }

  // Method to broadcast analytics updates to specific users
  async broadcastAnalyticsUpdate(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('analytics_update', {
      type: 'analytics_update',
      data,
      timestamp: new Date(),
    });
  }

  // Method to broadcast chat updates to specific users
  async broadcastChatUpdate(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('chat_update', {
      type: 'chat_update',
      data,
      timestamp: new Date(),
    });
  }

  // Method to broadcast to all connected users
  async broadcastToAll(type: string, data: any) {
    this.server.emit(type, {
      type,
      data,
      timestamp: new Date(),
    });
  }
}
