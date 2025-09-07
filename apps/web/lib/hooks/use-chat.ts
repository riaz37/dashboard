'use client';

import { useEffect, useCallback } from 'react';
import { useChatStore, useAuthStore } from '@/lib/store';
import { ChatBusinessService } from '@/lib/services/chat.service';
import { SendMessageDto } from '@repo/types';

export function useChat() {
  const { user } = useAuthStore();
  const {
    currentSession,
    sessions,
    messages,
    isConnected,
    setConnected,
  } = useChatStore();

  const loadSessions = useCallback(async () => {
    const result = await ChatBusinessService.loadSessions();
    return result;
  }, []);

  const createSession = useCallback(async () => {
    const result = await ChatBusinessService.createSession();
    return result;
  }, []);

  const sendMessage = useCallback(async (data: SendMessageDto) => {
    const result = await ChatBusinessService.sendMessage(data);
    return result;
  }, []);

  const loadHistory = useCallback(async (sessionId: string, userId: string, limit?: number) => {
    const result = await ChatBusinessService.loadHistory(sessionId, userId, limit);
    return result;
  }, []);

  const switchSession = useCallback(async (sessionId: string) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    const result = await ChatBusinessService.switchSession(sessionId, user.id);
    return result;
  }, [user?.id]);

  const deleteSession = useCallback(async (sessionId: string) => {
    const result = await ChatBusinessService.deleteSession(sessionId);
    return result;
  }, []);

  const clearSessionMessages = useCallback((sessionId: string) => {
    ChatBusinessService.clearSessionMessages(sessionId);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Get current session messages
  const currentMessages = currentSession ? messages[currentSession.id] || [] : [];

  return {
    currentSession,
    sessions,
    messages: currentMessages,
    isConnected,
    loadSessions,
    createSession,
    sendMessage,
    loadHistory,
    switchSession,
    deleteSession,
    clearSessionMessages,
    setConnected,
  };
}
