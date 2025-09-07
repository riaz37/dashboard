import { api } from '../api/client';
import { 
  ChatMessage,
  SendMessageDto,
  GetChatHistoryDto,
  ChatSession,
  ApiResponse 
} from '@repo/types';

export class ChatService {
  static async sendMessage(data: SendMessageDto): Promise<ApiResponse<ChatMessage>> {
    const response = await api.post('/chat/messages', data);
    return response.data;
  }

  static async getHistory(params: GetChatHistoryDto): Promise<ApiResponse<ChatMessage[]>> {
    const response = await api.get('/chat/history', { params });
    return response.data;
  }

  static async createSession(): Promise<ApiResponse<ChatSession>> {
    const response = await api.post('/chat/sessions');
    return response.data;
  }

  static async getSessions(): Promise<ApiResponse<ChatSession[]>> {
    const response = await api.get('/chat/sessions');
    return response.data;
  }

  static async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/chat/sessions/${sessionId}/delete`);
    return response.data;
  }

  // Server-side methods for SSR
  static async getHistorySSR(
    params: GetChatHistoryDto,
    accessToken?: string
  ): Promise<ApiResponse<ChatMessage[]>> {
    const response = await api.get('/chat/history', {
      params,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  }

  static async getSessionsSSR(accessToken?: string): Promise<ApiResponse<ChatSession[]>> {
    const response = await api.get('/chat/sessions', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  }
}
