import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import {
  ChatMessageSchema,
  ChatMessageSchemaFactory,
} from './schemas/chat-message.schema';
import {
  ChatSessionSchema,
  ChatSessionSchemaFactory,
} from './schemas/chat-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ChatMessage', schema: ChatMessageSchemaFactory },
      { name: 'ChatSession', schema: ChatSessionSchemaFactory },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
