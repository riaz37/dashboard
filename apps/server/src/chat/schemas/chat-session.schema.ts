import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ChatSession } from '@repo/types';

export type ChatSessionDocument = ChatSession & Document;

@Schema({ timestamps: true })
export class ChatSessionSchema {
  @Prop({ required: true })
  userId: string;

  @Prop()
  title?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: 0 })
  messageCount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ChatSessionSchemaFactory =
  SchemaFactory.createForClass(ChatSessionSchema);

// Create indexes for better performance
ChatSessionSchemaFactory.index({ userId: 1, createdAt: -1 });
ChatSessionSchemaFactory.index({ isActive: 1 });
