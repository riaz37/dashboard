import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { ChatModule } from '../chat/chat.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [ChatModule, AnalyticsModule],
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
