import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, GetChatHistoryDto, ApiResponse } from '@repo/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  async createMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const message = await this.chatService.createMessage({
        ...sendMessageDto,
        userId: req.user.id,
      });

      return {
        success: true,
        data: message,
        message: 'Message created successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getChatHistory(
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: number,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const messages = await this.chatService.getChatHistory({
        userId: req.user.id,
        sessionId,
        limit,
      });

      return {
        success: true,
        data: messages,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  async createSession(@Request() req): Promise<ApiResponse<any>> {
    try {
      const session = await this.chatService.createSession(req.user.id);

      return {
        success: true,
        data: session,
        message: 'Chat session created successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@Request() req): Promise<ApiResponse<any>> {
    try {
      const sessions = await this.chatService.getUserSessions(req.user.id);

      return {
        success: true,
        data: sessions,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Post('sessions/:sessionId/delete')
  @UseGuards(JwtAuthGuard)
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @Request() req,
  ): Promise<ApiResponse<void>> {
    try {
      await this.chatService.deleteSession(sessionId, req.user.id);

      return {
        success: true,
        message: 'Session deleted successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('health')
  async health(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { status: 'healthy', service: 'chat' },
      timestamp: new Date(),
    };
  }
}
