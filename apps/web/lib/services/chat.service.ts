import { ChatService } from '@/lib/api/chat.service';
import { SendMessageDto } from '@repo/types';
import { useChatStore } from '@/lib/store';

export class ChatBusinessService {
  static async sendMessage(data: SendMessageDto) {
    try {
      const response = await ChatService.sendMessage(data);
      
      if (response.success && response.data && data.sessionId) {
        // Add message to store
        useChatStore.getState().addMessage(data.sessionId, response.data);
        return { success: true, message: response.data };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send message' 
      };
    }
  }

  static async createSession() {
    try {
      const response = await ChatService.createSession();
      
      if (response.success && response.data) {
        const session = response.data;
        useChatStore.getState().setCurrentSession(session);
        useChatStore.getState().setMessages(session.id, []);
        return { success: true, session };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create session' 
      };
    }
  }

  static async loadSessions() {
    try {
      const response = await ChatService.getSessions();
      
      if (response.success && response.data) {
        useChatStore.getState().setSessions(response.data);
        return { success: true, sessions: response.data };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load sessions' 
      };
    }
  }

  static async loadHistory(sessionId: string, userId: string, limit = 50) {
    try {
      const response = await ChatService.getHistory({ sessionId, userId, limit });
      
      if (response.success && response.data) {
        useChatStore.getState().setMessages(sessionId, response.data);
        return { success: true, messages: response.data };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load history' 
      };
    }
  }

  static async deleteSession(sessionId: string) {
    try {
      const response = await ChatService.deleteSession(sessionId);
      
      if (response.success) {
        // Remove from store
        const { sessions, currentSession } = useChatStore.getState();
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        useChatStore.getState().setSessions(updatedSessions);
        
        // Clear current session if it's the deleted one
        if (currentSession?.id === sessionId) {
          useChatStore.getState().setCurrentSession(null);
        }
        
        return { success: true };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete session' 
      };
    }
  }

  static async switchSession(sessionId: string, userId: string) {
    const { sessions } = useChatStore.getState();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      useChatStore.getState().setCurrentSession(session);
      
      // Load messages if not already loaded
      const { messages } = useChatStore.getState();
      if (!messages[sessionId]) {
        await this.loadHistory(sessionId, userId);
      }
      
      return { success: true, session };
    }
    
    return { success: false, error: 'Session not found' };
  }

  static clearSessionMessages(sessionId: string) {
    useChatStore.getState().clearMessages(sessionId);
  }

  static formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  }
}
