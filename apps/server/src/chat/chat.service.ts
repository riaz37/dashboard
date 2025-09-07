import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatMessage,
  ChatSession,
  MessageType,
  SendMessageDto,
  GetChatHistoryDto,
} from '@repo/types';
import { ChatMessageDocument } from './schemas/chat-message.schema';
import { ChatSessionDocument } from './schemas/chat-session.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('ChatMessage')
    private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel('ChatSession')
    private chatSessionModel: Model<ChatSessionDocument>,
  ) {}

  async createMessage(sendMessageDto: SendMessageDto): Promise<ChatMessage> {
    const { message, userId, sessionId, context } = sendMessageDto;

    // Create or get session
    let session = await this.chatSessionModel.findById(sessionId);
    if (!session) {
      session = await this.createSession(userId);
    }

    // Create message
    const chatMessage = new this.chatMessageModel({
      message,
      messageType: MessageType.USER,
      userId,
      sessionId: session.id,
      metadata: context,
    });

    const saved = await chatMessage.save();

    // Update session message count
    await this.chatSessionModel.findByIdAndUpdate(session.id, {
      $inc: { messageCount: 1 },
      updatedAt: new Date(),
    });

    return this.toChatMessageDto(saved);
  }

  async createSession(userId: string): Promise<ChatSession> {
    const session = new this.chatSessionModel({
      userId,
      title: 'New Chat Session',
    });

    const saved = await session.save();
    return this.toChatSessionDto(saved);
  }

  async getChatHistory(
    getChatHistoryDto: GetChatHistoryDto,
  ): Promise<ChatMessage[]> {
    const { userId, sessionId, limit } = getChatHistoryDto;

    const query: any = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const messages = await this.chatMessageModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit || 50);

    return messages.map((msg) => this.toChatMessageDto(msg)).reverse();
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const sessions = await this.chatSessionModel
      .find({ userId, isActive: true })
      .sort({ updatedAt: -1 });

    return sessions.map((session) => this.toChatSessionDto(session));
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    // Mark session as inactive
    await this.chatSessionModel.findByIdAndUpdate(sessionId, {
      isActive: false,
    });

    // Optionally delete messages (or keep for history)
    // await this.chatMessageModel.deleteMany({ sessionId });
  }

  async saveAIMessage(
    message: string,
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>,
  ): Promise<ChatMessage> {
    const chatMessage = new this.chatMessageModel({
      message,
      messageType: MessageType.AI,
      userId,
      sessionId,
      metadata,
    });

    const saved = await chatMessage.save();

    // Update session message count
    await this.chatSessionModel.findByIdAndUpdate(sessionId, {
      $inc: { messageCount: 1 },
      updatedAt: new Date(),
    });

    return this.toChatMessageDto(saved);
  }

  private toChatMessageDto(message: ChatMessageDocument): ChatMessage {
    return {
      id: message._id.toString(),
      message: message.message,
      messageType: message.messageType,
      userId: message.userId,
      sessionId: message.sessionId,
      timestamp: message.timestamp,
      metadata: message.metadata,
    };
  }

  private toChatSessionDto(session: ChatSessionDocument): ChatSession {
    return {
      id: session._id.toString(),
      userId: session.userId,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messageCount,
      isActive: session.isActive,
    };
  }
}
