import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ChatMessage, MessageType } from '@repo/types';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessageSchema {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: Object.values(MessageType) })
  messageType: MessageType;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ChatMessageSchemaFactory =
  SchemaFactory.createForClass(ChatMessageSchema);

// Create indexes for better performance
ChatMessageSchemaFactory.index({ userId: 1, timestamp: -1 });
ChatMessageSchemaFactory.index({ sessionId: 1, timestamp: -1 });
